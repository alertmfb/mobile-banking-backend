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
  toLowerCase,
} from 'src/utils/helpers';
import { MessagingService } from '../messaging/messaging-service.interface';
import { ConfigService } from '@nestjs/config';
import { VerifyBvnOtpDto } from './dto/verify-bvn-otp.dto';
import { Prisma, Relationship } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AccountCreateEvent } from '../account/events/account-create.event';
import { Events } from 'src/shared/enums/events.enum';
import { StorageService } from '../storage/storage-service.interface';
import { CreateNextOfKinDto } from './dto/next-of-kin.dto';

@Injectable()
export class KycService {
  private readonly logger: Logger;
  private readonly environment: string;
  private testBvn = '22222222222';
  constructor(
    @Inject('KycProvider')
    private readonly kycProvider: KycProvider,
    @Inject('MessagingProvider')
    private readonly messagingService: MessagingService,
    @Inject('StorageProvider')
    private readonly storageService: StorageService,
    private readonly kycRepository: KycRepository,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger = new Logger(KycService.name);
    this.environment = this.configService.get<string>('APP_ENV');
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
        this.environment == 'production'
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

      // Check if BVN already exists
      const bvnStr = encrypt(bvn);
      const bvnLookUp = await this.userService.bvnLookup(bvnStr);
      if (bvnLookUp) {
        throw new HttpException(
          ErrorMessages.BVN_ALREADY_EXISTS,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate BVN against user's details
      // Validate BVN against user's details
      const bvnToUse = this.environment == 'production' ? bvn : this.testBvn;
      const response = await this.kycProvider.bvnValidate({
        bvn: bvnToUse,
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
      // if (lastNameStatus && firstNameStatus && dobStatus) {
      //   const lookUpResponse = await this.kycProvider.bvnLookupAdvanced({
      //     bvn: bvnToUse,
      //   });
      //   if (!lookUpResponse || !lookUpResponse.entity) {
      //     throw new HttpException(
      //       ErrorMessages.COULD_NOT_VERIFY_BVN,
      //       HttpStatus.BAD_REQUEST,
      //     );
      //   }

      //   // Change BVN status to true
      //   const kyc = await this.kycRepository.getByUserId(userId);
      //   if (!kyc) {
      //     await this.kycRepository.createKyc({
      //       user: { connect: { id: user.id } },
      //       bvnStatus: true,
      //     });
      //   } else {
      //     await this.kycRepository.updateKycByUserId(userId, {
      //       bvnStatus: true,
      //     });
      //   }

      //   // store or update the kyc details
      //   const kycDetails = await this.kycRepository.getKycUserDetails(userId);
      //   if (kycDetails) {
      //     await this.kycRepository.updateKycUserDetailsByUserId(userId, {
      //       phoneOne: lookUpResponse.entity.phone_number1,
      //       phoneTwo: lookUpResponse.entity.phone_number2,
      //       email: toLowerCase(lookUpResponse.entity.email),
      //       residentialAddress: lookUpResponse.entity.residential_address,
      //       residentialLga: lookUpResponse.entity.lga_of_residence,
      //       residentialState: lookUpResponse.entity.state_of_residence,
      //       originLga: lookUpResponse.entity.lga_of_origin,
      //       originState: lookUpResponse.entity.state_of_origin,
      //       title: lookUpResponse.entity.title,
      //       maritalStatus: lookUpResponse.entity.marital_status,
      //     });
      //   } else {
      //     await this.kycRepository.createKycUserDetails({
      //       user: { connect: { id: user.id } },
      //       phoneOne: lookUpResponse.entity.phone_number1,
      //       phoneTwo: lookUpResponse.entity.phone_number2,
      //       email: toLowerCase(lookUpResponse.entity.email),
      //       residentialAddress: lookUpResponse.entity.residential_address,
      //       residentialLga: lookUpResponse.entity.lga_of_residence,
      //       residentialState: lookUpResponse.entity.state_of_residence,
      //       originLga: lookUpResponse.entity.lga_of_origin,
      //       originState: lookUpResponse.entity.state_of_origin,
      //       title: lookUpResponse.entity.title,
      //       maritalStatus: lookUpResponse.entity.marital_status,
      //     });
      //   }

      //   // Update user and KYB details
      //   await this.userService.update(user.id, {
      //     bvnLookup: encrypt(bvn),
      //     gender: lookUpResponse.entity.gender
      //       ? lookUpResponse.entity.gender.toUpperCase()
      //       : 'OTHER',
      //   });
      //   return await this.kycRepository.getByUserId(userId);
      // }

      // Send OTP for further BVN verification
      const lookupResponse = await this.kycProvider.bvnLookupAdvanced({
        bvn: bvnToUse,
      });
      const bvnPhone = lookupResponse?.entity?.phone_number1;
      const bvnEmail = lookupResponse?.entity?.email;

      if (!bvnPhone) {
        throw new HttpException(
          ErrorMessages.PHONE_NUMBER_NOT_FOUND,
          HttpStatus.BAD_REQUEST,
        );
      }

      // prepare phone or email to send OTP
      const phoneOrEmailToSendOtp =
        this.environment === 'production'
          ? bvnPhone || bvnEmail
          : user.phoneNumber || user.email;

      const otp = Math.floor(100000 + Math.random() * 900000);
      const otpExpire = new Date(new Date().getTime() + 60 * 60 * 1000);
      const messageToSend = `Your verification code is ${otp}. Valid for 1 hour`;

      console.log('phoneOrEmailToSendOtp', phoneOrEmailToSendOtp);

      let otpResponse: any;
      if (phoneOrEmailToSendOtp.includes('@')) {
        otpResponse = await this.messagingService.sendEmailToken({
          email_address: phoneOrEmailToSendOtp,
          code: otp.toString(),
        });
      } else {
        // call messaging servide to send OTP
        otpResponse = await this.messagingService.sendSms(
          toSmsNo(phoneOrEmailToSendOtp),
          messageToSend,
        );

        if (!otpResponse) {
          throw new HttpException(
            ErrorMessages.COULD_NOT_SEND_OTP,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }

      // Update user with OTP details
      Object.assign(user, {
        otp: otp.toString(),
        otpExpires: otpExpire,
        bvnLookup: encrypt(bvn),
      });

      await this.userService.update(user.id, user);

      const message = `OTP has been sent to your phone number ending with ${obfuscatePhoneNumber(bvnPhone)}`;

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

      // Verify BVN and OTP\
      const bvnToUse = this.environment == 'production' ? bvn : this.testBvn;
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

      const lookUpResponse = await this.kycProvider.bvnLookupAdvanced({
        bvn: bvnToUse,
      });
      if (!lookUpResponse || !lookUpResponse.entity) {
        throw new HttpException(
          ErrorMessages.COULD_NOT_VERIFY_BVN,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Update user with retrieved details
      const { first_name, last_name, date_of_birth, middle_name, gender } =
        lookUpResponse.entity;
      user.firstName =
        this.environment == 'production' ? first_name : user.firstName;
      user.lastName =
        this.environment == 'production' ? last_name : user.lastName;
      user.dob = formatBvnDate(date_of_birth).toString();
      user.otherName = middle_name;
      user.gender = gender.toUpperCase();
      // Update the user after verification
      await this.userService.update(user.id, user);

      const kycDetails = await this.kycRepository.getKycUserDetails(userId);
      if (kycDetails) {
        await this.kycRepository.updateKycUserDetailsByUserId(userId, {
          phoneOne: lookUpResponse.entity.phone_number1,
          phoneTwo: lookUpResponse.entity.phone_number2,
          email: toLowerCase(lookUpResponse.entity.email),
          residentialAddress: lookUpResponse.entity.residential_address,
          residentialLga: lookUpResponse.entity.lga_of_residence,
          residentialState: lookUpResponse.entity.state_of_residence,
          originLga: lookUpResponse.entity.lga_of_origin,
          originState: lookUpResponse.entity.state_of_origin,
          title: lookUpResponse.entity.title,
          maritalStatus: lookUpResponse.entity.marital_status,
        });
      } else {
        await this.kycRepository.createKycUserDetails({
          user: { connect: { id: user.id } },
          phoneOne: lookUpResponse.entity.phone_number1,
          phoneTwo: lookUpResponse.entity.phone_number2,
          email: toLowerCase(lookUpResponse.entity.email),
          residentialAddress: lookUpResponse.entity.residential_address,
          residentialLga: lookUpResponse.entity.lga_of_residence,
          residentialState: lookUpResponse.entity.state_of_residence,
          originLga: lookUpResponse.entity.lga_of_origin,
          originState: lookUpResponse.entity.state_of_origin,
          title: lookUpResponse.entity.title,
          maritalStatus: lookUpResponse.entity.marital_status,
        });
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

      const kyc = await this.kycRepository.getByUserId(userId);

      if (!kyc || !kyc.bvnStatus) {
        throw new HttpException(
          ErrorMessages.BVN_IS_A_MUST_BEFORE_FACE,
          HttpStatus.BAD_REQUEST,
        );
      }

      const response = await this.kycProvider.bvnFaceMatch({
        bvn:
          this.environment == 'production'
            ? decrypt(user.bvnLookup)
            : '22222222222',
        selfie_image: image,
      });
      if (!response || !response.entity) {
        throw new HttpException(
          ErrorMessages.COULD_NOT_VERIFY_FACE +
            `Reason: ${response.data.message}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      const { match } = response.entity.selfie_verification;

      if (!match) {
        throw new HttpException(
          ErrorMessages.FACE_DOES_NOT_MATCH,
          HttpStatus.BAD_REQUEST,
        );
      }
      kyc.faceVerifyStatus = true;
      await this.kycRepository.updateKycByUserId(userId, kyc);
      return await this.kycRepository.getByUserId(userId);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async residentialAddress(userId: string, payload: ResidentialAddressDto) {
    try {
      // Find the user
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      // Check if the residential address already exists
      const residentialAddress =
        await this.kycRepository.getResidentialAddress(userId);

      // Upload photos if they exist
      const streetPhoto = payload.streetPhoto
        ? await this.storageService.uploadBase64File(
            payload.streetPhoto,
            'buildings',
          )
        : null;

      const buildingPhoto = payload.buildingPhoto
        ? await this.storageService.uploadBase64File(
            payload.buildingPhoto,
            'buildings',
          )
        : null;

      // Dynamically construct the addressData object with only fields that have values
      const addressData = {
        ...(payload.address && { address: payload.address }),
        ...(payload.city && { city: payload.city }),
        ...(payload.state && { state: payload.state }),
        ...(payload.zipcode && { zipcode: payload.zipcode }),
        ...(payload.landmark && { landmark: payload.landmark }),
        ...(payload.lga && { lga: payload.lga }),
        ...(payload.buildingColour && {
          buildingColour: payload.buildingColour,
        }),
        ...(payload.gateColor && { gateColor: payload.gateColor }),
        ...(payload.buildingType && {
          buildingType: payload.buildingType,
        }),
        ...(payload.occupancyLength && {
          occupancyLength: payload.occupancyLength,
        }),
        ...(payload.identifierName && {
          identifierName: payload.identifierName,
        }),
        ...(payload.identifierRelationship && {
          identifierRelationship: payload.identifierRelationship,
        }),
        ...(payload.otherName && { otherName: payload.otherName }),
        ...(streetPhoto && { streetPhoto }),
        ...(buildingPhoto && { buildingPhoto }),
      };

      // Update or create the residential address
      if (residentialAddress) {
        await this.kycRepository.updateResidentialAddressByUserId(
          userId,
          addressData,
        );
      } else {
        await this.kycRepository.createResidentialAddress({
          user: { connect: { id: user.id } },
          ...addressData,
        });
      }

      // Update the KYC status
      const kyc = await this.kycRepository.getByUserId(userId);
      if (kyc) {
        kyc.residentialAddressSubmitted = true;
        await this.kycRepository.updateKycByUserId(userId, kyc);
      } else {
        await this.kycRepository.createKyc({
          user: { connect: { id: user.id } },
          residentialAddressStatus: false,
          residentialAddressSubmitted: true,
        });
      }

      // Return the updated residential address
      return await this.kycRepository.getResidentialAddress(userId);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async residentialAddressOld(userId: string, payload: ResidentialAddressDto) {
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

      const kyc = await this.kycRepository.getByUserId(userId);
      if (kyc) {
        kyc.residentialAddressSubmitted = true;
        await this.kycRepository.updateKycByUserId(userId, kyc);
      }

      //initiate create account
      this.initiateCreateAccountEvent(userId);

      if (status == 'success') {
        if (!kyc) {
          await this.kycRepository.createKyc({
            user: { connect: { id: user.id } },
            residentialAddressStatus: true,
            residentialAddressSubmitted: true,
          });
        } else {
          kyc.residentialAddressStatus = true;
          await this.kycRepository.updateKycByUserId(userId, kyc);
        }
        return await this.kycRepository.getByUserId(userId);
      }
      return await this.kycRepository.getResidentialAddress(userId);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async nextOfKin(userId: string, payload: CreateNextOfKinDto) {
    try {
      // Find the user
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      // Check if the next of kin already exists
      const nextOfKin = await this.kycRepository.getNextOfKinByUserId(userId);

      // Prepare the data for creating/updating the next of kin
      const nextOfKinData = {
        firstName: payload.firstName,
        lastName: payload.lastName,
        phoneNumber: payload.phoneNumber,
        email: payload.email,
        address: payload.address,
        city: payload.city,
        country: payload.country,
        relationship: payload.relationship as Relationship,
      };

      // Update or create the next of kin
      if (nextOfKin) {
        await this.kycRepository.updateNextOfKinByUserId(userId, nextOfKinData);
      } else {
        await this.kycRepository.createNextOfKin({
          user: { connect: { id: user.id } },
          ...nextOfKinData,
        });
      }

      // Update the KYC status
      const kyc = await this.kycRepository.getByUserId(userId);
      if (kyc) {
        kyc.nextOfKinStatus = true;
        await this.kycRepository.updateKycByUserId(userId, kyc);
      } else {
        await this.kycRepository.createKyc({
          user: { connect: { id: user.id } },
          nextOfKinStatus: true,
        });
      }

      // Return the updated next of kin details
      return await this.kycRepository.getNextOfKinByUserId(userId);
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

  async getKycUserDetails(userId: string) {
    return await this.kycRepository.getKycUserDetails(userId);
  }

  async getManyKycWhereQuery(query: Prisma.KycWhereInput, take: number) {
    return await this.kycRepository.getManyKycWhereQuery(query, take);
  }

  async updateKyc(userId: string, data: Prisma.KycUpdateInput) {
    return await this.kycRepository.updateKycByUserId(userId, data);
  }

  initiateCreateAccountEvent(userId: string) {
    this.logger.log(`Initiating account creation for user ${userId}`);
    const event = new AccountCreateEvent();
    event.userId = userId;
    this.eventEmitter.emit(Events.ON_CREATE_ACCOUNT_NUMBER, event);
  }
}
