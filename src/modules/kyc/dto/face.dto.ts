import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString } from 'class-validator';

export class FaceVerifyDto {
  @IsString()
  @IsDefined()
  @ApiProperty({
    required: true,
    example:
      'data:image/jpeg;base64, /9j/4AAQSkZJRgABAQEAYABgAAD/4QBYRXhpZgAATU0AKgAAAAgAA1',
  })
  image: string;
}
