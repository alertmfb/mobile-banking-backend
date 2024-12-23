import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class IndividualAddressVerifyDto {
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsString()
  @IsNotEmpty()
  middle_name: string;

  @IsDateString()
  @IsNotEmpty()
  dob: string; // Format: yyyy-mm-dd

  @IsString()
  @IsNotEmpty()
  gender: string;

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
  state: string;
}
