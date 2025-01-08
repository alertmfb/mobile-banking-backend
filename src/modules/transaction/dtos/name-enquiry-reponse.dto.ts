import { Expose, Transform } from 'class-transformer';

export class TransformedResponseDto {
  @Expose({ name: 'Name' })
  name: string;

  @Expose({ name: 'InstitutionCode' })
  institutionCode: string;

  @Expose({ name: 'BVN' })
  bvn: string;

  @Expose({ name: 'IsSuccessful' })
  isSuccessful: boolean;

  @Expose({ name: 'ResponseMessage' })
  responseMessage: string;

  @Transform(({ value }) => value || 'Unknown', { toClassOnly: true })
  kycLevel: string;
}
