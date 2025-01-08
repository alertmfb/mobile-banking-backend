import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class GenerateStatementQueryDto {
  @IsOptional()
  accountNumber?: string;

  @ApiProperty({
    description: 'The start date for the statement generation in ISO format',
    example: 'YYYY-MM-DD',
  })
  @IsString()
  @IsNotEmpty()
  fromDate: string;

  @ApiProperty({
    description: 'The end date for the statement generation in ISO format',
    example: 'YYYY-MM-DD',
  })
  @IsString()
  @IsNotEmpty()
  toDate: string;

  @ApiProperty({
    description: 'Whether the statement should be generated as a PDF',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isPdf: boolean;

  @ApiProperty({
    description: 'Whether to arrange transactions in ascending order',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  arrangeAsc: boolean;

  @ApiProperty({
    description: 'Whether to include a serial number in the statement',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  showSerialNumber: boolean;

  @ApiProperty({
    description: 'Whether to include the transaction date in the statement',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  showTransactionDate: boolean;

  @ApiProperty({
    description: 'Whether to include reversed transactions in the statement',
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  showReversedTransactions: boolean;

  @ApiProperty({
    description: 'Whether to include the instrument number in the statement',
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  showInstrumentNumber: boolean;
}
