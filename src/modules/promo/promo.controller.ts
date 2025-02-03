import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PromoService } from './promo.service';
import { User } from 'src/shared/decorators/user.decorator';
import { SuccessResponseDto } from 'src/shared/dtos/success-response.dto';
import { SuccessMessage } from 'src/shared/enums/success-message.enum';
import { ValidatePromoCodeDto } from './dtos/validate-promo-code.dto';
import { JwtPayload } from 'src/shared/interfaces/jwt-payload.interface';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';

@ApiTags('Promo Code')
@Controller('promo')
export class PromoController {
  constructor(private readonly promoService: PromoService) {}

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  async validatePromoCode(
    @Body() payload: ValidatePromoCodeDto,
    @User() user: JwtPayload,
  ) {
    try {
      const userId = user.id;
      const response = await this.promoService.apply(userId, payload);
      return new SuccessResponseDto(
        SuccessMessage.PROMO_CODE_VALIDATED,
        response,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
