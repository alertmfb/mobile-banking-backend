import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import {
  NetworkProvider,
  TransactionType,
  TvProvider,
} from '../../../shared/enums/all.enum';

export class CreateBeneficiaryDto {
  // @ApiProperty({
  //   description:
  //     'Unique identifier for the account associated with the beneficiary',
  //   example: '456e1234-e89b-12d3-a456-426614174000',
  // })
  // @IsUUID()
  // @IsNotEmpty()
  // accountId: string;

  @ApiProperty({
    required: true,
    type: TransactionType,
    enum: TransactionType,
    enumName: 'TransactionType',
    description: 'Type of beneficiary',
  })
  @IsOptional()
  beneficiaryType: TransactionType;

  @ApiProperty({
    description: 'Name of the transfer beneficiary',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  accountName: string;

  @ApiProperty({
    description: "Name of the beneficiary's bank",
    example: 'Access Bank',
    required: false,
  })
  @IsOptional()
  bankName: string;

  @ApiProperty({
    description: "Bank code for the beneficiary's account",
    example: '044',
    required: false,
  })
  @IsOptional()
  bankCode: string;

  @ApiProperty({
    description: 'Account number of the transfer beneficiary',
    example: '0123456789',
    required: false,
  })
  @IsOptional()
  accountNumber: string;

  @ApiProperty({
    description: 'Phone number of the airtime/data beneficiary',
    example: '08012345678',
    required: false,
  })
  @IsString()
  @IsOptional()
  phoneNumber: string;

  @ApiProperty({
    description: 'Network provider for the airtime/data beneficiary',
    example: 'MTN',
    enum: NetworkProvider,
    enumName: 'NetworkProvider',
    required: false,
  })
  @IsOptional()
  networkProvider: NetworkProvider;

  //tv name, tv card number, tv provider
  @ApiProperty({
    description: 'Name of the TV subscription beneficiary',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  tvCardName: string;

  @ApiProperty({
    description: 'Card number of the TV subscription beneficiary',
    example: '0123456789',
    required: false,
  })
  @IsOptional()
  tvCardNumber: string;

  @ApiProperty({
    description: 'Provider of the TV subscription beneficiary',
    example: 'DSTV',
    required: false,
    enum: TvProvider,
    enumName: 'TvProvider',
  })
  @IsOptional()
  tvProvider: TvProvider;

  @ApiProperty({
    description: 'Indicates if the beneficiary is a transfer beneficiary',
    example: false,
    required: false,
  })
  @IsOptional()
  isBeneficiary: boolean;
}
