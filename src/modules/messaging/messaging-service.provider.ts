import { HttpService } from '@nestjs/axios';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessagingService } from './messaging-service.interface';
import { Termii } from './services/termii';

export const MessagingServiceProvider: Provider = {
  provide: 'MessagingProvider',
  useFactory: (
    httpService: HttpService,
    configService: ConfigService,
  ): MessagingService => {
    const thirdPartyService =
      configService.get<string>('THIRD_PARTY_SERVICE') || 'termii';
    switch (thirdPartyService) {
      case 'termii':
        return new Termii(httpService, configService);
      default:
        throw new Error(`Unsupported service: ${thirdPartyService}`);
    }
  },
  inject: [HttpService, ConfigService],
};
