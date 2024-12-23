import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString } from 'class-validator';

export class FaceVerifyDto {
  @IsString()
  @IsDefined()
  @ApiProperty()
  image: string;
}
