import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
import { JwtPayload } from 'src/shared/interfaces/jwt-payload.interface';
import { User } from 'src/shared/decorators/user.decorator';
import { CheckUsernameDto } from './dto/check-username.dto';
import { SuccessResponseDto } from 'src/shared/dtos/success-response.dto';
import { SuccessMessage } from 'src/shared/enums/success-message.enum';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { ChangePasscodeDto } from './dto/change-passcode.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { SetEmailDto } from './dto/set-email.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { SetPhoneDto } from './dto/set-phone.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@User() user: JwtPayload) {
    try {
      console.log('user', user);
      const resObj = await this.userService.getMe(user.id);
      return new SuccessResponseDto(SuccessMessage.ME, resObj);
    } catch (e) {
      return e;
    }
  }

  @Get('check-username')
  @UseGuards(JwtAuthGuard)
  async checkUsername(
    @Query() payload: CheckUsernameDto,
    @User() user: JwtPayload,
  ) {
    try {
      const { username } = payload;
      const userId = user.id;
      const resObj = await this.userService.checkUsername(userId, username);
      return new SuccessResponseDto(SuccessMessage.USERNAME_AVAILABLE, resObj);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch('update-username')
  @UseGuards(JwtAuthGuard)
  async updateUsername(
    @Body() payload: UpdateUsernameDto,
    @User() user: JwtPayload,
  ) {
    try {
      const userId = user.id;
      const resObj = await this.userService.updateUsername(
        userId,
        payload.username,
      );
      return new SuccessResponseDto(SuccessMessage.USERNAME_UPDATED, resObj);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('set-email')
  @UseGuards(JwtAuthGuard)
  async setEmail(@User() user: JwtPayload, @Body() payload: SetEmailDto) {
    try {
      const userId = user.id;
      const response = await this.userService.setEmail(userId, payload);
      return new SuccessResponseDto(SuccessMessage.EMAIL_SET, response);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('verify-email')
  @UseGuards(JwtAuthGuard)
  async verifyEmail(@User() user: JwtPayload, @Body() payload: VerifyEmailDto) {
    try {
      const userId = user.id;
      const response = await this.userService.verifyEmail(userId, payload);
      return new SuccessResponseDto(SuccessMessage.EMAIL_VERIFIED, response);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('set-phone')
  @UseGuards(JwtAuthGuard)
  async setPhone(@User() user: JwtPayload, @Body() payload: SetPhoneDto) {
    try {
      const userId = user.id;
      const response = await this.userService.setPhone(userId, payload);
      return new SuccessResponseDto(SuccessMessage.PHONE_SET, response);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('verify-phone')
  @UseGuards(JwtAuthGuard)
  async verifyPhone(@User() user: JwtPayload, @Body() payload: VerifyPhoneDto) {
    try {
      const userId = user.id;
      const response = await this.userService.verifyPhone(userId, payload);
      return new SuccessResponseDto(SuccessMessage.PHONE_VERIFIED, response);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('request-change-passcode')
  @UseGuards(JwtAuthGuard)
  async requestChangePasscode(@User() user: JwtPayload) {
    try {
      const userId = user.id;
      const response = await this.userService.requestPasscodeChange(userId);
      return new SuccessResponseDto(SuccessMessage.SIGNIN_OTP, response);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('change-passcode')
  @UseGuards(JwtAuthGuard)
  async changePasscode(
    @User() user: JwtPayload,
    @Body() payload: ChangePasscodeDto,
  ) {
    try {
      const userId = user.id;
      const response = await this.userService.changePasscode(userId, payload);
      return new SuccessResponseDto(SuccessMessage.PASSCODE_CHANGED, response);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('verify-otp')
  @UseGuards(JwtAuthGuard)
  async verifyOtp(@User() user: JwtPayload, @Body() payload: VerifyOtpDto) {
    try {
      const userId = user.id;
      const response = await this.userService.verifyOtp(userId, payload);
      return new SuccessResponseDto(
        SuccessMessage.OTP_VERIFIED_SUCCESS,
        response,
      );
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
