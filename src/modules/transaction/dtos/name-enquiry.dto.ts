import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString } from 'class-validator';

export class NameEnquiryDto {
  @ApiProperty({
    description: 'Account Number',
    example: '1234567890',
  })
  @IsDefined()
  @IsString()
  accountNumber: string;

  @ApiProperty({
    description: 'Bank Code',
    example: '044',
  })
  @IsDefined()
  @IsString()
  bankCode: string;
}
