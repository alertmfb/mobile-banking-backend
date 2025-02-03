import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BuildingType } from 'src/shared/enums/all.enum';

export class ResidentialAddressDto {
  @ApiPropertyOptional({
    description: 'Street address of the residence',
    example: '123 Lagos Avenue',
  })
  @IsString()
  @IsOptional()
  address: string;

  @ApiPropertyOptional({
    description: 'City of the residence',
    example: 'Ikeja',
  })
  @IsString()
  @IsOptional()
  city: string;

  @ApiPropertyOptional({
    description: 'State of the residence',
    example: 'Lagos',
  })
  @IsString()
  @IsOptional()
  state: string;

  @ApiPropertyOptional({
    description: 'Zipcode of the residence',
    example: '100001',
  })
  @IsString()
  @IsOptional()
  zipcode: string;

  @ApiPropertyOptional({
    description: 'Landmark near the residence',
    example: 'Near Yaba Market',
  })
  @IsString()
  @IsOptional()
  landmark: string;

  @ApiPropertyOptional({
    description: 'Local Government Area of the residence',
    example: 'Kosofe',
  })
  @IsString()
  @IsOptional()
  lga: string;

  @ApiPropertyOptional({
    description: 'Color of the building',
    example: 'Blue',
  })
  @IsString()
  @IsOptional()
  buildingColour?: string;

  @ApiPropertyOptional({
    description: 'Color of the gate',
    example: 'Black',
  })
  @IsString()
  @IsOptional()
  gateColor?: string;

  @ApiPropertyOptional({
    description: 'Type of the building',
    example: 'Duplex',
    enum: BuildingType,
  })
  @IsString()
  @IsOptional()
  buildingType?: BuildingType;

  @ApiPropertyOptional({
    description: 'Length of occupancy',
    example: '2 years',
  })
  @IsString()
  @IsOptional()
  occupancyLength?: string;

  @ApiPropertyOptional({
    description: 'Name of an identifier (e.g., caretaker)',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  identifierName?: string;

  @ApiPropertyOptional({
    description: 'Relationship of the identifier to the resident',
    example: 'Caretaker',
  })
  @IsString()
  @IsOptional()
  identifierRelationship?: string;

  @ApiPropertyOptional({
    description: 'Other names associated with the residence',
    example: 'The Blue House',
  })
  @IsString()
  @IsOptional()
  otherName?: string;

  @ApiPropertyOptional({
    description: 'Photo of the street (base64)',
    example: 'base64 String',
  })
  @IsString()
  @IsOptional()
  streetPhoto?: string;

  @ApiPropertyOptional({
    description: 'Photo of the building (base64)',
    example: 'base64 String',
  })
  @IsString()
  @IsOptional()
  buildingPhoto?: string;
}
