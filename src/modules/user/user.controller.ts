import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
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

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@User() user: JwtPayload) {
    try {
      const resObj = await this.userService.getMe(user.id);
      return new SuccessResponseDto(SuccessMessage.LOGIN_SUCCESS, resObj);
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
      const userId = user.sub;
      const resObj = await this.userService.checkUsername(userId, username);
      return new SuccessResponseDto(SuccessMessage.USERNAME_AVAILABLE, resObj);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
