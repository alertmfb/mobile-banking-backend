import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsPhoneNumber,
} from 'class-validator';

export class RequestResetDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('NG', { message: 'Invalid phone number' })
  @ApiProperty({ required: true, example: '08012345678' })
  phoneNumber: string;
}
