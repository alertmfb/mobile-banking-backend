import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BillPaymentService } from './bill-payment.service';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
import { SuccessResponseDto } from 'src/shared/dtos/success-response.dto';
import { SuccessMessage } from 'src/shared/enums/success-message.enum';
import { User } from 'src/shared/decorators/user.decorator';
import { JwtPayload } from 'src/shared/interfaces/jwt-payload.interface';
import { BuyAirtimeDto } from './dtos/buy-airtime.dto';
import { GetBundlesDto } from './dtos/get-bundles.dto';
import { ValidateProviderNumberDto } from './dtos/validate-number.dto';
import { BuyElectricityDto } from './dtos/buy-electricity.dto';
import { BuyCableTvDto } from './dtos/buy-cable-tv.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BuyInternetDto } from './dtos/buy-internet.dto';

@ApiTags('Bill Payment')
@ApiBearerAuth()
@Controller('bill-payment')
export class BillPaymentController {
  constructor(private readonly billsService: BillPaymentService) {}

  @Get('airtime/providers')
  @UseGuards(JwtAuthGuard)
  async getAirtimeProviders() {
    try {
      const response = await this.billsService.getAirtimeProviders();
      return new SuccessResponseDto(
        SuccessMessage.AIRTIME_PROVIDERS_RETRIEVED,
        response,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('airtime/buy')
  @UseGuards(JwtAuthGuard)
  async buyAirtime(@Body() payload: BuyAirtimeDto, @User() user: JwtPayload) {
    try {
      const userId = user.id;
      const response = await this.billsService.createAirtimeTransaction(
        userId,
        payload,
      );
      return new SuccessResponseDto(SuccessMessage.AIRTIME_PURCHASED, response);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('internet/providers')
  @UseGuards(JwtAuthGuard)
  async getInternetProviders() {
    try {
      const response = await this.billsService.getInternetProviders();
      return new SuccessResponseDto(
        SuccessMessage.INTERNET_PROVIDERS_RETRIEVED,
        response,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('internet/bundles')
  @UseGuards(JwtAuthGuard)
  async getInternetBundles(@Query() payload: GetBundlesDto) {
    try {
      const response = await this.billsService.getInternetBundles(payload);
      return new SuccessResponseDto(
        SuccessMessage.INTERNET_BUNDLES_RETRIEVED,
        response,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('internet/buy')
  @UseGuards(JwtAuthGuard)
  async buyInternet(@Body() payload: BuyInternetDto, @User() user: JwtPayload) {
    try {
      const userId = user.id;
      const response = await this.billsService.createInternetTransaction(
        userId,
        payload,
      );
      return new SuccessResponseDto(
        SuccessMessage.INTERNET_PURCHASED,
        response,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('cable-tv/providers')
  @UseGuards(JwtAuthGuard)
  async getCableTvProviders() {
    try {
      const response = await this.billsService.getCableTvProviders();
      return new SuccessResponseDto(
        SuccessMessage.CABLE_TV_PROVIDERS_RETRIEVED,
        response,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('cable-tv/plans')
  @UseGuards(JwtAuthGuard)
  async getCableTvPlans(@Query() query: GetBundlesDto) {
    try {
      const response = await this.billsService.getCableTvPlans(query);
      return new SuccessResponseDto(
        SuccessMessage.CABLE_TV_PLANS_RETRIEVED,
        response,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('cable-tv/validate')
  @UseGuards(JwtAuthGuard)
  async validateCableTvNumber(@Body() payload: ValidateProviderNumberDto) {
    try {
      const response = await this.billsService.validateCableTvNumber(payload);
      return new SuccessResponseDto(
        SuccessMessage.CABLE_TV_VALIDATED,
        response,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('cable-tv/buy')
  @UseGuards(JwtAuthGuard)
  async buyCableTv(@Body() payload: BuyCableTvDto, @User() user: JwtPayload) {
    try {
      const userId = user.id;
      const response = await this.billsService.buyCableTv(userId, payload);
      return new SuccessResponseDto(
        SuccessMessage.CABLE_TV_PURCHASED,
        response,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('electricity/providers')
  @UseGuards(JwtAuthGuard)
  async getElectricityProviders() {
    try {
      const response = await this.billsService.getElectricityProviders();
      return new SuccessResponseDto(
        SuccessMessage.ELECTRICITY_PROVIDERS_RETRIEVED,
        response,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('electricity/validate')
  @UseGuards(JwtAuthGuard)
  async validateElectricityMeterNumber(
    @Body() payload: ValidateProviderNumberDto,
  ) {
    try {
      const response =
        await this.billsService.validateElectricityMeterNumber(payload);
      return new SuccessResponseDto(
        SuccessMessage.ELECTRICITY_PROVIDERS_RETRIEVED,
        response,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('electricity/buy')
  @UseGuards(JwtAuthGuard)
  async buyElectricity(
    @Body() payload: BuyElectricityDto,
    @User() user: JwtPayload,
  ) {
    try {
      const userId = user.id;
      const response = await this.billsService.buyElectricity(userId, payload);
      return new SuccessResponseDto(
        SuccessMessage.ELECTRICITY_PROVIDERS_RETRIEVED,
        response,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
