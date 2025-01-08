import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
import { SuccessMessage } from 'src/shared/enums/success-message.enum';
import { SuccessResponseDto } from 'src/shared/dtos/success-response.dto';
import { NameEnquiryDto } from './dtos/name-enquiry.dto';
import { GetTransactionsQueryDto } from './dtos/get-transaction-query.dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getTransactions(@Query() payload: GetTransactionsQueryDto) {
    try {
      const resObj = await this.transactionService.getTransactions(payload);
      return new SuccessResponseDto(
        SuccessMessage.TRANSACTIONS_FETCHED,
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
      return new SuccessResponseDto(SuccessMessage.BANKS_FETCHED, resObj);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('name-enquiry')
  @UseGuards(JwtAuthGuard)
  async nameEnquiry(@Body() payload: NameEnquiryDto) {
    try {
      const resObj = await this.transactionService.nameEnquiry(payload);
      return new SuccessResponseDto(SuccessMessage.NAME_ENQUIRY, resObj);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  
}
