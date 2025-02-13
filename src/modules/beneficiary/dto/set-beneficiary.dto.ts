import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDefined, IsNotEmpty } from 'class-validator';

export class SetBeneficiaryDto {
  @ApiProperty({
    description: 'True or false boolean value',
    example: 'true | false',
    required: true,
  })
  @IsDefined()
  @IsBoolean()
  @IsNotEmpty()
  isBeneficiary: boolean;
}
