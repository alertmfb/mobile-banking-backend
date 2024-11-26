import { Controller, Post, Param, Body } from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateUserDto,
  CreateWaitListResponseDto,
  LoginUserDto,
} from './dto/user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post(':phoneNumber')
  async addPhoneNumber(
    @Param('phoneNumber') phoneNumber: string,
  ): Promise<string> {
    try {
      return await this.userService.addPhoneNumber(phoneNumber);
    } catch (error) {
      throw error;
    }
  }

  @Post('create')
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Param('phoneNumber') phoneNumber: string,
  ): Promise<CreateWaitListResponseDto> {
    return await this.userService.createUser(createUserDto, phoneNumber);
  }
  @Post('login')
  async loginUser(
    @Body() loginDto: LoginUserDto,
  ): Promise<CreateWaitListResponseDto> {
    return await this.userService.loginUser(loginDto);
  }
}
