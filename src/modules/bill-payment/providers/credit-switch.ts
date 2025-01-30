import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { BillPaymentProvider } from './bill-payment.provider.interface';

export class CreditSwitch implements BillPaymentProvider {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly header: any;
  private readonly enviroment: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.enviroment = this.configService.get<string>('APP_ENV');
    this.apiKey = this.configService.get<string>('CREDIT_SWITCH_KEY');
    this.baseUrl =
      this.enviroment === 'production'
        ? 'https://api-middleware-prod.alertmfb.com.ng/api/sharedServices/v1/bills/services'
        : 'https://api-middleware-staging.alertmfb.com.ng/api/sharedServices/v1//bills/services';
    this.header = {
      apikey: this.apiKey,
    };
  }
  getAirtimeCategories(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  buyAirtime(data: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
  getInternetCategories(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  getInternetPlans(data: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
  buyInternet(data: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
  getElectricityProviders(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  validateElectricityMeterNumber(data: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
  buyElectricity(data: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
  getCableTvProviders(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  getCableTvPlans(data: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
  validateCableTvSmartCardNumber(data: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
  buyCableTv(data: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
