import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SetExistingNameDobDto {
  @IsDefined()
  @IsNotEmpty()
  @ApiProperty({ required: true, example: 'John' })
  firstName: string;

  @IsDefined()
  @IsNotEmpty()
  @ApiProperty({ required: true, example: 'Doe' })
  lastName: string;

  @IsOptional()
  @ApiProperty({ required: false, example: 'Doe' })
  otherName: string;

  @IsDefined()
  @IsNotEmpty()
  @ApiProperty({ required: false, example: '1990-01-01' })
  dob: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    required: true,
    example: '08012345678',
    description: 'Account Number',
  })
  accountNumber: string;
}
