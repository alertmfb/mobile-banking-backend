import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsNumberString,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class VerifyOtpDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('NG', { message: 'Invalid phone number' })
  @ApiProperty({ required: true, example: '08012345678' })
  phoneNumber: string;

  @IsDefined()
  @IsNotEmpty()
  @IsNumberString()
  @MaxLength(6, { message: 'otp must be exactly 6 digits long' })
  @MinLength(6, { message: 'otp must be exactly 6 digits long' })
  @ApiProperty({ required: true, example: '1234' })
  otp: string;
}
