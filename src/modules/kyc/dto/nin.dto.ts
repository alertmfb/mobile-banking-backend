import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString, MaxLength, MinLength } from 'class-validator';

export class NinDto {
  @IsString()
  @IsDefined()
  @MinLength(11)
  @MaxLength(11)
  @ApiProperty({
    description: 'National Identification Number',
    example: '70123456789',
    minLength: 11,
    maxLength: 11,
  })
  nin: string;
}
