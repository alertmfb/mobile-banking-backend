import { HttpService } from '@nestjs/axios';
import { Provider } from '@nestjs/common';
import { DojahService } from './dojah.service';
import { ConfigService } from '@nestjs/config';

export const KycServiceProvider: Provider = {
  provide: 'KycProvider',
  useFactory: (httpService: HttpService, configService: ConfigService) => {
    const providerName = configService.get<string>('KYB_PROVIDER') || 'dojah';
    switch (providerName) {
      case 'dojah':
        return new DojahService(httpService, configService);
      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }
  },
  inject: [HttpService, ConfigService],
};
