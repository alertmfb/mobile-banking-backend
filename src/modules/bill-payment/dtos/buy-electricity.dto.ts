import { ApiProperty } from '@nestjs/swagger';
import { MeterType } from '@prisma/client';
import { IsString, IsNotEmpty, IsNumber, Length, Min } from 'class-validator';

export class BuyElectricityDto {
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
    description: 'The ID of the service category for electricity',
    type: String,
    example: 'electricity-ikeja-electric',
  })
  serviceCategoryId: string;

  @ApiProperty({
    required: true,
    type: MeterType,
    enum: MeterType,
    enumName: 'MeterType',
    description: 'Electricity provider',
  })
  @IsNotEmpty()
  @IsString()
  meterType: MeterType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The meter number for electricity',
    type: String,
    example: '09012345678',
  })
  meterNumber: string;

  @ApiProperty({
    description: 'The name of the meter owner',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  meterName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The type of electricity meter',
    type: String,
    example: 'PREPAID',
  })
  vendType: 'PREPAID' | 'POSTPAID';

  @ApiProperty({ description: "User's transaction PIN", example: '1234' })
  @IsString()
  @IsNotEmpty()
  @Length(4, 4, { message: 'PIN must be exactly 4 characters long' })
  pin: string;

  @ApiProperty({
    description: 'The amount of airtime to purchase',
    type: Number,
    example: 500,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'Amount must be greater than 0' })
  amount: number;
}
