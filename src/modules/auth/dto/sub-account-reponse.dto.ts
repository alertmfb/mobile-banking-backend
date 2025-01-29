import { Expose } from 'class-transformer';

export class SubAccountResponseDto {
  @Expose({ name: 'accountStatus' })
  accountStatus: string;

  @Expose({ name: 'accountType' })
  accountType: string;

  @Expose({ name: 'availableBalance' })
  availableBalance: string;

  @Expose({ name: 'branch' })
  branch: string;

  @Expose({ name: 'customer_id' })
  customerID: string;

  @Expose({ name: 'account_name' })
  accountName: string;

  @Expose({ name: 'date_created' })
  dateCreated: string;

  @Expose({ name: 'last_activity_date' })
  lastActivityDate: string;

  @Expose({ name: 'ledger_balance' })
  ledgerBalance: string;

  @Expose({ name: 'nuban' })
  NUBAN: string;

  @Expose({ name: 'reference_no' })
  referenceNo: string | null;

  @Expose({ name: 'withdrawable_amount' })
  withdrawableAmount: string;

  @Expose({ name: 'kyc_level' })
  kycLevel: string;

  constructor(partial: Partial<SubAccountResponseDto>) {
    Object.assign(this, partial);
  }
}
