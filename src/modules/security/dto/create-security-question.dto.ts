import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class SecurityQuestion {
  @ApiProperty({
    description: 'The unique number for the security question',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Number is required.' })
  number: number;

  @ApiProperty({
    description: 'The security question text',
    example: 'What is your favorite color?',
  })
  @IsString()
  @IsNotEmpty({ message: 'Question is required.' })
  question: string;

  @ApiProperty({
    description: 'The answer to the security question',
    example: 'Blue',
  })
  @IsString()
  @IsNotEmpty({ message: 'Answer is required.' })
  answer: string;
}

export class CreateSecurityQuestionDto {
  @ApiProperty({
    description: 'An array of security questions',
    type: [SecurityQuestion],
    example: [
      {
        number: 1,
        question: 'What is your favorite color?',
        answer: 'Blue',
      },
      {
        number: 2,
        question: "What is your pet's name?",
        answer: 'Fluffy',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SecurityQuestion)
  securityQuestions: SecurityQuestion[];
}
