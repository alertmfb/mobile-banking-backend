import { IsEmail } from 'class-validator';

export class CreateUserDto {
  firstName: string;
  lastName: string;
  @IsEmail()
  email: string;
  password: string;
  transactionPin: string;
  country: string;
  nin: string;
  bvn: string;
  city: string;
  address: string;
  state: string;
  zipCode: string;
  username: string;
  dateOfBirth: string;
}

export class LoginUserDto {
  @IsEmail()
  email: string;
  password: string;
}

export class CreateWaitListResponseDto {
  message: string;
  data: {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    country?: string;
    nin?: string;
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
