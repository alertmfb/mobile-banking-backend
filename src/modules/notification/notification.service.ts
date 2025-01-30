import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { SetNotificationPreferenceDto } from './dtos/set-notification-preference.dto';
import { UserService } from '../user/user.service';
import { ErrorMessages } from 'src/shared/enums/error.message.enum';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly userService: UserService,
  ) {}

  async setPreference(userId: string, payload: SetNotificationPreferenceDto) {
    try {
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      const prefernce =
        await this.notificationRepository.getNotificationPrefernceByUserId(
          userId,
        );

      if (prefernce) {
        //update by usrrId
        await this.notificationRepository.updateNotificationPreferenceByUserId(
          userId,
          {
            ...payload,
          },
        );
      } else {
        await this.notificationRepository.createNotificationPreference({
          user: { connect: { id: user.id } },
          ...payload,
        });
      }

      return await this.notificationRepository.getNotificationPrefernceByUserId(
        userId,
      );
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getPreference(userId: string) {
    try {
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      const defaultPreference = {
        creditSms: false,
        creditPush: false,
        creditEmail: false,
        creditWhatsapp: false,
        debitSms: false,
        debitPush: false,
        debitEmail: false,
        debitWhatsapp: false,
      };

      const preference =
        await this.notificationRepository.getNotificationPrefernceByUserId(
          userId,
        );

      if (!preference) {
        return defaultPreference;
      }

      return preference;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
