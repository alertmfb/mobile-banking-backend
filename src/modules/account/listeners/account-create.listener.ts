import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AccountCreateEvent } from '../events/account-create.event';
import { Events } from 'src/shared/enums/events.enum';
import { AccountService } from '../account.service';

@Injectable()
export class AccountCreateListener {
  private readonly logger;
  constructor(private readonly accountService: AccountService) {
    this.logger = new Logger(AccountCreateListener.name);
  }

  @OnEvent(Events.ON_CREATE_ACCOUN_NUMBER, { async: true })
  async handleOrderCreatedEvent(payload: AccountCreateEvent) {
    try {
      this.logger.log(`Received event ${Events.ON_CREATE_ACCOUN_NUMBER}`);
      await this.accountService.createAccount(payload.userId);
    } catch (error) {
      this.logger.error(
        `Error in event ${Events.ON_CREATE_ACCOUN_NUMBER}: ${error.message}`,
        error,
      );
    }
  }
}
