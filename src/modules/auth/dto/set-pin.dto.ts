import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SetPinDto {
  @IsOptional()
  phoneNumber?: string;

  @IsDefined()
  @IsNotEmpty()
  @MaxLength(4, { message: 'Transaction must be exactly 4 digits long' })
  @MinLength(4, { message: 'Transaction must be exactly 4 digits long' })
  @ApiProperty({ required: true, example: 1234 })
  pin: string;

  @IsDefined()
  @IsNotEmpty()
  @MaxLength(4, { message: 'Transaction must be exactly 4 digits long' })
  @MinLength(4, { message: 'Transaction must be exactly 4 digits long' })
  @ApiProperty({ required: true, example: 1234 })
  confirmPin: string;
}
