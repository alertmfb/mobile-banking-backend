import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ValidateBvnDto {
  @IsString()
  @IsNotEmpty()
  bvn: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  dob?: string; // Format: yyyy-mm-dd
}
