import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateUserDto {
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  @IsEmail()
  email: string;
  @ApiProperty()
  password: string;
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
  @ApiProperty()
  dateOfBirth: string;
}

export class UserCredentialDto {
  @ApiProperty()
  @IsEmail()
  email: string;
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

export class EmailDto {
  @ApiProperty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  otp: string;
}
