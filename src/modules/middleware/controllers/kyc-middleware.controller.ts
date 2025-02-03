import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { KycService } from 'src/modules/kyc/kyc.service';
import { SuccessResponseDto } from 'src/shared/dtos/success-response.dto';
import { SuccessMessage } from 'src/shared/enums/success-message.enum';

@ApiTags('Middleware Consumer Banking')
@Controller('middleware')
export class KycMiddlewareController {
  constructor(private readonly kycService: KycService) {}

  // @Get('consumer')
  // async getAllConsumer(@Query() query: GetAllConsumerDto) {
  //   try {
  //     const response = await this.kycService.getAllConsumer(query);
  //     return new SuccessResponseDto(
  //       SuccessMessage.CONSUMER_RETRIEVED,
  //       response,
  //     );
  //   } catch (error) {
  //     throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  // @Get('consumer/:consumerId')
  // async getConsumerById(@Param('businessId') businessId: string) {
  //   try {
  //     const response = await this.kycService.getConsumerById(businessId);
  //     return new SuccessResponseDto(
  //       SuccessMessage.CONSUMER_RETRIEVED,
  //       response,
  //     );
  //   } catch (error) {
  //     throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  // @Get('status/:userId')
  // async getKYBStatus(userId: string) {
  //   try {
  //     const response = await this.kycService.getAllKyb(userId);
  //     return new SuccessResponseDto(SuccessMessage.KYB_RETRIEVED, response);
  //   } catch (error) {
  //     throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }
}
