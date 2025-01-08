import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString } from 'class-validator';

export class CloseAccountDto {
  @ApiProperty({
    description: 'Narration for closing account',
    example: 'I want to close my account',
  })
  @IsString()
  @IsDefined()
  narration: string;
}
