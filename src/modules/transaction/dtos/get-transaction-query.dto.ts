import {
  IsString,
  IsInt,
  IsDateString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetTransactionsQueryDto {
  @IsOptional()
  accountNumber?: string;

  @ApiProperty({
    description: 'The transaction amount as a string',
    example: '1000.00',
  })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({
    description: 'The start date for the transaction query in ISO format',
    example: '2023-01-01',
  })
  @IsDateString()
  @IsNotEmpty()
  fromDate: string;

  @ApiProperty({
    description: 'The end date for the transaction query in ISO format',
    example: '2023-12-31',
  })
  @IsDateString()
  @IsNotEmpty()
  toDate: string;

  @ApiProperty({
    description: 'The number of items to fetch in the transaction query',
    example: 10,
  })
  @IsInt()
  @IsNotEmpty()
  numberOfItems: number;
}
