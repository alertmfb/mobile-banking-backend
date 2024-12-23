import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDefined } from 'class-validator';

export class AttestDto {
  @IsBoolean()
  @IsDefined()
  @ApiProperty()
  attest: boolean;
}
