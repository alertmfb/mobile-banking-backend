import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { DeviceRepository } from './device.repository';
import { UpdateDeviceDto } from './dtos/update-device.dto';
import { ErrorMessages } from 'src/shared/enums/error.message.enum';

@Injectable()
export class DeviceService {
  constructor(
    private readonly deviceRepository: DeviceRepository,
    private readonly userService: UserService,
  ) {}

  async create(userId: string, data: any) {
    try {
      const { deviceId } = data;
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      const device = await this.deviceRepository.findOneByDeviceId(
        deviceId,
        userId,
        
      );
      if (device) {
        device.lastUsed = new Date();
        return this.deviceRepository.update(device.id, device);
      }
      return this.deviceRepository.create({
        ...data,
        user: { connect: { id: user.id } },
      });
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: string, data: UpdateDeviceDto) {
    try {
      return this.deviceRepository.update(id, data);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAllByUserId(userId: string) {
    try {
      return this.deviceRepository.findAllByUserId(userId);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findOneByDeviceId(deviceId: string, userId: string) {
    try {
      return this.deviceRepository.findOneByDeviceId(deviceId, userId);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async delete(id: string) {
    try {
      return this.deviceRepository.remove(id);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}
