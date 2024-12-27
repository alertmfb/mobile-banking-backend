import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Patch,
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
}
