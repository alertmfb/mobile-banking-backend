import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
import { User } from 'src/shared/decorators/user.decorator';
import { JwtPayload } from 'src/shared/interfaces/jwt-payload.interface';
import { SuccessResponseDto } from 'src/shared/dtos/success-response.dto';
// import { CreateAccountDto } from './dto/create-account.dto';
import { SuccessMessage } from '../../shared/enums/success-message.enum';

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
}
