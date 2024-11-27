import { Controller, Post, Param, Body } from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateUserDto,
  CreatedUserResponseDto,
  EmailDto,
  ResetPasswordDto,
  ResponseDto,
  UserCredentialDto,
} from './dto/user.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('addPhone/:phoneNumber')
  async addPhoneNumber(
    @Param('phoneNumber') phoneNumber: string,
  ): Promise<ResponseDto> {
    try {
      return await this.userService.addPhoneNumber(phoneNumber);
    } catch (error) {
      throw error;
    }
  }

  @Post('create/:phoneNumber')
  @ApiBody({ type: CreateUserDto })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Param('phoneNumber') phoneNumber: string,
  ): Promise<CreatedUserResponseDto> {
    return await this.userService.createUser(createUserDto, phoneNumber);
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
    @Body() verifyOtpDto: ResetPasswordDto,
  ): Promise<ResponseDto> {
    return await this.userService.verifyResetOtp(verifyOtpDto);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: UserCredentialDto,
  ): Promise<ResponseDto> {
    return await this.userService.resetPassword(resetPasswordDto);
  }
}
