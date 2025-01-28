import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from './user.repository';
import { SetPasscodeDto } from '../auth/dto/set-passcode.dto';
import { SetPinDto } from '../auth/dto/set-pin.dto';
import { Prisma, User } from '@prisma/client';
import { ErrorMessages } from 'src/shared/enums/error.message.enum';
import * as bcrypt from 'bcrypt';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { SetPhoneDto } from './dto/set-phone.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { ChangePasscodeDto } from './dto/change-passcode.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

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

  async bvnLookup(str: string) {
    return await this.userRepository.bvnLookup(str);
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
        kycStatus: true,
        bvnLookup: true,
        ninLookup: true,
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
        kycStatus: true,
        bvnLookup: true,
        ninLookup: true,
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

  async findOneByPhoneOrEmail(phoneOrEmail: string): Promise<User | undefined> {
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

  async verifyEmail(id: string, payload: VerifyEmailDto) {
    try {
      const { email, otp } = payload;
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (user.isEmailSet) {
        throw new HttpException(
          ErrorMessages.CANNOT_VERIFY_EMAIL_AGAIN,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!user.emailToken || decrypt(user.emailToken) !== email) {
        throw new HttpException(
          ErrorMessages.EMAIL_MISMATCH,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (user.otp !== otp) {
        throw new HttpException(
          ErrorMessages.INVALID_OTP,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (new Date() > user.otpExpires) {
        throw new HttpException(
          ErrorMessages.INVALID_OTP,
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.userRepository.update(id, {
        isEmailSet: true,
        otp: null,
        otpExpires: null,
        email: email,
        emailToken: null,
      });

      return;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async setPhone(id: string, payload: SetPhoneDto) {
    try {
      const { phoneNumber } = payload;
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (user.isPhoneSet || user.phoneNumber) {
        throw new HttpException(
          ErrorMessages.PHONE_EXIST,
          HttpStatus.BAD_REQUEST,
        );
      }

      const phoneExist =
        await this.userRepository.findOneByPhoneNumber(phoneNumber);
      if (phoneExist) {
        throw new HttpException(
          ErrorMessages.PHONE_EXIST,
          HttpStatus.BAD_REQUEST,
        );
      }

      const otp = Math.floor(100000 + Math.random() * 900000);
      const otpExpire = new Date(new Date().getTime() + 60 * 60 * 1000);
      const message = `Your verification code is ${otp}. Valid for 1 hour`;

      const response = await this.messagingService.sendSms(
        toSmsNo(phoneNumber),
        message,
      );

      await this.messagingService.sendWhatsapp(
        toSmsNo(phoneNumber),
        otp.toString(),
      );

      if (!response) {
        throw new HttpException(
          ErrorMessages.COULD_NOT_SEND_OTP,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.userRepository.update(id, {
        phoneToken: encrypt(phoneNumber),
        otp: otp.toString(),
        otpExpires: otpExpire,
      });

      return { otp, otpExpire };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyPhone(id: string, payload: VerifyPhoneDto) {
    try {
      const { phoneNumber, otp } = payload;
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (user.isPhoneSet) {
        throw new HttpException(
          ErrorMessages.PHONE_EXIST,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!user.phoneToken || decrypt(user.phoneToken) !== phoneNumber) {
        throw new HttpException(
          ErrorMessages.PHONE_NUMBER_NOT_FOUND,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (user.otp !== otp) {
        throw new HttpException(
          ErrorMessages.INVALID_OTP,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (new Date() > user.otpExpires) {
        throw new HttpException(
          ErrorMessages.INVALID_OTP,
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.userRepository.update(id, {
        isPhoneSet: true,
        otp: null,
        otpExpires: null,
        phoneNumber: phoneNumber,
        phoneToken: null,
      });

      return;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyOtp(id: string, payload: VerifyOtpDto) {
    try {
      const { otp } = payload;
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (user.otp !== otp) {
        throw new HttpException(
          ErrorMessages.INVALID_OTP,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (new Date() > user.otpExpires) {
        throw new HttpException(
          ErrorMessages.INVALID_OTP,
          HttpStatus.BAD_REQUEST,
        );
      }

      return;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async requestPasscodeChange(id: string) {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      if (!user.isEmailSet || !user.email) {
        throw new HttpException(
          ErrorMessages.EMAIL_MUST_BE_VERIFIED,
          HttpStatus.BAD_REQUEST,
        );
      }

      const otp = Math.floor(100000 + Math.random() * 900000);
      const otpExpire = new Date(new Date().getTime() + 60 * 60 * 1000);

      const response = await this.messagingService.sendEmailToken({
        email_address: user.email,
        code: otp,
      });

      if (response.status === 'error') {
        throw new HttpException(
          ErrorMessages.EMAIL_NOT_SENT + '. ' + response.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.userRepository.update(id, {
        otp: otp.toString(),
        otpExpires: otpExpire,
      });

      return { otp, otpExpire };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async changePasscode(id: string, payload: ChangePasscodeDto) {
    try {
      const { otp, passcode, confirmPasscode } = payload;
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (passcode !== confirmPasscode) {
        throw new HttpException(
          ErrorMessages.PASSWORDS_DO_NOT_MATCH,
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.verifyOtp(id, { otp });

      await this.userRepository.update(id, {
        passcode: await bcrypt.hash(passcode.toString(), 10),
        otp: null,
        otpExpires: null,
      });

      return;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
