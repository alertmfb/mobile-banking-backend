import { Expose, Transform } from 'class-transformer';

export class AccountBalanceResponseDto {
  @Expose({ name: 'AvailableBalance' })
  @Transform(({ value }) => String(value), { toClassOnly: true })
  availableBalance: number;

  @Expose({ name: 'LedgerBalance' })
  @Transform(({ value }) => String(value), { toClassOnly: true })
  ledgerBalance: number;

  @Expose({ name: 'WithdrawableBalance' })
  @Transform(({ value }) => String(value), { toClassOnly: true })
  withdrawableBalance: number;

  @Expose({ name: 'AccountType' })
  accountType: string;
}
