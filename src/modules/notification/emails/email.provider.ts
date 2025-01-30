import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendGrid } from './services/sendgrid';
import { Zepto } from './services/zepto';
import { EmailService } from './services/email-service.interface';

@Injectable()
export class EmailProvider {
  private service: EmailService;

  constructor(
    private readonly configService: ConfigService,
    private readonly sendGrid: SendGrid,
    private readonly zepto: Zepto,
  ) {
    const provider =
      this.configService.get<string>('NOTIFICATION_PROVIDER') || 'sendgrid';
    this.service = this.getService(provider);
  }

  private getService(provider: string): EmailService {
    switch (provider) {
      case 'sendgrid':
        return this.sendGrid;
      case 'zepto':
        return this.zepto;
      default:
        throw new Error(`Unsupported notification provider: ${provider}`);
    }
  }

  async send(
    to: string,
    subject: string,
    template: string,
    data: Record<string, any>,
  ): Promise<void> {
    await this.service.send(to, subject, template, data);
  }
}
