import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class VerifyOtpDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true, example: '123456' })
  otp: string;
}
