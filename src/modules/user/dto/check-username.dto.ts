import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CheckUsernameDto {
  @IsString()
  @ApiProperty({ required: false })
  username: string;
}
