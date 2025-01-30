import { Prisma, Device } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DeviceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.DeviceCreateInput): Promise<Device> {
    return this.prisma.device.create({ data });
  }

  async findAll(): Promise<Device[]> {
    return this.prisma.device.findMany();
  }

  async findAllByUserId(userId: string): Promise<Device[]> {
    return this.prisma.device.findMany({ where: { userId } });
  }

  async findOneByDeviceId(deviceId: string, userId: string): Promise<Device> {
    return this.prisma.device.findFirst({ where: { deviceId, userId } });
  }

  async findOne(id: string): Promise<Device> {
    return this.prisma.device.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.DeviceUpdateInput): Promise<Device> {
    return this.prisma.device.update({ where: { id }, data });
  }

  async remove(id: string): Promise<Device> {
    return this.prisma.device.delete({ where: { id } });
  }
}
