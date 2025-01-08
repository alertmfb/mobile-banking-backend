import { Expose } from 'class-transformer';

export class AccountBalanceResponseDto {
  @Expose({ name: 'AccountNumber' })
  accountNumber: string;

  @Expose({ name: 'AccountName' })
  accountName: string;

  @Expose({ name: 'AccountBalance' })
  accountBalance: number;

  @Expose({ name: 'Currency' })
  currency: string;

  @Expose({ name: 'IsSuccessful' })
  isSuccessful: boolean;

  @Expose({ name: 'ResponseMessage' })
  responseMessage: string;
}
