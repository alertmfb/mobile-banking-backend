import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { CardRepository } from './card.repository';
import { AccountModule } from '../account/account.module'
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule, AccountModule],
  controllers: [CardController],
  providers: [CardService, CardRepository],
})
export class CardModule {}
