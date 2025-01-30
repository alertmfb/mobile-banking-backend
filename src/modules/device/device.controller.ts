import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dtos/create-device.dto';
import { User } from 'src/shared/decorators/user.decorator';
import { JwtPayload } from 'src/shared/interfaces/jwt-payload.interface';
import { SuccessResponseDto } from 'src/shared/dtos/success-response.dto';
import { SuccessMessage } from 'src/shared/enums/success-message.enum';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
import { ApiResponse } from '@nestjs/swagger';

@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() payload: CreateDeviceDto, @User() user: JwtPayload) {
    try {
      const response = await this.deviceService.create(user.id, payload);
      return new SuccessResponseDto(SuccessMessage.DEVICE_ADDED, response);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@User() user: JwtPayload) {
    try {
      const response = await this.deviceService.findAllByUserId(user.id);
      return new SuccessResponseDto(SuccessMessage.DEVICES_RETRIEVED, response);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':deviceId')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Device retrieved successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async findOne(@Param('deviceId') deviceId: string, @User() user: JwtPayload) {
    try {
      const response = await this.deviceService.findOneByDeviceId(
        deviceId,
        user.id,
      );
      return new SuccessResponseDto(SuccessMessage.DEVICE_RETRIEVED, response);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}
