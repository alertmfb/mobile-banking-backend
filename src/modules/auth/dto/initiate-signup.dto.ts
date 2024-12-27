import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isPhoneOrAccount', async: false })
class IsPhoneOrAccountConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    const phoneRegex = /^(070|071|080|081|090|091)\d{8}$/;
    const accountRegex = /^\d{10}$/;
    return phoneRegex.test(value) || accountRegex.test(value);
  }
  defaultMessage() {
    return 'Value must be a valid Nigerian phone number or a 10-digit account number';
  }
}

export class InitiateSignUpDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Validate(IsPhoneOrAccountConstraint)
  @ApiProperty({
    required: true,
    example: '08012345678 or 1100063641',
    description: 'Nigerian phone number or 10-digit account number',
  })
  phoneNumber: string;

  @IsOptional()
  @IsEnum(['NEW', 'EXISTING'])
  @ApiProperty({
    required: false,
    example: 'EXISTING',
    description: 'New by default',
  })
  onboardType?: 'NEW' | 'EXISTING';
}
