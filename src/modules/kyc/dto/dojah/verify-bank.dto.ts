import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyBankAccountDto {
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @IsString()
  @IsNotEmpty()
  bankCode: string;
}
