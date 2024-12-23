import { IsString, IsNotEmpty } from 'class-validator';

export class LinelinessDto {
  @IsString()
  @IsNotEmpty()
  image: string;
}
