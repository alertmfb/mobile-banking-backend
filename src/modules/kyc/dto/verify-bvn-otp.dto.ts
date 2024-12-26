import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyBvnOtpDto {
  @IsNotEmpty()
  @IsString()
  otp: string;

  @IsNotEmpty()
  @IsString()
  bvn: string;
}
