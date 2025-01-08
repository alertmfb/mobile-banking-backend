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

@ValidatorConstraint({ name: 'isPhoneAccountOrEmail', async: false })
class IsPhoneAccountOrEmailConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    const phoneRegex = /^(070|071|080|081|090|091)\d{8}$/;
    const accountRegex = /^\d{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      phoneRegex.test(value) ||
      accountRegex.test(value) ||
      emailRegex.test(value)
    );
  }

  defaultMessage() {
    return 'Value must be a valid Nigerian phone number, a 10-digit account number, or an email address';
  }
}

export class InitiateSignUpDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Validate(IsPhoneAccountOrEmailConstraint)
  @ApiProperty({
    required: true,
    example: '08012345678, 1100063555, or user@example.com',
    description:
      'Nigerian phone number, 10-digit account number, or email address',
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
