import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BeneficiaryRepository } from './beneficiary.repository';
import { GetAllBeneficiaryQueryDto } from './dto/get-all-beneficiary-query.dto';
import { UserService } from '../user/user.service';
import { ErrorMessages } from '../../shared/enums/error.message.enum';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { Beneficiary } from '@prisma/client';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto';

@Injectable()
export class BeneficiaryService {
  constructor(
    private readonly beneficiaryRepository: BeneficiaryRepository,
    private readonly userService: UserService,
  ) {}

  async create(userId: string, payload: CreateBeneficiaryDto) {
    try {
      const { beneficiaryType } = payload;
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      console.log('payload', payload);
      let benExist: Beneficiary;
      if (beneficiaryType == 'TRANSFER') {
        benExist = await this.beneficiaryRepository.getOneForUserWhere(userId, {
          accountNumber: payload.accountNumber,
          bankCode: payload.bankCode,
        });
        console.log('benExist', benExist);
      }

      if (beneficiaryType == 'AIRTIME' || beneficiaryType == 'DATA') {
        benExist = await this.beneficiaryRepository.getOneForUserWhere(userId, {
          phoneNumber: payload.phoneNumber,
          networkProvider: payload.networkProvider,
        });
      }

      if (beneficiaryType == 'TV_BILL') {
        benExist = await this.beneficiaryRepository.getOneForUserWhere(userId, {
          tvCardNumber: payload.tvCardNumber,
          tvProvider: payload.tvProvider,
        });
      }

      if (benExist) {
        benExist.isBeneficiary = true;
        return await this.beneficiaryRepository.update(
          userId,
          benExist.id,
          benExist,
        );
      }

      return await this.beneficiaryRepository.create({
        user: { connect: { id: userId } },
        beneficiaryType: payload.beneficiaryType,
        bankName: payload.bankName,
        accountName: payload.accountName,
        bankCode: payload.bankCode,
        accountNumber: payload.accountNumber,
        phoneNumber: payload.phoneNumber,
        networkProvider: payload.networkProvider,
        tvProvider: payload.tvProvider,
        tvCardNumber: payload.tvCardNumber,
        tvCardName: payload.tvCardName,
        isBeneficiary: !payload.isBeneficiary ? true : payload.isBeneficiary,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(userId: string, id: string, payload: UpdateBeneficiaryDto) {
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      const beneficiary = await this.beneficiaryRepository.getOneForUser(
        userId,
        id,
      );
      if (!beneficiary) {
        throw new HttpException(
          ErrorMessages.BENEFICIARY_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      return await this.beneficiaryRepository.update(userId, id, payload);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async makeBeneficiary(userId: string, id: string) {
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      const beneficiary = await this.beneficiaryRepository.getOneForUser(
        userId,
        id,
      );
      if (!beneficiary) {
        throw new HttpException(
          ErrorMessages.BENEFICIARY_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      beneficiary.isBeneficiary = true;
      return await this.beneficiaryRepository.update(userId, id, beneficiary);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAll(userId: string, query: GetAllBeneficiaryQueryDto) {
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      return await this.beneficiaryRepository.getAll(userId, query);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getOne(userId: string, id: string) {
    try {
      return await this.beneficiaryRepository.getOneForUser(userId, id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(userId: string, id: string) {
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      const beneficiary = await this.beneficiaryRepository.getOneForUser(
        userId,
        id,
      );
      if (!beneficiary) {
        throw new HttpException(
          ErrorMessages.BENEFICIARY_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      return await this.beneficiaryRepository.delete(userId, id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
