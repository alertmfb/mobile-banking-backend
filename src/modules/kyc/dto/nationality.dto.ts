import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString } from 'class-validator';

export class NationalityDto {
  @IsString()
  @IsDefined()
  @ApiProperty()
  country: string;
}
