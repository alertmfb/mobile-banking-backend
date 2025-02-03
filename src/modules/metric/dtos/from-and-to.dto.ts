import { ApiProperty } from '@nestjs/swagger';

export class FromAndToDto {
  @ApiProperty({
    required: false,
    type: String,
    description: 'From date',
  })
  from?: string;

  @ApiProperty({
    required: false,
    type: String,
    description: 'To date',
  })
  to?: string;
}
