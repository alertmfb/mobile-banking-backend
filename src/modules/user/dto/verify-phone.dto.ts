import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsPhoneNumber,
  MaxLength,
  MinLength,
} from 'class-validator';

export class VerifyPhoneDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('NG', { message: 'Invalid phone number.' })
  @ApiProperty({ required: true, example: '08012345678' })
  phoneNumber: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  @ApiProperty({ required: true, example: '123456' })
  otp: string;
}
