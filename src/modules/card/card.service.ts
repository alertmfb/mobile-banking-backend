import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AccountService } from '../account/account.service';
import { CardRepository } from './card.repository';
import { ErrorMessages } from 'src/shared/enums/error.message.enum';
import { CreateCardRequestDto } from './dto/create-card-request.dto';

@Injectable()
export class CardService {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly userService: UserService,
    private readonly accountService: AccountService,
  ) {}
  async create(userId: string, payload: CreateCardRequestDto) {
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      const account = await this.accountService.findOne(payload.accountId);
      if (!account || account.userId !== userId) {
        throw new HttpException(
          ErrorMessages.ACCOUNT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      return this.cardRepository.createCardRquest({
        user: { connect: { id: userId } },
        account: { connect: { id: payload.accountId } },
        deliveryOption: payload.deliveryOption,
        cardType: payload.cardType,
        pickupBranch: payload.pickupBranch,
        address: payload.address,
        city: payload.city,
        zipCode: payload.zipCode,
        status: 'RECEIVED',
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(userId: string) {
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      return this.cardRepository.getManyByUserId(userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string, userId: string) {
    try {
      if (userId) {
        const user = await this.userService.findOne(userId);
        if (!user) {
          throw new HttpException(
            ErrorMessages.USER_NOT_FOUND,
            HttpStatus.NOT_FOUND,
          );
        }
      }

      const cardRequest = await this.cardRepository.getOne(id);
      if (!cardRequest || cardRequest.userId !== userId) {
        throw new HttpException(
          ErrorMessages.CARD_REQUEST_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      return cardRequest;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async cancelRequest(id: string, userId: string) {
    try {
      if (userId) {
        const user = this.userService.findOne(userId);
        if (!user) {
          throw new HttpException(
            ErrorMessages.USER_NOT_FOUND,
            HttpStatus.NOT_FOUND,
          );
        }
      }

      const cardRequest = await this.cardRepository.getOne(id);
      if (!cardRequest || cardRequest.userId !== userId) {
        throw new HttpException(
          ErrorMessages.CARD_REQUEST_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      return this.cardRepository.updateCardRequest(id, { status: 'CANCELLED' });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
