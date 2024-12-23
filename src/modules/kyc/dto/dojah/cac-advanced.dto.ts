import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEnum, IsString } from 'class-validator';

export class CacAdvancedDto {
  @IsDefined()
  @IsString()
  @ApiProperty({ required: true })
  rcNumber: string;

  @IsDefined()
  @IsString()
  @ApiProperty({ required: true })
  @IsEnum(['co', 'bn', 'it'])
  type: string;
}
