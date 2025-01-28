import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class ChangePasscodeDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true, example: '123456' })
  passcode: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true, example: '123456' })
  confirmPasscode: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true, example: '123456' })
  otp: string;
}
