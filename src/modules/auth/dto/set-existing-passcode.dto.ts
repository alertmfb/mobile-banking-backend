import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SetExistingPasscodeDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    required: true,
    example: '1100063555',
    description: '10-digit account number',
  })
  @MinLength(10)
  @MaxLength(10)
  accountNumber: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true, example: '123456' })
  otp: string;

  @IsDefined()
  @IsNotEmpty()
  @MaxLength(6, { message: 'Passcode must be exactly 6 digits long' })
  @MinLength(6, { message: 'Passcode must be exactly 6 digits long' })
  @ApiProperty({ required: true, example: 123456 })
  passcode: string;

  @IsDefined()
  @IsNotEmpty()
  @MaxLength(6, { message: 'Confirm Passcode must be exactly 6 digits long' })
  @MinLength(6, { message: 'Confirm Passcode must be exactly 6 digits long' })
  @ApiProperty({ required: true, example: 123456 })
  confirmPasscode: string;
}
