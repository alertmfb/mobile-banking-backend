import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Length, Min } from 'class-validator';
import { NetworkProvider } from 'src/shared/enums/all.enum';

export class BuyAirtimeDto {
  @ApiProperty({
    description: 'Unique identifier for the account',
    example: '12345',
  })
  @IsString()
  @IsNotEmpty()
  fromAccountNumber: string;

  @ApiProperty({ description: "User's transaction PIN", example: '1234' })
  @IsString()
  @IsNotEmpty()
  @Length(4, 4, { message: 'PIN must be exactly 4 characters long' })
  pin: string;

  @ApiProperty({
    description: 'The ID of the service category for airtime purchase',
    type: String,
    example: 'airtime-mtn',
  })
  @IsNotEmpty()
  @IsString()
  serviceCategoryId: string;

  @ApiProperty({
    required: false,
    type: NetworkProvider,
    enum: NetworkProvider,
    enumName: 'NetworkProvider',
    description: 'Network provider',
  })
  @IsNotEmpty()
  @IsString()
  network: NetworkProvider;

  @ApiProperty({
    description: 'The amount of airtime to purchase',
    type: Number,
    example: 500,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'Amount must be greater than 0' })
  amount: number;

  @ApiProperty({
    description: 'The phone number to recharge with airtime',
    type: String,
    example: '09131683009',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;
}
