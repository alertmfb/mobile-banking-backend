import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumberString } from 'class-validator';

export class IntraBankTransferDto {
  @ApiProperty({
    description: 'Unique retrieval reference for the transaction',
  })
  @IsString()
  @IsNotEmpty()
  reference: string;

  @ApiProperty({ description: 'Narration or description of the transaction' })
  @IsString()
  @IsNotEmpty()
  narration: string;

  @ApiProperty({
    description: 'Amount to be transferred (as a numeric string)',
  })
  @IsNumberString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({ description: 'Source account number' })
  @IsString()
  @IsNotEmpty()
  fromAccountNumber: string;

  @ApiProperty({ description: 'Destination account number' })
  @IsString()
  @IsNotEmpty()
  toAccountNumber: string;
}
