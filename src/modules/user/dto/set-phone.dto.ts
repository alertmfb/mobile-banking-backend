import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsPhoneNumber,
} from 'class-validator';

export class SetPhoneDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('NG', { message: 'Invalid phone number.' })
  @ApiProperty({ required: true, example: '08012345678' })
  phoneNumber: string;
}
