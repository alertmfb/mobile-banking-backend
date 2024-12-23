import { Controller, Post } from '@nestjs/common';
import { AccountService } from './account.service';
// import { CreateAccountDto } from './dto/create-account.dto';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  create() {
    return this.accountService.createAccount('userId');
  }
}
