import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty } from 'class-validator';

export class SetNameDobDto {
  @IsDefined()
  @IsNotEmpty()
  @ApiProperty({ required: true, example: 'John' })
  firstName: string;

  @IsDefined()
  @IsNotEmpty()
  @ApiProperty({ required: true, example: 'Doe' })
  lastName: string;

  @IsDefined()
  @IsNotEmpty()
  @ApiProperty({ required: true, example: 'Doe' })
  otherName: string;

  @IsDefined()
  @IsNotEmpty()
  @ApiProperty({ required: false, example: '1990-01-01' })
  dob: string;
}
