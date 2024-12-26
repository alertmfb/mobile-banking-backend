import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsPhoneNumber,
  IsEmail,
} from 'class-validator';

export class SetEmailDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('NG', { message: 'Invalid phone number.' })
  @ApiProperty({ required: true, example: '08012345678' })
  phoneNumber: string;

  @IsDefined()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email.' })
  @ApiProperty({ required: true, example: 'example@gmail.com' })
  email: string;
}
