import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class InitiateSignInDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    required: true,
    example: '08012345678',
    description: 'Phone number or Account Number',
  })
  phoneNumber: string;
}
