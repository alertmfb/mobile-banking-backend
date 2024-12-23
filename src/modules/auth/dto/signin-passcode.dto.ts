import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SigninPasscodeDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true, example: '08012345678' })
  emailorPhone: string;

  @IsDefined()
  @IsNotEmpty()
  @MaxLength(6, { message: 'Passcode must be exactly 6 digits long' })
  @MinLength(6, { message: 'Passcode must be exactly 6 digits long' })
  @ApiProperty({ required: true, example: 123456 })
  passcode: string;
}
