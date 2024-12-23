import { IsString, IsNotEmpty } from 'class-validator';

export class NinVerifyDto {
  @IsString()
  @IsNotEmpty()
  selfie_image: string;

  @IsString()
  last_name: string;

  @IsString()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  nin: string;
}
