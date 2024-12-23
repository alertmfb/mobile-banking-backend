import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class SetPasscodeDto {
  @IsDefined()
  @IsNotEmpty()
  phoneNumber?: string;

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
