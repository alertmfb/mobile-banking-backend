import { IsString, IsNotEmpty } from 'class-validator';

export class BvnFaceVerifyDto {
  @IsString()
  @IsNotEmpty()
  selfie_image: string;

  @IsString()
  @IsNotEmpty()
  bvn: string;
}
