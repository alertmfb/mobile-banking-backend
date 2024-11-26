import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HelperService } from 'src/utils/helper.service';
import {
  CreateUserDto,
  CreateWaitListResponseDto,
  LoginUserDto,
} from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly helperService: HelperService,
  ) {}

  async addPhoneNumber(phoneNumber: string): Promise<any> {
    try {
      const existingUser = await this.prisma.user.findFirst({
        where: { phoneNumber: phoneNumber },
      });
      if (existingUser) {
        throw new BadRequestException(
          `Phone number ${phoneNumber} already exists.`,
        );
      }
      const otp = await this.helperService.generateOtp();

      const newUser = await this.prisma.user.create({
        data: { phoneNumber: phoneNumber, phoneOtp: otp },
      });
      console.log(newUser);
      return {
        message: `Phone number has been added successfully.`,
      };
    } catch (error) {
      return error.response;
    }
  }

  async createUser(
    createUserDto: CreateUserDto,
    phoneNumber: string,
  ): Promise<CreateWaitListResponseDto> {
    try {
      const existingUser = await this.prisma.user.findFirst({
        where: { phoneNumber: phoneNumber },
      });
      console.log(existingUser);

      const cryptedPassword = await this.helperService.hasher(
        createUserDto?.password,
        12,
      );

      const cryptedPin = await this.helperService.hasher(
        createUserDto?.transactionPin,
        4,
      );
      const requireData = {
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        password: cryptedPassword,
        transactionPin: cryptedPin,
        country: createUserDto.country,
        nin: createUserDto.nin,
        bvn: createUserDto.bvn,
        city: createUserDto.city,
        address: createUserDto.address,
        state: createUserDto.state,
        zipCode: createUserDto.zipCode,
        username: createUserDto.username,
        dateOfBirth: createUserDto.dateOfBirth,
      };

      const user = await this.prisma.user.update({
        where: { phoneNumber: phoneNumber },
        data: requireData,
      });

      if (!user) {
        throw new BadRequestException('Error occured while adding user');
      }

      const response: CreateWaitListResponseDto = {
        message: 'Account created successfully',
        data: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          country: user.country,
          nin: user.nin,
          bvn: user.bvn,
          city: user.city,
          address: user.address,
          state: user.state,
          zipCode: user.zipCode,
          username: user.username,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        statusCode: 200,
      };

      return response;
    } catch (error) {
      return error.response;
    }
  }

  async loginUser(
    loginUserDto: LoginUserDto,
  ): Promise<CreateWaitListResponseDto> {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: loginUserDto.email },
      });
      if (!existingUser) {
        throw new NotFoundException('User with this email does not exist');
      }

      let checkPassword = await this.helperService.matchChecker(
        loginUserDto.password,
        existingUser.password,
      );

      if (!checkPassword) {
        throw new BadRequestException('Invalid credentials!');
      }

      const response: CreateWaitListResponseDto = {
        message: 'Login successfully',
        data: {
          id: existingUser.id,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          email: existingUser.email,
          phoneNumber: existingUser.phoneNumber,
          country: existingUser.country,
          nin: existingUser.nin,
          bvn: existingUser.bvn,
          city: existingUser.city,
          address: existingUser.address,
          state: existingUser.state,
          zipCode: existingUser.zipCode,
          username: existingUser.username,
          createdAt: existingUser.createdAt,
          updatedAt: existingUser.updatedAt,
        },
        statusCode: 200,
      };

      return response;
    } catch (error) {
      return error.response;
    }
  }
}
