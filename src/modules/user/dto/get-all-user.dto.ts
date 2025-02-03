import { ApiProperty } from '@nestjs/swagger';

export class GetAllUserDto {
  @ApiProperty({
    required: false,
    type: Number,
    default: 1,
    description: 'Page number',
  })
  page: number;

  @ApiProperty({
    required: false,
    type: Number,
    default: 10,
    description: 'Items per page',
  })
  perPage: number;

  @ApiProperty({
    required: false,
    type: String,
    description: 'Search query',
  })
  keyword: string;
}
