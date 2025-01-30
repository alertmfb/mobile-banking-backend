import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDefined } from 'class-validator';

export class SetNotificationPreferenceDto {
  @ApiProperty({
    description: 'Enable email notifications for credit transactions',
    example: true,
    required: true,
  })
  @IsBoolean()
  @IsDefined()
  creditEmail: boolean;

  @ApiProperty({
    description: 'Enable SMS notifications for credit transactions',
    example: false,
    required: true,
  })
  @IsBoolean()
  @IsDefined()
  creditSms: boolean;

  @ApiProperty({
    description: 'Enable push notifications for credit transactions',
    example: true,
    required: true,
  })
  @IsBoolean()
  @IsDefined()
  creditPush: boolean;

  @ApiProperty({
    description: 'Enable WhatsApp notifications for credit transactions',
    example: false,
    required: true,
  })
  @IsBoolean()
  @IsDefined()
  creditWhatsapp: boolean;

  @ApiProperty({
    description: 'Enable email notifications for debit transactions',
    example: true,
    required: true,
  })
  @IsBoolean()
  @IsDefined()
  debitEmail: boolean;

  @ApiProperty({
    description: 'Enable SMS notifications for debit transactions',
    example: false,
    required: true,
  })
  @IsBoolean()
  @IsDefined()
  debitSms: boolean;

  @ApiProperty({
    description: 'Enable push notifications for debit transactions',
    example: true,
    required: true,
  })
  @IsBoolean()
  @IsDefined()
  debitPush: boolean;

  @ApiProperty({
    description: 'Enable WhatsApp notifications for debit transactions',
    example: false,
    required: true,
  })
  @IsBoolean()
  @IsDefined()
  debitWhatsapp: boolean;
}
