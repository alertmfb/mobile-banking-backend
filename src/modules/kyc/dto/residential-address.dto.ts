import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResidentialAddressDto {
  @ApiProperty({
    description: 'Street address of the residence',
    example: '123 Lagos Avenue',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'City of the residence',
    example: 'Ikeja',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'State of the residence',
    example: 'Lagos',
  })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    description: 'Zipcode of the residence',
    example: '100001',
  })
  @IsString()
  @IsNotEmpty()
  zipcode: string;

  @ApiProperty({
    description: 'Landmark near the residence',
    example: 'Near Yaba Market',
  })
  @IsString()
  @IsNotEmpty()
  landmark: string;

  @ApiProperty({
    description: 'Local Government Area of the residence',
    example: 'Kosofe',
  })
  @IsString()
  @IsNotEmpty()
  lga: string;
}
