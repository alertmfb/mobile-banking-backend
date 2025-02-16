import { HttpService } from '@nestjs/axios';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreditSwitch } from './credit-switch';
import { Shiga } from './shiga';

export const BillServiceProvider: Provider = {
  provide: 'BillPaymentProvider',
  useFactory: (httpService: HttpService, configService: ConfigService) => {
    const providerName =
      configService.get<string>('BILL_PROVIDER') || 'credit-switch';
    switch (providerName) {
      case 'shiga':
        return new Shiga(httpService, configService);
      case 'credit-switch':
        return new CreditSwitch(httpService, configService);
      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }
  },
  inject: [HttpService, ConfigService],
};
