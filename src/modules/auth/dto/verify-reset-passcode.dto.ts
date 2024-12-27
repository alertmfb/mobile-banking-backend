import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsNumberString,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class VerifyResetPasscodeDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true, example: '1234567890 | example@email.com' })
  emailOrAccountNumber: string;

  @IsDefined()
  @IsNotEmpty()
  @IsNumberString()
  @MaxLength(6, { message: 'otp must be exactly 6 digits long' })
  @MinLength(6, { message: 'otp must be exactly 6 digits long' })
  @ApiProperty({ required: true, example: '1234' })
  otp: string;
}
