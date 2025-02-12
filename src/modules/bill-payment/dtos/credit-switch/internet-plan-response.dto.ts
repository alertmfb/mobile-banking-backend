import {Expose, Transform} from 'class-transformer';

export class DataBundleResponseDto {
    @Expose({ name: 'amount' })
    amount: number;

    @Expose({ name: 'productId' })
    @Transform(({ value }) => value, { toClassOnly: true })
    productId: string;

    @Expose({ name: 'validity' })
    @Transform(({ value }) => value, { toClassOnly: true })
    validity: string;

    @Expose({ name: 'databundle' })
    @Transform(({ value }) => value, { toClassOnly: true })
    bundleCode: string;
}
