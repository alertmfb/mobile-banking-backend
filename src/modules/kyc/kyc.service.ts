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

@Injectable()
export class KycService {
  private readonly logger: Logger;
  constructor(
    @Inject('KycProvider')
    private readonly kycProvider: KycProvider,
    private readonly kycRepository: KycRepository,
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger = new Logger(KycService.name);
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
      if (!response || !response.data.entity) {
        throw new HttpException(
          ErrorMessages.COULD_NOT_VERIFY_NIN +
            `Reason: ${response.data.message}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const kyc = await this.kycRepository.getByUserId(userId);
      kyc.ninStatus = true;
      await this.kycRepository.updateKycByUserId(userId, kyc);
      return await this.kycRepository.getByUserId(userId);
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
      const response = await this.kycProvider.individualAddress(payload);
      if (!response || !response.data.entity) {
        throw new HttpException(
          ErrorMessages.COULD_NOT_ADDRESS + `Reason: ${response.data.message}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      const kyc = await this.kycRepository.getByUserId(userId);
      kyc.residentialAddressStatus = true;
      await this.kycRepository.updateKycByUserId(userId, kyc);
      return await this.kycRepository.getByUserId(userId);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async businessDocument(userId: string, payload: any) {
    console.log(payload);
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
      kyc.attestation = true;
      await this.kycRepository.updateKycByUserId(userId, kyc);
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
