import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { BillPaymentProvider } from './bill-payment.provider.interface';
import { HttpException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import {
  ShigaBuyAirtime,
  ShigaBuyCableTv,
  ShigaBuyElectricity,
  ShigaBuyInternet,
  ShigaValidateElectricityMeterNumber,
  ShigaValidateSmartCard,
} from './bill-payment.types';

export class Shiga implements BillPaymentProvider {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly header: any;
  private readonly enviroment: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.enviroment = this.configService.get<string>('APP_ENV');
    this.apiKey = this.configService.get<string>('SHIGA_KEY');
    this.baseUrl =
      this.enviroment === 'production'
        ? 'https://api-middleware-prod.alertmfb.com.ng/api/sharedServices/v1/bills/services'
        : 'https://api-middleware-staging.alertmfb.com.ng/api/sharedServices/v1/bills/services';
    this.header = {
      apikey: this.apiKey,
    };
  }
  async getAirtimeCategories(): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.baseUrl}/airtime`, {
          headers: this.header,
        }),
      );
      return response.data.data;
    } catch (error) {
      throw new HttpException(
        `Bill Provider SH Error: ${error?.response?.data?.message || error.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async buyAirtime(data: ShigaBuyAirtime): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.baseUrl}/airtime/payment`,
          {
            serviceCategoryId: data.serviceCategoryId,
            amount: data.amount,
            phoneNumber: data.phoneNumber,
          },
          {
            headers: this.header,
          },
        ),
      );
      return response.data.data;
    } catch (error) {
      throw new HttpException(
        `Bill Provider SH Error: ${error?.response?.data?.message || error.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async getInternetCategories(): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.baseUrl}/internet`, {
          headers: this.header,
        }),
      );
      return response.data.data;
    } catch (error) {
      throw new HttpException(
        `Bill Provider SH Error: ${error?.response?.data?.message || error.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async getInternetPlans(serviceCategoryId: string): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.baseUrl}/internet/plans`, {
          headers: this.header,
          params: { serviceCategoryId },
        }),
      );
      return response.data.data;
    } catch (error) {
      throw new HttpException(
        `Bill Provider SH Error: ${error?.response?.data?.message || error.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async buyInternet(data: ShigaBuyInternet): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.baseUrl}/internet/payment`,
          {
            serviceCategoryId: data.serviceCategoryId,
            bundleCode: data.bundleCode,
            phoneNumber: data.phoneNumber,
          },
          {
            headers: this.header,
          },
        ),
      );
      return response.data.data;
    } catch (error) {
      throw new HttpException(
        `Bill Provider SH Error: ${error?.response?.data?.message || error.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async getElectricityProviders(): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.baseUrl}/electricity`, {
          headers: this.header,
        }),
      );
      return response.data.data;
    } catch (error) {
      throw new HttpException(
        `Bill Provider SH Error: ${error?.response?.data?.message || error.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async validateElectricityMeterNumber(
    data: ShigaValidateElectricityMeterNumber,
  ): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.baseUrl}/electricity/validate`,
          {
            serviceCategoryId: data.serviceCategoryId,
            entityNumber: data.entityNumber,
          },
          {
            headers: this.header,
          },
        ),
      );
      return response.data.data;
    } catch (error) {
      throw new HttpException(
        `Bill Provider SH Error: ${error?.response?.data?.message || error.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async buyElectricity(data: ShigaBuyElectricity): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.baseUrl}/electricity/payment`,
          {
            vendType: data.vendType,
            serviceCategoryId: data.serviceCategoryId,
            amount: data.amount,
            meterNumber: data.meterNumber,
          },
          {
            headers: this.header,
          },
        ),
      );
      return response.data.data;
    } catch (error) {
      throw new HttpException(
        `Bill Provider SH Error: ${error?.response?.data?.message || error.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async getCableTvProviders(): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.baseUrl}/cableTv`, {
          headers: this.header,
        }),
      );
      return response.data.data;
    } catch (error) {
      throw new HttpException(
        `Bill Provider SH Error: ${error?.response?.data?.message || error.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async getCableTvPlans(serviceCategoryId: string): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.baseUrl}/tv/plans`, {
          headers: this.header,
          params: { serviceCategoryId },
        }),
      );
      return response.data.data;
    } catch (error) {
      throw new HttpException(
        `Bill Provider SH Error: ${error?.response?.data?.message || error.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async validateCableTvSmartCardNumber(
    data: ShigaValidateSmartCard,
  ): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.baseUrl}/tv/validate`,
          {
            serviceCategoryId: data.serviceCategoryId,
            entityNumber: data.entityNumber,
          },
          {
            headers: this.header,
          },
        ),
      );
      return response.data.data;
    } catch (error) {
      throw new HttpException(
        `Bill Provider SH Error: ${error?.response?.data?.message || error.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async buyCableTv(data: ShigaBuyCableTv): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.baseUrl}/tv/payment`,
          {
            serviceCategoryId: data.serviceCategoryId,
            bundleCode: data.bundleCode,
            cardNumber: data.cardNumber,
          },
          {
            headers: this.header,
          },
        ),
      );
      return response.data.data;
    } catch (error) {
      throw new HttpException(
        `Bill Provider SH Error: ${error?.response?.data?.message || error.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }
}
