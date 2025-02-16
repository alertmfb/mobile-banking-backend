import { Transform, Expose } from 'class-transformer';

export class DataPlanResponseDto {
  @Expose()
  validity: string;

  @Expose()
  bundleCode: string;

  @Expose()
  amount: string;

  @Expose()
  isAmountFixed: boolean;

  @Expose()
  @Transform(({ obj }) => obj.bundleCode, { toClassOnly: true })
  productId: string;
}
