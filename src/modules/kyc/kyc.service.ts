import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ResidentialAddressDto } from './dto/residential-address.dto';
import { KycProvider } from './providers/kyc-provider.interface';
import { NationalityDto } from './dto/nationality.dto';
import { KycRepository } from './kyc.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserService } from '../user/user.service';
import { ErrorMessages } from 'src/shared/enums/error.message.enum';
import { BvnDto } from './dto/bvn.dto';
import { NinDto } from './dto/nin.dto';
import { FaceVerifyDto } from './dto/face.dto';
import { AttestDto } from './dto/attest.dto';
import {
  decrypt,
  encrypt,
  toSmsNo,
  obfuscatePhoneNumber,
  formatBvnDate,
  ninIsValid,
} from 'src/utils/helpers';
import { MessagingService } from '../messaging/messaging-service.interface';
import { ConfigService } from '@nestjs/config';
import { VerifyBvnOtpDto } from './dto/verify-bvn-otp.dto';
import { Events } from 'src/shared/enums/events.enum';
import { AccountCreateEvent } from '../account/events/account-create.event';

@Injectable()
export class KycService {
  private readonly logger: Logger;
  private readonly enviroment;
  constructor(
    @Inject('KycProvider')
    private readonly kycProvider: KycProvider,
    @Inject('MessagingProvider')
    private readonly messagingService: MessagingService,
    private readonly kycRepository: KycRepository,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger = new Logger(KycService.name);
    this.enviroment = this.configService.get<string>('APP_ENV');
  }
  async setNationality(userId: string, payload: NationalityDto) {
    try {
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      //update user country
      const { country } = payload;
      user.country = country;
      await await this.userService.update(user.id, user);

      //create or update the kyc nationality status
      const kyc = await this.kycRepository.getByUserId(userId);
      if (!kyc) {
        await this.kycRepository.createKyc({
          user: { connect: { id: user.id } },
          nationalityStatus: true,
        });
      } else {
        await this.kycRepository.updateKycByUserId(userId, {
          nationalityStatus: true,
        });
      }
      return await this.kycRepository.getByUserId(userId);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async retrieveBvnDetails(userId: string) {
    try {
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      const bvn =
        this.enviroment == 'production'
          ? decrypt(user.bvnLookup)
          : '22222222222';
      const response = await this.kycProvider.bvnLooupBasic({ bvn });
      if (!response || !response.entity) {
        throw new HttpException(
          ErrorMessages.COULD_NOT_RETRIEVE_BVN,
          HttpStatus.BAD_REQUEST,
        );
      }

      return {
        bvn,
        firstName: response.entity.first_name,
        lastName: response.entity.last_name,
        otherName: response.entity.middle_name,
        phoneNumber: response.entity.phone_number1,
        image: response.entity.image,
      };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async validateBvn(userId: string, payload: BvnDto) {
    try {
      const { bvn } = payload;

      // Fetch user details
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      // Validate BVN against user's details
      const response = await this.kycProvider.bvnValidate({
        bvn,
        firstName: user.firstName,
        lastName: user.lastName,
        dob: user.dob,
      });

      if (!response?.entity) {
        throw new HttpException(
          ErrorMessages.COULD_NOT_VERIFY_BVN,
          HttpStatus.BAD_REQUEST,
        );
      }

      const { last_name, first_name, date_of_birth } = response.entity;
      const lastNameStatus = last_name?.status;
      const firstNameStatus = first_name?.status;
      const dobStatus = date_of_birth?.status;

      // If BVN validation is successful, approve verification
      if (lastNameStatus && firstNameStatus && dobStatus) {
        const lookUpResponse = await this.kycProvider.bvnLookupAdvanced({
          bvn,
        });
        if (!lookUpResponse || !lookUpResponse.entity) {
          throw new HttpException(
            ErrorMessages.COULD_NOT_VERIFY_BVN,
            HttpStatus.BAD_REQUEST,
          );
        }

        // console.log(lookUpResponse);
        user.bvnLookup = encrypt(bvn);
        user.gender = lookUpResponse.entity.gender
          ? lookUpResponse.entity.gender.toUpperCase()
          : 'OTHER';

        const kyc = await this.kycRepository.getByUserId(userId);
        if (!kyc) {
          await this.kycRepository.createKyc({
            user: { connect: { id: user.id } },
            bvnStatus: true,
          });
        } else {
          kyc.bvnStatus = true;
          // Update user and KYB details
          await Promise.all([
            this.userService.update(user.id, user),
            this.kycRepository.updateKycByUserId(userId, kyc),
          ]);
        }

        //initiate create account number
        if (user.onboardType == 'NEW') {
          console.log('emitting event');
          const createAccount = new AccountCreateEvent();
          createAccount.userId = userId;
          this.eventEmitter.emit(
            Events.ON_CREATE_ACCOUNT_NUMBER,
            createAccount,
          );
        }

        return await this.kycRepository.getByUserId(userId);
      }

      // Send OTP for further BVN verification
      const lookupResponse = await this.kycProvider.bvnLookupAdvanced({ bvn });
      const bvnPhone = lookupResponse?.entity?.phone_number1;
      const bvnEmail = lookupResponse?.entity?.email;

      if (!bvnPhone) {
        throw new HttpException(
          ErrorMessages.PHONE_NUMBER_NOT_FOUND,
          HttpStatus.BAD_REQUEST,
        );
      }

      const otp = Math.floor(100000 + Math.random() * 900000);
      const otpExpire = new Date(new Date().getTime() + 60 * 60 * 1000);
      const messageToSend = `Your verification code is ${otp}. Valid for 1 hour`;

      // call messaging servide to send OTP
      const smsResponse = await this.messagingService.sendSms(
        toSmsNo(bvnPhone),
        messageToSend,
      );

      if (!response) {
        throw new HttpException(
          ErrorMessages.COULD_NOT_SEND_OTP,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const otpId = smsResponse.message_id;
      // Update user with OTP details
      Object.assign(user, {
        otpId,
        otp: otp.toString(),
        otpExpires: otpExpire,
        bvnLookup: encrypt(bvn),
      });

      await this.userService.update(user.id, user);

      const message = `OTP has been sent to your phone number ending with ${obfuscatePhoneNumber(bvnPhone)}`;

      //initiate create account number
      if (user.onboardType == 'NEW') {
        console.log('emitting event');
        const createAccount = new AccountCreateEvent();
        createAccount.userId = userId;
        this.eventEmitter.emit(Events.ON_CREATE_ACCOUNT_NUMBER, createAccount);
      }

      return { bvnPhone, bvnEmail, otp, message, otp_needed: true };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyBvnOtp(userId: string, payload: VerifyBvnOtpDto) {
    try {
      const { otp, bvn } = payload;

      // Fetch user details
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      // Verify BVN and OTP
      const isBvnValid = bvn === decrypt(user.bvnLookup);
      const isOtpValid = otp === user.otp && new Date() <= user.otpExpires;

      if (!isBvnValid || !isOtpValid) {
        const errorMessage = !isBvnValid
          ? ErrorMessages.BVN_MISMATCH
          : ErrorMessages.INVALID_OTP;
        throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
      }

      // Change BVN status to true

      const kyc = await this.kycRepository.getByUserId(userId);

      if (!kyc) {
        await this.kycRepository.createKyc({
          user: { connect: { id: user.id } },
          bvnStatus: true,
        });
      } else {
        kyc.bvnStatus = true;

        // Perform updates in parallel for efficiency
        await this.kycRepository.updateKycByUserId(userId, kyc);
      }

      const lookUpResponse = await this.kycProvider.bvnLookupAdvanced({ bvn });
      if (!lookUpResponse || !lookUpResponse.entity) {
        throw new HttpException(
          ErrorMessages.COULD_NOT_VERIFY_BVN,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Update user with fetched details
      const { first_name, last_name, date_of_birth, middle_name, gender } =
        lookUpResponse.entity;
      user.firstName = first_name;
      user.lastName = last_name;
      user.dob = formatBvnDate(date_of_birth).toString();
      user.otherName = middle_name;
      user.gender = gender.toUpperCase();
      // Update the user after verification
      await this.userService.update(user.id, user);

      //initiate create account number
      if (user.onboardType == 'NEW') {
        console.log('emitting event');
        const createAccount = new AccountCreateEvent();
        createAccount.userId = userId;
        this.eventEmitter.emit(Events.ON_CREATE_ACCOUNT_NUMBER, createAccount);
      }

      return await this.kycRepository.getByUserId(userId);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyBvn(userId: string, payload: BvnDto) {
    try {
      const { bvn } = payload;
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      const response = await this.kycProvider.bvnLooupBasic(bvn);
      if (!response || !response.data.entity) {
        throw new HttpException(
          ErrorMessages.COULD_NOT_VERIFY_BVN,
          HttpStatus.BAD_REQUEST,
        );
      }

      const kyc = await this.kycRepository.getByUserId(userId);
      kyc.bvnStatus = true;
      await this.kycRepository.updateKycByUserId(userId, kyc);
      return await this.kycRepository.getByUserId(userId);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyNin(userId: string, payload: NinDto) {
    try {
      const { nin } = payload;
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      const response = await this.kycProvider.ninLookup(nin);
      if (!response || !response.entity) {
        throw new HttpException(
          ErrorMessages.COULD_NOT_VERIFY_NIN +
            `Reason: ${response.data.message}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (ninIsValid(response.entity, user)) {
        const kyc = await this.kycRepository.getByUserId(userId);
        if (!kyc) {
          await this.kycRepository.createKyc({
            user: { connect: { id: user.id } },
            ninStatus: true,
          });
        } else {
          kyc.ninStatus = true;
          await this.kycRepository.updateKycByUserId(userId, kyc);
        }

        return await this.kycRepository.getByUserId(userId);
      }

      throw new HttpException(
        ErrorMessages.COULD_NOT_VERIFY_NIN,
        HttpStatus.BAD_REQUEST,
      );
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async faceVerify(userId: string, payload: FaceVerifyDto) {
    try {
      const { image } = payload;
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      const response = await this.kycProvider.lineliness(image);
      if (!response || !response.data.entity) {
        throw new HttpException(
          ErrorMessages.COULD_NOT_VERIFY_FACE +
            `Reason: ${response.data.message}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const kyc = await this.kycRepository.getByUserId(userId);
      kyc.faceVerifyStatus = true;
      await this.kycRepository.updateKycByUserId(userId, kyc);
      return await this.kycRepository.getByUserId(userId);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async residentialAddress(userId: string, payload: ResidentialAddressDto) {
    try {
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      const response = await this.kycProvider.individualAddress({
        first_name: user.firstName,
        last_name: user.lastName,
        middle_name: user.otherName,
        dob: user.dob,
        gender: user.gender ? user.gender.toLowerCase() : 'male',
        mobile: user.phoneNumber,
        street: payload.address,
        landmark: payload.landmark,
        lga: payload.lga,
        state: payload.state,
      });
      if (!response || !response.entity) {
        throw new HttpException(
          ErrorMessages.COULD_NOT_ADDRESS + `Reason: ${response.data.message}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      //store the residential address
      const residentialAddress =
        await this.kycRepository.getResidentialAddress(userId);

      const { status, reference_id } = response.entity;

      console.log(status);

      if (residentialAddress) {
        await this.kycRepository.updateResidentialAddressByUserId(userId, {
          address: payload.address,
          landmark: payload.landmark,
          lga: payload.lga,
          state: payload.state,
          city: payload.city,
          zipcode: payload.zipcode,
          addressVerificationStatus: status.toUpperCase(),
          addressVerificationId: reference_id,
        });
      }

      if (!residentialAddress) {
        await this.kycRepository.createResidentialAddress({
          user: { connect: { id: user.id } },
          address: payload.address,
          landmark: payload.landmark,
          lga: payload.lga,
          state: payload.state,
          city: payload.city,
          zipcode: payload.zipcode,
          addressVerificationStatus: status.toUpperCase(),
          addressVerificationId: reference_id,
        });
      }

      if (status == 'success') {
        const kyc = await this.kycRepository.getByUserId(userId);
        if (!kyc) {
          await this.kycRepository.createKyc({
            user: { connect: { id: user.id } },
            residentialAddressStatus: true,
          });
        } else {
          kyc.residentialAddressStatus = true;
          await this.kycRepository.updateKycByUserId(userId, kyc);
        }
        return await this.kycRepository.getByUserId(userId);
      }

      //initiate create account number
      if (user.onboardType == 'NEW') {
        console.log('emitting event');
        const createAccount = new AccountCreateEvent();
        createAccount.userId = userId;
        this.eventEmitter.emit(Events.ON_CREATE_ACCOUNT_NUMBER, createAccount);
      }

      return await this.kycRepository.getResidentialAddress(userId);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async attestation(userId: string, payload: AttestDto) {
    try {
      const { attest } = payload;
      if (!attest) {
        throw new HttpException(
          ErrorMessages.ATTEST_ERROR,
          HttpStatus.BAD_REQUEST,
        );
      }
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      const kyc = await this.kycRepository.getByUserId(userId);
      if (!kyc) {
        throw new HttpException(
          ErrorMessages.KYC_NOT_INITIATED,
          HttpStatus.NOT_FOUND,
        );
      }
      kyc.attestation = true;
      await this.kycRepository.updateKycByUserId(userId, kyc);

      //initiate create account number
      if (user.onboardType == 'NEW') {
        console.log('emitting event');
        const createAccount = new AccountCreateEvent();
        createAccount.userId = userId;
        this.eventEmitter.emit(Events.ON_CREATE_ACCOUNT_NUMBER, createAccount);
      }

      user.kycStatus = 'APPROVED';
      await this.userService.update(user.id, user);
      return await this.kycRepository.getByUserId(userId);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getResidentialAddress(userId: string) {
    return await this.kycRepository.getResidentialAddress(userId);
  }

  async getKyc(userId: string) {
    return await this.kycRepository.getByUserId(userId);
  }
}
