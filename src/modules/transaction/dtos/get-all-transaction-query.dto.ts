import { ApiProperty } from '@nestjs/swagger';
import {
  NetworkProvider,
  OrderBy,
  TransactionStatus,
  TransactionType,
} from 'src/shared/enums/all.enum';

export class GetAllTransactionQueryDto {
  @ApiProperty({
    required: false,
    type: Number,
    default: 1,
    description: 'Page number',
  })
  page?: number;

  @ApiProperty({
    required: false,
    type: Number,
    default: 10,
    description: 'Items per page',
  })
  perPage?: number;

  @ApiProperty({
    required: false,
    type: String,
    description: 'Reference',
  })
  reference?: string;

  @ApiProperty({
    required: false,
    type: TransactionType,
    enum: TransactionType,
    enumName: 'TransactionType',
    description: 'Type of transaction',
  })
  type?: TransactionType;

  @ApiProperty({
    required: false,
    type: NetworkProvider,
    enum: NetworkProvider,
    enumName: 'NetworkProvider',
    description: 'Network provider',
  })
  network: NetworkProvider;

  @ApiProperty({
    required: false,
    type: TransactionStatus,
    enum: TransactionStatus,
    enumName: 'TransactionStatus',
    description: 'Transaction Status',
  })
  status?: TransactionStatus;

  @ApiProperty({
    required: false,
    type: String,
    description: 'Search query',
  })
  keyword?: string;

  @ApiProperty({
    required: false,
    type: String,
    description: 'Sort by',
  })
  sort?: string;

  @ApiProperty({
    required: false,
    type: OrderBy,
    default: OrderBy.DESC,
    description: 'Order',
    enum: OrderBy,
    enumName: 'OrderBy',
  })
  order?: OrderBy;

  @ApiProperty({
    required: false,
    type: String,
    description: 'From date',
  })
  from?: string;

  @ApiProperty({
    required: false,
    type: String,
    description: 'To date',
  })
  to?: string;
}
