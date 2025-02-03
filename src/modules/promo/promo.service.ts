import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { PromoRepository } from './promo.repository';
import { ValidatePromoCodeDto } from './dtos/validate-promo-code.dto';
import { ErrorMessages } from 'src/shared/enums/error.message.enum';

@Injectable()
export class PromoService {
  private readonly promoCode = '123456';
  private readonly promoType = 'SIGNUP';
  constructor(
    private readonly promoRepository: PromoRepository,
    private readonly userService: UserService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async apply(userId: string, payload: ValidatePromoCodeDto) {
    try {
      const { code } = payload;
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (code !== this.promoCode) {
        throw new HttpException(
          ErrorMessages.PROMO_CODE_INVALID,
          HttpStatus.BAD_REQUEST,
        );
      }

      const promo = await this.promoRepository.getOneByCode(code);
      if (promo || promo?.userId === userId) {
        throw new HttpException(
          ErrorMessages.PROMO_CODE_ALREADY_USED,
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.promoRepository.createPromoApply({
        user: { connect: { id: userId } },
        code,
        // type: this.promoType,
      });

      return;
    } catch (error) {
      throw new HttpException(
        error.message || ErrorMessages.PROMO_CODE_INVALID,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
