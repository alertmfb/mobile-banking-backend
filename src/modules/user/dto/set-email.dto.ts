import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsEmail } from 'class-validator';

export class SetEmailDto {
  @IsDefined()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email.' })
  @ApiProperty({ required: true, example: 'example@gmail.com' })
  email: string;
}
