import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateDeviceDto {
  @ApiProperty({ description: 'IP address of the device', required: false })
  @IsString()
  @IsOptional()
  ip?: string;

  @ApiProperty({ description: 'Browser information', required: false })
  @IsString()
  @IsOptional()
  browser?: string;

  @ApiProperty({ description: 'Operating system information', required: false })
  @IsString()
  @IsOptional()
  os?: string;

  @ApiProperty({ description: 'Device information', required: false })
  @IsString()
  @IsOptional()
  device?: string;

  @ApiProperty({
    description: 'Geographical location of the device',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    description: 'Longitude of the device location',
    required: false,
  })
  @IsString()
  @IsOptional()
  longitude?: string;

  @ApiProperty({
    description: 'Latitude of the device location',
    required: false,
  })
  @IsString()
  @IsOptional()
  latitude?: string;

  @ApiProperty({ description: 'Unique identifier for the device' })
  @IsString()
  @IsOptional()
  deviceId: string;
}
