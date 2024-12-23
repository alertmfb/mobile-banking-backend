import { IsString, IsNotEmpty } from 'class-validator';

export class BusinessAddressVerifyDto {
  @IsString()
  @IsNotEmpty()
  business_name: string;

  @IsString()
  @IsNotEmpty()
  business_mobile: string;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsString()
  @IsNotEmpty()
  mobile: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  landmark: string;

  @IsString()
  @IsNotEmpty()
  lga: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;
}
