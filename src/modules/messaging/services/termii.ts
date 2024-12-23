import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { MessagingService } from '../messaging-service.interface';
import { HttpException, HttpStatus } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

export class Termii implements MessagingService {
  private readonly authKey: string;
  private readonly baseUrl: string;
  private readonly header: any;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.authKey = this.configService.get<string>('MESSAGING_KEY');
    this.baseUrl = this.configService.get<string>('MESSAGING_URL');
    this.header = {
      appid: this.authKey,
    };
  }
  async sendSms(phone: string, message: string) {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.baseUrl}/message/sms/send`,
          {
            to: phone,
            message,
          },
          {
            headers: this.header,
          },
        ),
      );
      return response.data;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async sendBulkSms(message: string, phone: string[]) {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.baseUrl}/message/sms/bulk/send`,
          {
            to: phone,
            message,
          },
          {
            headers: this.header,
          },
        ),
      );
      return response.data;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async sendWhatsapp(phone: string, message: string) {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.baseUrl}/whatsapp/send`,
          {
            to: phone,
            message,
          },
          {
            headers: this.header,
          },
        ),
      );
      return response.data;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async sendSmsToken(payload: any) {
    try {
      const response = await lastValueFrom(
        this.httpService.post(`${this.baseUrl}/token/sms/send`, payload, {
          headers: this.header,
        }),
      );
      return response.data;
    } catch (e) {
      throw new HttpException(
        `Could not send OTP: ` + e.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendEmailToken(payload: any): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(`${this.baseUrl}/token/email/send`, payload, {
          headers: this.header,
        }),
      );
      return response.data;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyToken(payload: any): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(`${this.baseUrl}/token/verify`, payload, {
          headers: this.header,
        }),
      );
      return response.data;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
