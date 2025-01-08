import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMoneyDto {
  @ApiProperty({
    description: 'Unique identifier for the account',
    example: '12345',
  })
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({ description: 'The amount to send', example: 1000 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    description: "The code of the recipient's bank",
    example: '058',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3, { message: 'Bank code must be exactly 3 characters long' })
  bankCode: string;

  @ApiProperty({
    description: "The recipient's account number",
    example: '0123456789',
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 10, {
    message: 'Account number must be exactly 10 characters long',
  })
  accountNumber: string;

  @ApiProperty({
    description: 'Narration or reason for the transaction',
    example: 'Payment for services',
  })
  @IsString()
  @IsNotEmpty()
  narration: string;

  @ApiProperty({ description: "User's transaction PIN", example: '1234' })
  @IsString()
  @IsNotEmpty()
  @Length(4, 4, { message: 'PIN must be exactly 4 characters long' })
  pin: string;
}
