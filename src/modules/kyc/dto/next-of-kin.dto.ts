import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Relationship } from 'src/shared/enums/all.enum';

export class CreateNextOfKinDto {
  @ApiProperty({
    description: 'First name of the next of kin',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Last name of the next of kin',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Phone number of the next of kin',
    example: '+2348012345678',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'Email address of the next of kin',
    example: 'johndoe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Address of the next of kin',
    example: '123 Lagos Avenue',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({
    description: 'City of the next of kin',
    example: 'Ikeja',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    description: 'Country of the next of kin',
    example: 'Nigeria',
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({
    description: 'Relationship of the next of kin to the user',
    example: 'Father',
    enum: Relationship,
    enumName: 'Relationship',
  })
  @IsString()
  @IsNotEmpty()
  relationship: Relationship;
}
