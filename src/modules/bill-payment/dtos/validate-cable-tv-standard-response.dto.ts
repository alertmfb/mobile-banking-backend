import { Transform, Type, plainToInstance, Expose } from 'class-transformer';

export class ValidateCableTvStandardResponseDto {
  @Expose()
  @Transform(
    ({ obj }) =>
      obj.customerName ||
      `${obj.firstname || ''} ${obj.lastname || ''}`.trim() ||
      obj.name,
    { toClassOnly: true },
  )
  name: string;

  @Expose()
  @Transform(
    ({ obj }) => obj.customernumber || obj.customerNo || obj.smartCardCode,
    { toClassOnly: true },
  )
  cardNumber: string | number;

  @Expose()
  @Transform(({ obj }) => obj.balance ?? obj.amount ?? null, {
    toClassOnly: true,
  })
  balance: number | null;

  @Expose()
  @Transform(({ obj }) => obj.dueDate ?? null, { toClassOnly: true })
  dueDate?: string | null;
}
