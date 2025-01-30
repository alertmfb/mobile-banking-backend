import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetBundlesDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The ID of the service category for internet bundles',
    type: String,
    example: 'internet-mtn',
  })
  serviceCategoryId: string;

  bundleCode: string;
}
