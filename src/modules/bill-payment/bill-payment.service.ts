import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { BillPaymentProvider } from './providers/bill-payment.provider.interface';
import { TransactionService } from '../transaction/transaction.service';
import { UserService } from '../user/user.service';
import { BuyAirtimeDto } from './dtos/buy-airtime.dto';
import { ErrorMessages } from 'src/shared/enums/error.message.enum';
import { GetBundlesDto } from './dtos/get-bundles.dto';
import { BuyInternetDto } from './dtos/buy-internet.dto';
import { ValidateProviderNumberDto } from './dtos/validate-number.dto';
import { BuyCableTvDto } from './dtos/buy-cable-tv.dto';
import { BuyElectricityDto } from './dtos/buy-electricity.dto';
import { BillPaymentRepository } from './bill-payment.repository';
import { validate } from 'class-validator';
import { Prisma } from '@prisma/client';

@Injectable()
export class BillPaymentService {
  constructor(
    @Inject('BillPaymentProvider')
    private readonly billProvider: BillPaymentProvider,
    @Inject(forwardRef(() => TransactionService))
    private readonly transactionService: TransactionService,
    private readonly userService: UserService,
    private readonly billPaymentRepository: BillPaymentRepository,
  ) {}

  async getAirtimeProviders() {
    try {
      return await this.billProvider.getAirtimeCategories();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: string, data: Prisma.BillPaymentsUpdateInput) {
    try {
      return await this.billPaymentRepository.update(id, data);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOneByTransactionId(transactionId: string) {
    try {
      return await this.billPaymentRepository.findOneByTransactionId(
        transactionId,
      );
    } catch (error) {
      console.error(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createAirtimeTransaction(userId: string, data: BuyAirtimeDto) {
    try {
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      return await this.transactionService.createAirtimeTransaction(
        userId,
        data,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getInternetProviders() {
    try {
      return await this.billProvider.getInternetCategories();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getInternetBundles(payload: GetBundlesDto) {
    try {
      const { serviceCategoryId } = payload;
      return await this.billProvider.getInternetPlans(serviceCategoryId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getInternetAmount(payload: GetBundlesDto) {
    try {
      const { serviceCategoryId, bundleCode } = payload;
      const bundles =
        await this.billProvider.getInternetPlans(serviceCategoryId);
      const bundle = bundles.find((b: any) => b.bundleCode === bundleCode);
      if (!bundle) {
        throw new HttpException(
          ErrorMessages.BUNDLE_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      return Number(bundle.amount);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createInternetTransaction(userId: string, data: BuyInternetDto) {
    try {
      return await this.transactionService.createInternetTransaction(
        userId,
        data,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getCableTvProviders() {
    try {
      return await this.billProvider.getCableTvProviders();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getCableTvPlans(payload: GetBundlesDto) {
    try {
      const { serviceCategoryId } = payload;
      return await this.billProvider.getCableTvPlans(serviceCategoryId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async validateCableTvNumber(payload: ValidateProviderNumberDto) {
    try {
      return await this.billProvider.validateCableTvSmartCardNumber({
        serviceCategoryId: payload.serviceCategoryId,
        entityNumber: payload.cardNumber,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async buyCableTv(userId: string, payload: BuyCableTvDto) {
    try {
      return await this.transactionService.createCableTvTransaction(
        userId,
        payload,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getElectricityProviders() {
    try {
      return await this.billProvider.getElectricityProviders();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async validateElectricityMeterNumber(payload: ValidateProviderNumberDto) {
    try {
      return await this.billProvider.validateElectricityMeterNumber({
        serviceCategoryId: payload.serviceCategoryId,
        entityNumber: payload.cardNumber,
        vendType: payload.vendType,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async buyElectricity(userId: string, payload: BuyElectricityDto) {
    try {
      return await this.transactionService.createElectricityTransaction(
        userId,
        payload,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
