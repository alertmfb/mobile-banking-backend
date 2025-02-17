import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { BillPaymentProvider } from './bill-payment.provider.interface';
import { HttpException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { CreditSwitchAirtimeTransferResponseDto } from '../dtos/credit-switch/transform-airtime-data-providers.dto';
import { plainToInstance } from 'class-transformer';
import { DataBundleResponseDto } from '../dtos/credit-switch/internet-plan-response.dto';
import { CreditSwitchProvidersResponseDto } from '../dtos/credit-switch/credit-switch-providers-response.dto';
import {
  CreditSwitchBuyAirtime,
  CreditSwitchBuyCableTv,
  CreditSwitchBuyData,
  CreditSwitchBuyElectricity,
  CreditSwitchValidateCableTvSmartCardNumber,
  CreditSwitchValidateElectricityMeterNumber,
} from './bill-payment.types';
import { ValidateCableTvStandardResponseDto } from '../dtos/validate-cable-tv-standard-response.dto';
import {
  CreditSwitchElectricityProvidersResponseDto,
  CreditSwitchElectricityServiceId,
} from '../dtos/credit-switch/electricity-provider.response.dto';

export class CreditSwitch implements BillPaymentProvider {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly header: any;
  private readonly environment: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.environment = this.configService.get<string>('APP_ENV');
    this.apiKey = this.configService.get<string>('CREDIT_SWITCH_KEY');
    this.baseUrl =
      this.environment === 'production'
        ? 'https://api-middleware-prod.alertmfb.com.ng/api/sharedServices/v1/paybills'
        : 'https://api-middleware-staging.alertmfb.com.ng/api/sharedServices/v1/paybills';
    this.header = {
      apikey: this.apiKey,
    };
  }

  async getAirtimeCategories(): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.baseUrl}/services`, {
          headers: this.header,
        }),
      );
      console.log(response.data.airtime);
      return CreditSwitchAirtimeTransferResponseDto.fromObject(
        response.data.airtime,
      );
    } catch (error) {
      throw new HttpException(
        `Bill Provider CS Error: ${error?.response?.data?.message || error.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async buyAirtime(data: CreditSwitchBuyAirtime): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.baseUrl}/airtime/vend`,
          {
            requestId: data.transactionId,
            serviceCategoryId: data.serviceCategoryId,
            amount: data.amount,
            recipient: data.phoneNumber,
            date: data.date,
          },
          {
            headers: this.header,
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Bill Provider CS Error: ${error?.response?.data?.message || error.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async getInternetCategories(): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.baseUrl}/services`, {
          headers: this.header,
        }),
      );
      return CreditSwitchAirtimeTransferResponseDto.fromObject(
        response.data.data,
      );
    } catch (error) {
      throw new HttpException(
        `Bill Provider CS Error: ${error?.response?.data?.message || error.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async getInternetPlans(serviceId: string): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.baseUrl}/data/plans`, {
          headers: this.header,
          params: { serviceId },
        }),
      );
      return plainToInstance(DataBundleResponseDto, response.data.dataPlan, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new HttpException(
        `Bill Provider CS Error: ${error?.response?.data?.message || error.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async buyInternet(data: CreditSwitchBuyData): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.baseUrl}/data/vend`,
          {
            requestId: data.transactionId,
            serviceId: data.serviceCategoryId,
            amount: data.amount,
            recipient: data.phoneNumber,
            date: data.date,
            productId: data.bundleCode,
          },
          {
            headers: this.header,
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Bill Provider CS Error: ${error?.response?.data?.message || error.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async getElectricityProviders(): Promise<any> {
    try {
      return CreditSwitchElectricityProvidersResponseDto;
    } catch (error) {
      throw new HttpException(
        `Bill Provider CS Error: ${error?.response?.data?.message || error.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async validateElectricityMeterNumber(
    data: CreditSwitchValidateElectricityMeterNumber,
  ): Promise<any> {
    try {
      const { serviceCategoryId, entityNumber, vendType } = data;
      const serviceId = CreditSwitchElectricityServiceId(
        serviceCategoryId,
        vendType,
      );
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.baseUrl}/electricity/validate`,
          {
            serviceId,
            customerNo: entityNumber,
          },
          {
            headers: this.header,
          },
        ),
      );
      return {
        name: response.data.detail.name,
        address: response.data.detail.address,
        meterNumber: response.data.detail.meterNumber,
        minimumAmount: response.data.detail.minimumAmount,
        disco: serviceCategoryId,
        vendType,
      };
    } catch (error) {
      throw new HttpException(
        `Bill Provider CS Error: ${error?.response?.data?.message || error.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async buyElectricity(data: CreditSwitchBuyElectricity): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.baseUrl}/electricity/vend`,
          {
            serviceId: data.serviceCategoryId,
            requestId: data.transactionId,
            amount: data.amount,
            customerName: data.customerName,
            customerAddress: data.customerAddress,
            customerAccountId: data.meterNumber,
          },
          {
            headers: this.header,
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Bill Provider CS Error: ${error?.response?.data?.message || error.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async getCableTvProviders(): Promise<any> {
    try {
      return CreditSwitchProvidersResponseDto;
    } catch (error) {
      throw new HttpException(
        `Bill Provider CS Error: ${error?.response?.data?.message || error.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async getCableTvPlans(serviceId: string): Promise<any> {
    try {
      const url =
        serviceId == 'startimes'
          ? `${this.baseUrl}/startimes/products`
          : `${this.baseUrl}/multichoice/products`;
      const response = await lastValueFrom(
        this.httpService.get(url, {
          headers: this.header,
          params: { serviceId },
        }),
      );
      return response.data.statusDescription.items;
    } catch (error) {
      throw new HttpException(
        `Bill Provider CS Error: ${error?.response?.data?.message || error.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async validateCableTvSmartCardNumber(
    data: CreditSwitchValidateCableTvSmartCardNumber,
  ): Promise<any> {
    try {
      const { serviceCategoryId, entityNumber } = data;

      const url =
        serviceCategoryId == 'startimes'
          ? `${this.baseUrl}/startimes/validate`
          : `${this.baseUrl}/multichoice/validate/smartcard`;

      const body =
        serviceCategoryId == 'startimes'
          ? { smartCardCode: entityNumber }
          : {
              serviceId: serviceCategoryId,
              customerNo: entityNumber,
            };
      const response = await lastValueFrom(
        this.httpService.post(url, body, {
          headers: this.header,
        }),
      );
      const resObj =
        serviceCategoryId == 'startimes'
          ? response.data
          : response.data.statusDescription;
      return plainToInstance(ValidateCableTvStandardResponseDto, resObj, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new HttpException(
        `Bill Provider CS Error: ${error?.response?.data?.message || error.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async buyCableTv(data: CreditSwitchBuyCableTv): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.baseUrl}/cabletv/vend`,
          {
            serviceId: data.serviceId,
            transactionRef: data.transactionRef,
            smartCardCode: data.smartCardCode,
            fee: data.fee,
            subscriptionType: data.subscriptionType,
            packageName: data.packageName,
            invoicePeriod: data.invoicePeriod,
            customerNo: data.customerNo,
            customerName: data.customerName,
            amount: data.amount,
            productsCodes: data.productsCodes,
          },
          {
            headers: this.header,
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Bill Provider CS Error: ${error?.response?.data?.message || error.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }
}
