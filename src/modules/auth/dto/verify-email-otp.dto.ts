import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';

export class VerifyEmailOtpDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('NG', { message: 'Invalid phone number.' })
  @ApiProperty({ required: true, example: '08012345678' })
  phoneNumber: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsEmail({}, { message: 'Invalid email.' })
  @ApiProperty({ required: true, example: 'email@example.com' })
  email: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true, example: '123456' })
  otp: string;
}
