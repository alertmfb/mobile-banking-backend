import { Controller, Post, Param, Put, Body } from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateUserDto,
  CreatedUserResponseDto,
  EmailDto,
  OtpVerificationDto,
  ResponseDto,
  UserCredentialDto,
} from './dto/user.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('phone/add/:phoneNumber')
  async addPhoneNumber(
    @Param('phoneNumber') phoneNumber: string,
  ): Promise<ResponseDto> {
    try {
      return await this.userService.addPhoneNumber(phoneNumber);
    } catch (error) {
      throw error;
    }
  }
  @Put('phone/verify')
  async verifyPhoneOtp(
    @Body() verifyOtpDto: OtpVerificationDto,
  ): Promise<ResponseDto> {
    return await this.userService.verifyPhoneOtp(verifyOtpDto);
  }

  @Post('registration')
  @ApiBody({ type: CreateUserDto })
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<CreatedUserResponseDto> {
    return await this.userService.createUser(createUserDto);
  }
  @Post('login')
  @ApiBody({ type: UserCredentialDto })
  async loginUser(
    @Body() loginDto: UserCredentialDto,
  ): Promise<CreatedUserResponseDto> {
    return await this.userService.loginUser(loginDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() emailDto: EmailDto): Promise<ResponseDto> {
    return await this.userService.forgotPassword(emailDto);
  }

  @Post('verifyOTP')
  async verifyResetOtp(
    @Body() verifyOtpDto: OtpVerificationDto,
  ): Promise<ResponseDto> {
    return await this.userService.verifyResetOtp(verifyOtpDto);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() OtpVerificationDto: UserCredentialDto,
  ): Promise<ResponseDto> {
    return await this.userService.resetPassword(OtpVerificationDto);
  }
}
