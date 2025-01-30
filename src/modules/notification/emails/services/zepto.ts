import { ConfigService } from '@nestjs/config';
import { EmailService } from './email-service.interface';
import { Injectable } from '@nestjs/common';
import { TemplateCompiler } from '../utils/template-compiler';

@Injectable()
export class Zepto implements EmailService {
  private apiKey: string;
  private apiBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get('ZEPTO_API_KEY');
    this.apiBaseUrl = this.configService.get('ZEPTO_API_BASE_URL');
  }

  async send(
    to: string,
    subject: string,
    template: string, // This acts as the `templateId` for Zepto
    data: Record<string, any>,
  ): Promise<void> {
    const url = `${this.apiBaseUrl}/sms/send`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    };

    // Compile the Handlebars template with the provided variables
    const message = TemplateCompiler.compile(template, data);

    const payload = {
      to,
      subject,
      message,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        console.error('Error response from Zepto:', errorBody);
        throw new Error(`Failed to send SMS: ${response.statusText}`);
      }

      console.log(`SMS sent to ${to}`);
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }
}
