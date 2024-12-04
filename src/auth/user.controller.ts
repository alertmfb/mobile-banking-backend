import { Controller, Post, Param, Body, Get } from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateUserDto,
  CreatedUserResponseDto,
  requestOtpDto,
  OtpVerificationDto,
  ResponseDto,
  TransactionPinDto,
  UserCredentialDto,
  ResetPasswordDto,
} from './dto/user.dto';
import { ApiBody, ApiParam } from '@nestjs/swagger';

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
  @Post('phone/verify')
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
  @Get('user-profile/:identifier')
  @ApiParam({
    name: 'identifier',
    description:
      'The unique identifier of the user. It can be email, phone number, or username.',
    required: true,
  })
  async getProfile(
    @Param('identifier') identifier: string,
  ): Promise<ResponseDto> {
    return await this.userService.getProfile(identifier);
  }

  @Post('request-otp')
  async requestOTP(@Body() requestOtpDto: requestOtpDto): Promise<ResponseDto> {
    return await this.userService.requestOtp(requestOtpDto);
  }

  @Post('verifyOTP')
  async verifyResetOtp(
    @Body() verifyOtpDto: OtpVerificationDto,
  ): Promise<ResponseDto> {
    return await this.userService.verifyResetOtp(verifyOtpDto);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<ResponseDto> {
    return await this.userService.resetPassword(resetPasswordDto);
  }

  @Post('reset-transaction-pin')
  async resetTransactionPin(
    @Body() transactionPinDto: TransactionPinDto,
  ): Promise<ResponseDto> {
    return await this.userService.resetTransactionPin(transactionPinDto);
  }
}
