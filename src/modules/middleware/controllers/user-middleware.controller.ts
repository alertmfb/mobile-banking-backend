import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetAllUserQueryDto } from 'src/modules/user/dto/get-all-user-query.dto';
import { UserService } from 'src/modules/user/user.service';
import { SuccessResponseDto } from 'src/shared/dtos/success-response.dto';
import { SuccessMessage } from 'src/shared/enums/success-message.enum';

@ApiTags('Middleware Consumer Banking Users')
@Controller('middleware/consumer/user')
export class UserMiddlewareController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(@Query() query: GetAllUserQueryDto) {
    try {
      const response = await this.userService.findAll(query);
      return new SuccessResponseDto(SuccessMessage.USERS_RETRIEVED, response);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/:userId')
  async getUserById(@Query('userId') userId: string) {
    try {
      const response = await this.userService.findById(userId);
      return new SuccessResponseDto(SuccessMessage.USERS_RETRIEVED, response);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
