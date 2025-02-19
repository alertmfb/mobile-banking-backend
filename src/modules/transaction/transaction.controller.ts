import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
import { SuccessMessage } from 'src/shared/enums/success-message.enum';
import { SuccessResponseDto } from 'src/shared/dtos/success-response.dto';
import { NameEnquiryDto } from './dtos/name-enquiry.dto';
import { SendMoneyDto } from './dtos/send-money.dto';
import { User } from 'src/shared/decorators/user.decorator';
import { JwtPayload } from 'src/shared/interfaces/jwt-payload.interface';
import { ConfirmPinDto } from './dtos/confirm-pin-query.dto';
import { SetPinDto } from '../auth/dto/set-pin.dto';
import { SetTransactionLimitDto } from './dtos/set-transaction-limit.dto';
import { GetAllTransactionQueryDto } from './dtos/get-all-transaction-query.dto';
import { TransactionWebhookDto } from './dtos/transaction-webhook.dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getTransactions(
    @Query() payload: GetAllTransactionQueryDto,
    @User() user: JwtPayload,
  ) {
    try {
      const userId = user.id;
      const resObj = await this.transactionService.getTransactions(
        payload,
        userId,
      );
      return new SuccessResponseDto(
        SuccessMessage.TRANSACTIONS_RETRIEVED,
        resObj,
      );
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('fetch-banks')
  @UseGuards(JwtAuthGuard)
  async fetchBanks() {
    try {
      const resObj = await this.transactionService.fetchBanks();
      return new SuccessResponseDto(SuccessMessage.BANKS_RETRIEVED, resObj);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('name-enquiry')
  @UseGuards(JwtAuthGuard)
  async nameEnquiry(@Body() payload: NameEnquiryDto) {
    try {
      const resObj = await this.transactionService.nameEnquiry(payload);
      return new SuccessResponseDto(SuccessMessage.NAME_ENQUIRY, resObj);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('pin-set-check')
  @UseGuards(JwtAuthGuard)
  async pinCheck(@User() user: JwtPayload) {
    try {
      const userId = user.id;
      const resObj = await this.transactionService.checkPinSet(userId);
      return new SuccessResponseDto(SuccessMessage.PIN_SET_CHECK, resObj);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('confirm-pin')
  @UseGuards(JwtAuthGuard)
  async confirmPin(@Body() payload: ConfirmPinDto, @User() user: JwtPayload) {
    try {
      const userId = user.id;
      const resObj = await this.transactionService.confirmPin(userId, payload);
      return new SuccessResponseDto(SuccessMessage.PIN_CONFIRMED, resObj);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('set-pin')
  @UseGuards(JwtAuthGuard)
  async setPin(@Body() payload: SetPinDto, @User() user: JwtPayload) {
    try {
      const userId = user.id;
      const resObj = await this.transactionService.setPin(userId, payload);
      return new SuccessResponseDto(SuccessMessage.PIN_SET, resObj);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('send-money')
  @UseGuards(JwtAuthGuard)
  async sendMoney(@Body() payload: SendMoneyDto, @User() user: JwtPayload) {
    try {
      const userId = user.id;
      const resObj = await this.transactionService.sendMoney(userId, payload);
      return new SuccessResponseDto(SuccessMessage.MONEY_SENT, resObj);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('send-money-fee')
  @UseGuards(JwtAuthGuard)
  async getFee(@Query('amount') amount: number) {
    try {
      const resObj = await this.transactionService.getFee(amount);
      return new SuccessResponseDto(SuccessMessage.FEE_RETRIEVED, resObj);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('limit')
  @UseGuards(JwtAuthGuard)
  async setLimit(
    @Body() payload: SetTransactionLimitDto,
    @User() user: JwtPayload,
  ) {
    try {
      const userId = user.id;
      console.log('userId', userId);
      const resObj = await this.transactionService.setLimit(userId, payload);
      return new SuccessResponseDto(SuccessMessage.LIMIT_SET, resObj);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('limit')
  @UseGuards(JwtAuthGuard)
  async getLimit(@User() user: JwtPayload) {
    try {
      const userId = user.id;
      const resObj = await this.transactionService.getLimit(userId);
      return new SuccessResponseDto(SuccessMessage.LIMIT_RETRIEVED, resObj);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('webhook/core-banking')
  // @UseGuards(JwtAuthGuard)
  async setNotification(@Body() payload: TransactionWebhookDto) {
    try {
      await this.transactionService.handleTransactionWebhook(payload);
      return HttpStatus.OK;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  async getTransactionById(@Param('id') id: string, @User() user: JwtPayload) {
    try {
      const userId = user.id;
      const resObj = await this.transactionService.getOneForUser(userId, id);
      return new SuccessResponseDto(
        SuccessMessage.TRANSACTION_RETRIEVED,
        resObj,
      );
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
