import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSecurityQuestionDto } from './dto/create-security-question.dto';
import { SecurityRepository } from './security.repository';
import { UserService } from '../user/user.service';
import { on } from 'events';
import { ErrorMessages } from 'src/shared/enums/error.message.enum';

@Injectable()
export class SecurityService {
  constructor(
    private readonly securityRepository: SecurityRepository,
    private readonly userService: UserService,
  ) {}
  async createSecurityQuestion(
    userId: string,
    payload: CreateSecurityQuestionDto,
  ) {
    try {
      const questions = payload.securityQuestions;
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      for (const question of questions) {
        const oneQuestion = await this.securityRepository.findOneByQuery({
          number: question.number,
          userId,
        });
        if (oneQuestion) {
          oneQuestion.question = question.question;
          oneQuestion.answer = question.answer;
          await this.securityRepository.updateSecurityQuestion(
            oneQuestion.id,
            oneQuestion,
          );
        } else {
          await this.securityRepository.createSecurityQuestions({
            question: question.question,
            answer: question.answer,
            number: question.number,
            user: {
              connect: {
                id: userId,
              },
            },
          });
        }
      }
      return;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getSecurityQuestions(userId: string) {
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      return await this.securityRepository.findAllByUserId(userId);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
