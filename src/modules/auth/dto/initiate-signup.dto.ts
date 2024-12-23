import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class InitiateSignUpDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('NG', { message: 'Invalid phone number' })
  @ApiProperty({ required: true, example: '08012345678' })
  phoneNumber: string;
}
