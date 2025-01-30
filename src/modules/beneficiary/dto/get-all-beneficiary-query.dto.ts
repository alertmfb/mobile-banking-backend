import { ApiProperty } from '@nestjs/swagger';
import {
  NetworkProvider,
  OrderBy,
  TransactionType,
} from 'src/shared/enums/all.enum';

export class GetAllBeneficiaryQueryDto {
  @ApiProperty({
    required: false,
    type: Number,
    default: 1,
    description: 'Page number',
  })
  page: number;

  @ApiProperty({
    required: false,
    type: Number,
    default: 10,
    description: 'Items per page',
  })
  perPage: number;

  @ApiProperty({
    required: false,
    type: TransactionType,
    enum: TransactionType,
    enumName: 'TransactionType',
    description: 'Type of beneficiary',
  })
  beneficiaryType: TransactionType;

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
    type: String,
    description: 'Search query',
  })
  keyword: string;

  @ApiProperty({
    required: false,
    type: String,
    description: 'Sort by',
  })
  sort: string;

  @ApiProperty({
    required: false,
    type: OrderBy,
    default: OrderBy.DESC,
    description: 'Order',
    enum: OrderBy,
    enumName: 'OrderBy',
  })
  order: OrderBy;
}
