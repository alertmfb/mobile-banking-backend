import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  HttpException,
  HttpStatus, UseGuards
} from "@nestjs/common";
import { CardService } from './card.service';
import { CreateCardRequestDto } from './dto/create-card-request.dto';
import { User } from 'src/shared/decorators/user.decorator';
import { JwtPayload } from 'src/shared/interfaces/jwt-payload.interface';
import { SuccessMessage } from 'src/shared/enums/success-message.enum';
import { SuccessResponseDto } from 'src/shared/dtos/success-response.dto';
import { JwtAuthGuard } from "../../shared/guards/jwt.guard";

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post('request')
  @UseGuards(JwtAuthGuard)
  async createRequest(@Body() data: CreateCardRequestDto, @User() user: JwtPayload) {
    try {
      const response = await this.cardService.create(user.id, data);
      return new SuccessResponseDto(
        SuccessMessage.CARD_REQUEST_CREATED,
        response,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('request')
  @UseGuards(JwtAuthGuard)
  async findAllRequest(@User() user: JwtPayload) {
    try {
      const response = await this.cardService.findAll(user.id);
      return new SuccessResponseDto(
        SuccessMessage.CARD_REQUESTS_RETRIEVED,
        response,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOneRequest(@Param('id') id: string, @User() user: JwtPayload) {
    try {
      const response = await this.cardService.findOne(id, user.id);
      return new SuccessResponseDto(
        SuccessMessage.CARD_REQUEST_RETRIEVED,
        response,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async cancelRequest(@Param('id') id: string, @User() user: JwtPayload) {
    try {
      const response = await this.cardService.cancelRequest(id, user.id);
      return new SuccessResponseDto(
        SuccessMessage.CARD_REQUEST_RETRIEVED,
        response,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
