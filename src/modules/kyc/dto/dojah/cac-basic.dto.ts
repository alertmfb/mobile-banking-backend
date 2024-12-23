import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEnum, IsString } from 'class-validator';

export class CacBasicDto {
  @IsDefined()
  @IsString()
  @ApiProperty({ required: true })
  rcNumber: string;

  @IsDefined()
  @IsString()
  @ApiProperty({ required: true })
  @IsEnum([
    'BUSINESS_NAME',
    'COMPANY',
    'INCORPORATED_TRUSTEES',
    'LIMITED_PARTNERSHIP',
    'LIMITED_LIABILITY_PARTNERSHIP',
  ])
  companyType: string;
}
