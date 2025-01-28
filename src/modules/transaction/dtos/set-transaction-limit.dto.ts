import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { TransactionType } from 'src/shared/enums/all.enum';

export class SetTransactionLimitDto {
  @ApiProperty({
    description: 'The type of transaction for which the limits are being set.',
    enum: TransactionType,
    default: TransactionType.TRANSFER,
  })
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @ApiProperty({
    description: 'The maximum amount allowed for a single transaction.',
    example: 1000.0,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  singleLimit?: number;

  @ApiProperty({
    description: 'The maximum amount allowed per day.',
    example: 5000.0,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  dailyLimit?: number;

  @ApiProperty({
    description: 'The maximum amount allowed per month.',
    example: 20000.0,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  monthlyLimit?: number;
}
