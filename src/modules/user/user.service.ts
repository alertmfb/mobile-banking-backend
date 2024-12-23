import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from './user.repository';
import { SetPasscodeDto } from '../auth/dto/set-passcode.dto';
import { SetPinDto } from '../auth/dto/set-pin.dto';
import { Prisma, User } from '@prisma/client';
import { ErrorMessages } from 'src/shared/enums/error.message.enum';

@Injectable()
export class UserService {
  private SALT = 10;
  constructor(
    private prisma: PrismaService,
    private readonly userRepository: UserRepository,
  ) {}

  async getMe(id: string) {
    return await this.userRepository.findById(id);
  }

  async checkUsername(id: string, username: string) {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      const userNameExist = await this.userRepository.findByUsername(username);
      if (userNameExist && userNameExist.id !== id) {
        throw new HttpException(
          ErrorMessages.USERNAME_EXIST,
          HttpStatus.BAD_REQUEST,
        );
      }
      return;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateUsername(id: string, username: string) {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      const userNameExist = await this.userRepository.findByUsername(username);

      if (userNameExist && userNameExist.id !== id) {
        throw new HttpException(
          ErrorMessages.USERNAME_EXIST,
          HttpStatus.BAD_REQUEST,
        );
      }

      user.username = username;
      await this.userRepository.update(id, user);
      return await this.userRepository.findById(id);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return await this.prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        otherName: true,
        gender: true,
        reference: true,
        dob: true,
        pob: true,
        phoneNumber: true,
        password: true,
        passcode: true,
        pin: true,
        onboarding: true,
        token: true,
        otp: true,
        otpId: true,
        otpExpires: true,
        login: true,
        loginAttempts: true,
        lastLogin: true,
        country: true,
        onboardType: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string): Promise<User | undefined> {
    return await this.prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        otherName: true,
        gender: true,
        reference: true,
        dob: true,
        pob: true,
        phoneNumber: true,
        password: true,
        passcode: true,
        pin: true,
        onboarding: true,
        token: true,
        otp: true,
        otpId: true,
        otpExpires: true,
        login: true,
        loginAttempts: true,
        lastLogin: true,
        country: true,
        onboardType: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async findOneByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    return await this.userRepository.findOneByPhoneNumber(phoneNumber);
  }

  async finByPhoneOrEmail(phoneOrEmail: string): Promise<User | undefined> {
    return await this.userRepository.findByPhoneOrEmail(phoneOrEmail);
  }

  async create(payload: Prisma.UserCreateInput): Promise<User> {
    return await this.userRepository.create(payload);
  }

  async update(id: string, payload: Prisma.UserCreateInput): Promise<User> {
    return await this.userRepository.update(id, payload);
  }

  async phoneExist(phone: string) {
    return await this.userRepository.findOne({ email: phone });
  }

  async setPasscode(id: string, payload: SetPasscodeDto) {
    return { id, ...payload };
  }

  async setPin(id: string, payload: SetPinDto) {
    return { id, ...payload };
  }
}
