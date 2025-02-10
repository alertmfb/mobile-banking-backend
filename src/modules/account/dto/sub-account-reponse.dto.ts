import { Expose } from 'class-transformer';

export class SubAccountResponseDto {
  @Expose()
  withdrawableAmount: string;

  @Expose()
  accountType: string;

  @Expose()
  accountName: string;

  @Expose({ name: 'NUBAN' })
  accountNumber: string;

  constructor(partial: Partial<SubAccountResponseDto>) {
    Object.assign(this, partial);
  }
}
