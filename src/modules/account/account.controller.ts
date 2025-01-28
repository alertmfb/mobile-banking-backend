import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
import { User } from 'src/shared/decorators/user.decorator';
import { JwtPayload } from 'src/shared/interfaces/jwt-payload.interface';
import { SuccessResponseDto } from 'src/shared/dtos/success-response.dto';
// import { CreateAccountDto } from './dto/create-account.dto';
import { SuccessMessage } from '../../shared/enums/success-message.enum';
import { GenerateStatementQueryDto } from './dto/generate-statement-query.dto';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  create() {
    return this.accountService.createAccount('userId');
  }

  @Get('details')
  @UseGuards(JwtAuthGuard)
  async getUserAccount(@User() user: JwtPayload) {
    try {
      const userId = user.id;
      const resObj = await this.accountService.getUserAccount(userId);
      return new SuccessResponseDto(
        SuccessMessage.ACCOUNT_DETAILS_RETRIVED,
        resObj,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('balance-enquiry')
  @UseGuards(JwtAuthGuard)
  async getAccountBalance(@User() user: JwtPayload) {
    try {
      const userId = user.id;
      const resObj = await this.accountService.getAccountBalance(userId);
      return new SuccessResponseDto(
        SuccessMessage.ACCOUNT_BALANCE_RETRIVED,
        resObj,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('close-account')
  @UseGuards(JwtAuthGuard)
  async closeAccount(@User() user: JwtPayload) {
    try {
      const userId = user.id;
      const resObj = await this.accountService.closeAccount(userId);
      return new SuccessResponseDto(SuccessMessage.ACCOUNT_CLOSED, resObj);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('generate-statement')
  @UseGuards(JwtAuthGuard)
  async generateStatement(
    @Query() payload: GenerateStatementQueryDto,
    @User() user: JwtPayload,
  ) {
    try {
      const userId = user.id;
      const resObj = await this.accountService.generateStatement(
        userId,
        payload,
      );
      return new SuccessResponseDto(
        SuccessMessage.TRANSACTIONS_RETRIEVED,
        resObj,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
