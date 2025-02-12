import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, IsNumber } from 'class-validator';
import { TvProvider } from 'src/shared/enums/all.enum';

export class BuyCableTvDto {
  @ApiProperty({
    description: 'Unique identifier for the account',
    example: '12345',
  })
  @IsString()
  @IsNotEmpty()
  fromAccountNumber: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The ID of the service category for cable TV',
    type: String,
    example: 'cable-tv-gotv',
  })
  serviceCategoryId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The smart card number for cable TV',
    type: String,
    example: '09012345678',
  })
  cardNumber: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The bundle code for the cable TV',
    type: String,
    example: 'GOTV200',
  })
  bundleCode: string;

  @ApiProperty({
    required: true,
    type: TvProvider,
    enum: TvProvider,
    enumName: 'TvProvider',
    description: 'Cable TV Providers',
  })
  provider: TvProvider;

  @ApiProperty({
    required: true,
    example: 'John Doe',
    description: 'Customer Name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    required: true,
    description: 'The period of the invoice',
  })
  @IsNumber()
  @IsNotEmpty()
  invoicePeriod: number;

  @ApiProperty({
    required: true,
    description: 'The amount to pay',
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ description: "User's transaction PIN", example: '1234' })
  @IsString()
  @IsNotEmpty()
  @Length(4, 4, { message: 'PIN must be exactly 4 characters long' })
  pin: string;
}
