import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class VerifyEmailOtpDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsEmail({}, { message: 'Invalid email.' })
  email: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true, example: '123456' })
  otp: string;
}
