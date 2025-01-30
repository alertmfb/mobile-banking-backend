import { Body, Controller, Get, HttpException, HttpStatus, Patch, Post, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
import { User } from 'src/shared/decorators/user.decorator';
import { JwtPayload } from 'src/shared/interfaces/jwt-payload.interface';
import { SetNotificationPreferenceDto } from './dtos/set-notification-preference.dto';
import { SuccessResponseDto } from 'src/shared/dtos/success-response.dto';
import { SuccessMessage } from 'src/shared/enums/success-message.enum';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('preference')
  @UseGuards(JwtAuthGuard)
  async getPreference(@User() user: JwtPayload) {
    try {
      const userId = user.id;
      const response = await this.notificationService.getPreference(userId);
      return new SuccessResponseDto(
        SuccessMessage.SET_NOTIFICATION_PREFERENCE,
        response,
      );
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch('preference')
  @UseGuards(JwtAuthGuard)
  async setPreference(
    @Body() payload: SetNotificationPreferenceDto,
    @User() user: JwtPayload,
  ) {
    try {
      const userId = user.id;
      const response = await this.notificationService.setPreference(
        userId,
        payload,
      );
      return new SuccessResponseDto(
        SuccessMessage.SET_NOTIFICATION_PREFERENCE,
        response,
      );
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
