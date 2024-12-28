import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { SecurityService } from './security.service';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
import { User } from 'src/shared/decorators/user.decorator';
import { JwtPayload } from 'src/shared/interfaces/jwt-payload.interface';
import { SuccessResponseDto } from 'src/shared/dtos/success-response.dto';
import { SuccessMessage } from 'src/shared/enums/success-message.enum';
import { CreateSecurityQuestionDto } from './dto/create-security-question.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Security')
@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Post('question')
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createSecurityDto: CreateSecurityQuestionDto,
    @User() user: JwtPayload,
  ) {
    try {
      const userId = user.id;
      const resObj = await this.securityService.createSecurityQuestion(
        userId,
        createSecurityDto,
      );
      return new SuccessResponseDto(SuccessMessage.QUESTION_CREATED, resObj);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('question')
  @UseGuards(JwtAuthGuard)
  async getSecurityQuestions(@User() user: JwtPayload) {
    try {
      const userId = user.id;
      const resObj = await this.securityService.getSecurityQuestions(userId);
      return new SuccessResponseDto(SuccessMessage.QUESTION_RETRIEVED, resObj);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
