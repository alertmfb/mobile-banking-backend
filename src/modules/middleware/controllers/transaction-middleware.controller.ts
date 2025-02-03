import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetAllTransactionQueryDto } from 'src/modules/transaction/dtos/get-all-transaction-query.dto';
import { TransactionService } from 'src/modules/transaction/transaction.service';
import { SuccessResponseDto } from 'src/shared/dtos/success-response.dto';
import { SuccessMessage } from 'src/shared/enums/success-message.enum';

@ApiTags('Middleware Consumer Banking Transaction')
@Controller('middleware/consumer/transaction')
export class TransactionMiddlewareController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('')
  async getAllTransaction(@Query() query: GetAllTransactionQueryDto) {
    try {
      const response = await this.transactionService.getTransactions(query);
      return new SuccessResponseDto(
        SuccessMessage.TRANSACTION_RETRIEVED,
        response,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
