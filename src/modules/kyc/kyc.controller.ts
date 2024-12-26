import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Get,
} from '@nestjs/common';
import { KycService } from './kyc.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SuccessResponseDto } from 'src/shared/dtos/success-response.dto';
import { SuccessMessage } from 'src/shared/enums/success-message.enum';
import { ResidentialAddressDto } from './dto/residential-address.dto';
import { NationalityDto } from './dto/nationality.dto';
import { BvnDto } from './dto/bvn.dto';
import { NinDto } from './dto/nin.dto';
import { FaceVerifyDto } from './dto/face.dto';
import { User } from 'src/shared/decorators/user.decorator';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
import { JwtPayload } from 'src/shared/interfaces/jwt-payload.interface';
import { AttestDto } from './dto/attest.dto';

@ApiTags('Know your Customer')
@Controller('kyc')
export class KycController {
  constructor(private readonly kybService: KycService) {}

  @Post('nationality')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: NationalityDto })
  async setNationality(
    @Body() payload: NationalityDto,
    @User() user: JwtPayload,
  ) {
    try {
      const userId = user.id;
      const response = await this.kybService.setNationality(userId, payload);
      return new SuccessResponseDto(SuccessMessage.SET_NATIONALITY, response);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('verify-bvn')
  @ApiBody({ type: BvnDto })
  @UseGuards(JwtAuthGuard)
  async verifyBvn(@Body() payload: BvnDto, @User() user: JwtPayload) {
    try {
      const userId = user.id;
      const response = await this.kybService.verifyBvn(userId, payload);
      return new SuccessResponseDto(SuccessMessage.SET_BVN, response);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('verify-nin')
  @ApiBody({ type: NinDto })
  @UseGuards(JwtAuthGuard)
  async verifyNin(@Body() payload: NinDto, @User() user: JwtPayload) {
    try {
      const userId = user.id;
      const response = await this.kybService.verifyNin(userId, payload);
      return new SuccessResponseDto(SuccessMessage.SET_NIN, response);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('verify-face')
  @ApiBody({ type: FaceVerifyDto })
  @UseGuards(JwtAuthGuard)
  async faceVerify(@Body() payload: FaceVerifyDto, @User() user: JwtPayload) {
    try {
      const userId = user.id;
      const response = await this.kybService.faceVerify(userId, payload);
      return new SuccessResponseDto(SuccessMessage.FACE_VERIFIED, response);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('verify-residential-address')
  @ApiBody({ type: ResidentialAddressDto })
  @UseGuards(JwtAuthGuard)
  async residentialAddress(
    @Body() payload: ResidentialAddressDto,
    @User() user: JwtPayload,
  ) {
    try {
      const userId = user.id;
      const response = await this.kybService.residentialAddress(
        userId,
        payload,
      );
      return new SuccessResponseDto(
        SuccessMessage.RESIDENTIAL_ADDRESS_SAVED,
        response,
      );
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('attestation')
  @ApiBody({ type: Boolean })
  @UseGuards(JwtAuthGuard)
  async attestation(@Body() payload: AttestDto, @User() user: JwtPayload) {
    try {
      const userId = user.id;
      const response = await this.kybService.attestation(userId, payload);
      return new SuccessResponseDto(
        SuccessMessage.BUSINESS_VERIFY_COMPLETED,
        response,
      );
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getKyc(@User() user: JwtPayload) {
    try {
      const userId = user.id;
      const response = await this.kybService.getKyc(userId);
      return new SuccessResponseDto(SuccessMessage.KYB_FETCHED, response);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
