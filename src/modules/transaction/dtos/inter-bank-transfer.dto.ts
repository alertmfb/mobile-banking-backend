import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class InterBankTransferDto {
  @ApiProperty({
    description: 'Amount to be transferred in Kobo',
    example: '50000',
  })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({
    description: 'Appzone’s account number for Appzone share of fees',
    example: '1234567890',
  })
  @IsString()
  @IsOptional()
  appzoneAccount?: string;

  @ApiProperty({
    description: 'Account number of sender or payer',
    example: '9876543210',
  })
  @IsString()
  @IsNotEmpty()
  payerAccountNumber: string;

  @ApiProperty({
    description: 'Payer’s account name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  payer: string;

  @ApiProperty({
    description:
      'Commercial bank code, can be gotten from GetCommercialBank API',
    example: '044',
  })
  @IsString()
  @IsNotEmpty()
  receiverBankCode: string;

  @ApiProperty({
    description: 'Account number of the receiver/beneficiary',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  receiverAccountNumber: string;

  @ApiProperty({
    description: 'Beneficiary’s name',
    example: 'Jane Doe',
  })
  @IsString()
  @IsOptional()
  receiverName?: string;

  @ApiProperty({
    description: 'Beneficiary’s phone number',
    example: '08012345678',
  })
  @IsString()
  @IsOptional()
  receiverPhoneNumber?: string;

  @ApiProperty({
    description: 'Beneficiary’s account type',
    example: 'Savings',
  })
  @IsString()
  @IsOptional()
  receiverAccountType?: string;

  @ApiProperty({
    description: 'Beneficiary’s Know Your Customer (KYC) value',
    example: '3',
  })
  @IsString()
  @IsOptional()
  receiverKYC?: string;

  @ApiProperty({
    description: 'Beneficiary’s Bank Verification Number (BVN)',
    example: '12345678901',
  })
  @IsString()
  @IsOptional()
  receiverBVN?: string;

  @ApiProperty({
    description: 'Unique reference for transaction (maximum of 12 characters)',
    example: 'REF123456789',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(12)
  transactionReference: string;

  @ApiProperty({
    description: 'Transaction Narration (maximum of 100 characters)',
    example: 'Payment for services rendered',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  narration?: string;

  @ApiProperty({
    description:
      'Unique value gotten from Name Enquiry, compulsory when using NIP Gateway',
    example: 'NIPSESSION123',
  })
  @IsString()
  @IsOptional()
  nipSessionID?: string;
}
