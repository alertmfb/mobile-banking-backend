import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsEmail,
} from 'class-validator';

export class VerifyEmailDto {
  @IsDefined()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email.' })
  @ApiProperty({ required: true, example: 'example@gmail.com' })
  email: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  @ApiProperty({ required: true, example: '123456' })
  otp: string;
}
