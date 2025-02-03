import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class ValidatePromoCodeDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true, example: '123456' })
  code: string;
}
