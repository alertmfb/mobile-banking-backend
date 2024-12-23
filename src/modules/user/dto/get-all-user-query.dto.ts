import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetAllUserQueryDto {
  @IsOptional()
  @ApiProperty({ required: false })
  page: number;

  @IsOptional()
  @ApiProperty({ required: false })
  perPage: number;

  @IsOptional()
  @ApiProperty({ required: false })
  keyword: string;

  @IsOptional()
  @ApiProperty({ required: false })
  role: string;
}
