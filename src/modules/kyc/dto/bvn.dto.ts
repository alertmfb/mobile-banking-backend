import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString, MaxLength, MinLength } from 'class-validator';

export class BvnDto {
  @IsString()
  @IsDefined()
  @MinLength(11)
  @MaxLength(11)
  @ApiProperty()
  bvn: string;
}
