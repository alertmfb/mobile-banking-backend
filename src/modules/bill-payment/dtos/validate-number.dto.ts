import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ValidateProviderNumberDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The ID of the service category for internet bundles',
    type: String,
    example: 'cable-tv-gotv || electricity-ikeja-electric',
  })
  serviceCategoryId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description:
      'The meter number for electricity or smart card number for cable TV',
    type: String,
    example: '09012345678',
  })
  cardNumber: string;

  @ApiProperty({
    description: 'The type of vending',
    enum: ['PREPAID', 'POSTPAID'],
    enumName: 'VendType',
  })
  @IsOptional()
  vendType?: string;
}
