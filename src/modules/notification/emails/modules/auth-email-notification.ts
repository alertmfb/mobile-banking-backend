import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EmailProvider } from '../email.provider';

@Injectable()
export class AuthEmailNotification {
  constructor(private readonly emailProvider: EmailProvider) {}

  async sendEmailVerification(to: string, data: any): Promise<void> {
    try {
      const template = 'auth/welcome';
      const subject = 'Verify your email address';
      await this.emailProvider.send(to, subject, template, data);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
