import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { BeneficiaryService } from './beneficiary.service';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { GetAllBeneficiaryQueryDto } from './dto/get-all-beneficiary-query.dto';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';
import { User } from '../../shared/decorators/user.decorator';
import { SuccessResponseDto } from '../../shared/dtos/success-response.dto';
import { SuccessMessage } from '../../shared/enums/success-message.enum';
import { JwtAuthGuard } from '../../shared/guards/jwt.guard';

@Controller('beneficiary')
export class BeneficiaryController {
  constructor(private readonly beneficiaryService: BeneficiaryService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query() query: GetAllBeneficiaryQueryDto,
    @User() user: JwtPayload,
  ) {
    try {
      const userId = user.id;
      const response = await this.beneficiaryService.getAll(userId, query);
      return new SuccessResponseDto(
        SuccessMessage.BENEFICIARY_RETRIEVED,
        response,
      );
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() payload: CreateBeneficiaryDto,
    @User() user: JwtPayload,
  ) {
    try {
      const userId = user.id;
      const response = await this.beneficiaryService.create(userId, payload);
      return new SuccessResponseDto(
        SuccessMessage.BENEFICIARY_CREATED,
        response,
      );
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':/id/make-beneficiary')
  @UseGuards(JwtAuthGuard)
  async makeBeneficiary(@Param('id') id: string, @User() user: JwtPayload) {
    try {
      const userId = user.id;
      const response = await this.beneficiaryService.makeBeneficiary(
        userId,
        id,
      );
      return new SuccessResponseDto(SuccessMessage.MADE_BENEFICIARY, response);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @User() user: JwtPayload) {
    try {
      const userId = user.id;
      const response = await this.beneficiaryService.getOne(userId, id);
      return new SuccessResponseDto(
        SuccessMessage.BENEFICIARY_RETRIEVED,
        response,
      );
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @User() user: JwtPayload) {
    try {
      const userId = user.id;
      const response = await this.beneficiaryService.delete(userId, id);
      return new SuccessResponseDto(
        SuccessMessage.BENEFICIARY_DELETED,
        response,
      );
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
