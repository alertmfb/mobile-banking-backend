import { IsEmail, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateUserDto {
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty({
    description: 'Email of the user',
    default: 'test@gmail.com',
  })
  @IsEmail()
  email: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  phoneNumber: string;
  @ApiProperty()
  transactionPin: string;
  @ApiProperty()
  country: string;
  @ApiProperty()
  nin: string;
  @ApiProperty()
  bvn: string;
  @ApiProperty()
  city: string;
  @ApiProperty()
  address: string;
  @ApiProperty()
  state: string;
  @ApiProperty()
  zipCode: string;
  @ApiProperty()
  username: string;
  @ApiProperty({
    description: 'Date of Birth of the user',
    default: '2024-12-02',
  })
  dateOfBirth: string;
}

export class UserCredentialDto {
  @ApiProperty()
  @IsEmail()
  email: string;
  @ApiProperty()
  password: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsNumber()
  id: number;
  @ApiProperty()
  password: string;
}
export class CreatedUserResponseDto {
  message: string;
  data: {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    country?: string;
    nin?: string;
    token?: string;
    bvn?: string;
    state?: string;
    city?: string;
    address?: string;
    zipCode?: string;
    dateOfBirth?: string;
    username?: string;
    createdAt: Date;
    updatedAt: Date;
  };
  statusCode: number;
}
export class ResponseDto {
  message: string;
  statusCode: number;
}

export class requestOtpDto {
  @ApiProperty()
  email: string;
  @ApiProperty({
    default: 'PasswordReset',
    description:
      'The request OTP type. It can be, passwordReset, or transactionPin.',
  })
  type: OtpType;
}

export class OtpVerificationDto {
  @ApiProperty()
  otp: string;
}

export enum OtpType {
  PASSWORD_RESET = 'passwordReset',
  TRANSACTION_PIN = 'transactionPin',
}

export class TransactionPinDto {
  @ApiProperty()
  @IsNumber()
  id: number;
  @ApiProperty()
  transactionPin: string;
}
