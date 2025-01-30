import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import { EmailService } from './email-service.interface';
import { Injectable } from '@nestjs/common';
import { TemplateCompiler } from '../utils/template-compiler';

@Injectable()
export class SendGrid implements EmailService {
  private apiKey: string;
  private from: string;
  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get('SENDGRID_API_KEY');
    this.from = this.configService.get('SENDGRID_FROM_EMAIL');
    sgMail.setApiKey(this.apiKey);
  }
  async send(
    to: string,
    subject: string,
    template: string,
    data: Record<string, any>,
    from = this.from,
  ): Promise<void> {
    const html = TemplateCompiler.compile(template, data);
    try {
      await sgMail.send({
        to,
        subject,
        from: `Alert MFB <${from}>`,
        html,
      });
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      if (error.response) {
        console.error('SendGrid Response:', error.response.body);
      }
      throw error;
    }
  }
}
