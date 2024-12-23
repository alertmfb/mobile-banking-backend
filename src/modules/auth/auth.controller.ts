import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { InitiateSignUpDto } from './dto/initiate-signup.dto';
import { SuccessResponseDto } from 'src/shared/dtos/success-response.dto';
import { SuccessMessage } from '../../shared/enums/success-message.enum';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SetPasscodeDto } from './dto/set-passcode.dto';
import { SetPinDto } from './dto/set-pin.dto';
import { ApiTags } from '@nestjs/swagger';
import { InitiateSignInDto } from './dto/initiate-signin.dto';
import { SetNameDobDto } from './dto/set-name-dob.dto';
import { JwtAuthGuard } from 'src/shared/guards/jwt.guard';
import { User } from 'src/shared/decorators/user.decorator';
import { JwtPayload } from 'src/shared/interfaces/jwt-payload.interface';
import { SetEmailDto } from './dto/set-email.dto';
import { VerifyEmailOtpDto } from './dto/verify-email-otp.dto';
import { SigninPasscodeDto } from './dto/signin-passcode.dto';

@ApiTags('Auth Service')
@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  async signInInitiate(@Body() payload: InitiateSignInDto) {
    try {
      const response = await this.authService.signInInitiate(payload);
      return new SuccessResponseDto(SuccessMessage.SIGNIN_INITIATED, response);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('signin/verify-otp')
  async signInWithOtp(@Body() payload: VerifyOtpDto) {
    try {
      const response = await this.authService.verifySignInOtp(payload);
      return new SuccessResponseDto(SuccessMessage.PHONE_VERIFIED, response);
    } catch (e) {
      throw new HttpException(
        `Could not send OTP: ` + e.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('signin/verify-passcode')
  async signInWithPasscode(@Body() payload: SigninPasscodeDto) {
    try {
      const { emailorPhone, passcode } = payload;
      const response = await this.authService.signInWithPasscode(
        emailorPhone,
        passcode,
      );
      return new SuccessResponseDto(SuccessMessage.LOGIN_SUCCESS, response);
    } catch (e) {
      throw new HttpException(
        `Could not send OTP: ` + e.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('signup/initiate')
  async signUp(@Body() payload: InitiateSignUpDto) {
    try {
      const response = await this.authService.initiateSignUp(payload);
      return new SuccessResponseDto(SuccessMessage.SIGNUP_INITIATED, response);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('signup/verify-phone')
  async verifyOtp(@Body() payload: VerifyOtpDto) {
    try {
      const response = await this.authService.verifyPhone(payload);
      return new SuccessResponseDto(SuccessMessage.PHONE_VERIFIED, response);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('signup/set-email')
  async setEmail(@Body() payload: SetEmailDto) {
    try {
      const response = await this.authService.setEmail(payload);
      return new SuccessResponseDto(SuccessMessage.EMAIL_SET, response);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('signup/verify-email')
  async verifyEmail(@Body() payload: VerifyEmailOtpDto) {
    try {
      const response = await this.authService.verifyEmail(payload);
      return new SuccessResponseDto(SuccessMessage.EMAIL_VERIFIED, response);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('signup/set-passcode')
  async setPasscode(@Body() payload: SetPasscodeDto) {
    try {
      const response = await this.authService.setPasscode(payload);
      return new SuccessResponseDto(SuccessMessage.PASSCODE_SET, response);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('signup/set-pin')
  @UseGuards(JwtAuthGuard)
  async setPin(@Body() payload: SetPinDto, @User() user: JwtPayload) {
    try {
      const userId = user.sub || user.id;
      const response = await this.authService.setPin(userId, payload);
      return new SuccessResponseDto(SuccessMessage.PIN_SET, response);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('signup/set-name-dob')
  @UseGuards(JwtAuthGuard)
  async setNameDob(@Body() payload: SetNameDobDto, @User() user: JwtPayload) {
    try {
      const userId = user.sub || user.id;
      const response = await this.authService.setNameAndDob(userId, payload);
      return new SuccessResponseDto(SuccessMessage.NAME_DOB_SET, response);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('signup/complete')
  async completeSignUp() {
    try {
      const response = await this.authService.completeSignUp();
      return new SuccessResponseDto(SuccessMessage.SIGNUP_COMPLETED, response);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('passcode/reset/request')
  async requestReset(@Body() payload: VerifyOtpDto) {
    try {
      console.log(payload);
      const response = await this.authService.completeSignUp();
      return new SuccessResponseDto(SuccessMessage.SIGNUP_COMPLETED, response);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('passcode/reset')
  async reset() {
    try {
      const response = await this.authService.completeSignUp();
      return new SuccessResponseDto(SuccessMessage.SIGNUP_COMPLETED, response);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
