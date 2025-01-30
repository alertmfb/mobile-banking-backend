import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  createNotificationPreference(data: Prisma.NotificationPreferenceCreateInput) {
    return this.prismaService.notificationPreference.create({ data });
  }

  updateNotificationPreferenceByUserId(
    userId: string,
    data: Prisma.NotificationPreferenceUpdateInput,
  ) {
    return this.prismaService.notificationPreference.update({
      where: { userId },
      data,
    });
  }

  getNotificationPrefernceByUserId(userId: string) {
    return this.prismaService.notificationPreference.findFirst({
      where: { userId },
    });
  }
}
