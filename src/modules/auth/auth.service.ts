import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InitiateSignUpDto } from './dto/initiate-signup.dto';
import { ErrorMessages } from 'src/shared/enums/error.message.enum';
import { MessagingService } from '../messaging/messaging-service.interface';
import { RequestResetDto } from './dto/request-reset.dto';
import { SetPasscodeDto } from './dto/set-passcode.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SetNameDobDto } from './dto/set-name-dob.dto';
import { VerifyEmailOtpDto } from './dto/verify-email-otp.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name, { timestamp: true });

  constructor(
    @Inject('MessagingProvider')
    private readonly messagingService: MessagingService,
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signInInitiate(payload: any): Promise<any> {
    try {
      const { phoneNumber } = payload;
      const user = await this.userService.findOneByPhoneNumber(phoneNumber);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      // get user by phone number or account number
      // if user exist, send OTP
      const otp = Math.floor(100000 + Math.random() * 900000); // call termii API to send OTP
      user.otp = otp.toString();
      user.otpExpires = new Date(new Date().getTime() + 60 * 60 * 1000);
      user.login = 'INITIATED';
      await this.userService.update(user.id, user);
      return { phoneNumber, otp, message: ' Valid for 1 hour' };
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifySignInOtp(payload: VerifyOtpDto): Promise<any> {
    try {
      const { phoneNumber, otp } = payload;
      const user = await this.userService.findOneByPhoneNumber(phoneNumber);
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
      user.login = 'PHONE_VERIFIED';
      await this.userService.update(user.id, user);
      return;
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async signInWithPasscode(
    emailorPhone: string,
    passcode: string,
  ): Promise<any> {
    try {
      const user = await this.userService.finByPhoneOrEmail(emailorPhone);

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      if (user.login !== 'PHONE_VERIFIED') {
        throw new HttpException('Phone not verified', HttpStatus.BAD_REQUEST);
      }

      const isMatch = await bcrypt.compare(passcode, user.passcode);

      if (!isMatch) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      const payload = {
        sub: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      };

      return {
        access_token: await this.jwtService.signAsync(payload, {
          expiresIn: '15m',
        }),
        refresh_token: await this.jwtService.signAsync(payload, {
          expiresIn: '7d',
        }),
      };
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async refreshToken(userId: string, refreshToken: string): Promise<any> {
    try {
      const user = await this.userService.findOne(userId);
      const payload = {
        sub: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      };

      const decoded = this.jwtService.decode(refreshToken);
      if (decoded.sub !== userId) {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }

      return {
        access_token: await this.jwtService.signAsync(payload, {
          expiresIn: '15m',
        }),
        refresh_token: await this.jwtService.signAsync(payload, {
          expiresIn: '7d',
        }),
      };
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async initiateSignUp(payload: InitiateSignUpDto): Promise<any> {
    try {
      const { phoneNumber } = payload;
      const user = await this.userService.findOneByPhoneNumber(phoneNumber);
      if (user && user.onboarding === 'COMPLETED') {
        throw new HttpException(
          ErrorMessages.USER_EXIST,
          HttpStatus.BAD_REQUEST,
        );
      }

      // // call messaging servide to send OTP
      // const response = await this.messagingService.sendSmsToken({
      //   pin_attempts: 3,
      //   pin_time_to_live: 10,
      //   pin_length: 6,
      //   message_text: 'Your pin is < 1234 >',
      //   to: phoneNumber,
      // });

      const otp = Math.floor(100000 + Math.random() * 900000);

      const otpExpire = new Date(new Date().getTime() + 60 * 60 * 1000);

      // update
      if (user && user.onboarding === 'INITIATED') {
        // update existing user
        user.otpId = otp.toString();
        user.otp = otp.toString();
        user.otpExpires = otpExpire;
        await this.userService.update(user.id, user);
        return otp + ' Valid for 1 hour';
      }

      // create new user
      await this.userService.create({
        phoneNumber,
        otpId: otp.toString(),
        otp: otp.toString(),
        otpExpires: otpExpire,
        onboarding: 'INITIATED',
      });

      return otp + ' Valid for 1 hour';
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyPhone(payload: VerifyOtpDto): Promise<any> {
    try {
      const { phoneNumber, otp } = payload;
      const user = await this.userService.findOneByPhoneNumber(phoneNumber);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      // const response = await this.messagingService.verifyToken({
      //   pin_id: user.otpId,
      //   pin: otp,
      // });

      // if (!response) {
      //   throw new HttpException(
      //     ErrorMessages.INVALID_OTP,
      //     HttpStatus.BAD_REQUEST,
      //   );
      // }

      if (user.otp !== otp || user.otpExpires < new Date()) {
        throw new HttpException(
          ErrorMessages.INVALID_OTP,
          HttpStatus.BAD_REQUEST,
        );
      }

      // update user onboarding status
      user.onboarding = 'PHONE_VERIFIED';
      await this.userService.update(user.id, user);

      return;
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async setEmail(payload: any): Promise<any> {
    try {
      const { phoneNumber, email } = payload;
      const user = await this.userService.findOneByEmail(email);
      if (user && user.phoneNumber !== phoneNumber) {
        throw new HttpException(
          ErrorMessages.USER_EXIST,
          HttpStatus.BAD_REQUEST,
        );
      }
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpires = new Date(new Date().getTime() + 60 * 60 * 1000);
      await this.userService.update(user.id, user);
      // const otpRes = await this.messagingService.sendEmailToken({
      //   to: email,
      //   code: user.otp,
      // });
      // if (!otpRes) {
      //   throw new HttpException(
      //     ErrorMessages.EMAIL_OTP_NOT_SENT,
      //     HttpStatus.INTERNAL_SERVER_ERROR,
      //   );
      // }
      user.otpId = otp;
      // user.email = email;
      await this.userService.update(user.id, user);
      return otp + ' Valid for 1 hour';
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyEmail(payload: VerifyEmailOtpDto): Promise<any> {
    try {
      const { email, otp } = payload;
      const user = await this.userService.findOneByEmail(email);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      if (user.otp != otp || user.otpExpires < new Date()) {
        throw new HttpException(
          ErrorMessages.INVALID_OTP,
          HttpStatus.BAD_REQUEST,
        );
      }

      user.email = email;
      await this.userService.update(user.id, user);
      return;
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async setPasscode(payload: SetPasscodeDto): Promise<any> {
    try {
      const { phoneNumber, passcode, confirmPasscode } = payload;
      if (passcode !== confirmPasscode) {
        throw new HttpException(
          ErrorMessages.PASSCODE_MISMATCH,
          HttpStatus.BAD_REQUEST,
        );
      }
      const user = await this.userService.findOneByPhoneNumber(phoneNumber);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (user.onboarding !== 'PHONE_VERIFIED') {
        throw new HttpException(
          ErrorMessages.PHONE_NOT_VERIFIED,
          HttpStatus.BAD_REQUEST,
        );
      }

      const hashedPasscode = await bcrypt.hash(passcode.toString(), 10);
      user.passcode = hashedPasscode;
      user.onboarding = 'SET_PASSCODE';
      user.login = 'PHONE_VERIFIED';
      await this.userService.update(user.id, user);
      return await this.signInWithPasscode(phoneNumber, passcode);
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async setPin(userId: string, payload: any): Promise<any> {
    try {
      const { pin, confirmPin } = payload;
      if (pin !== confirmPin) {
        throw new HttpException(
          ErrorMessages.PIN_MISMATCH,
          HttpStatus.BAD_REQUEST,
        );
      }
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (user.onboarding !== 'SET_PASSCODE') {
        throw new HttpException(
          ErrorMessages.PASSCODE_NOT_SET,
          HttpStatus.BAD_REQUEST,
        );
      }

      const hashedPin = await bcrypt.hash(pin.toString(), 10);
      user.pin = hashedPin;
      user.onboarding = 'SET_PIN';
      await this.userService.update(user.id, user);
      return;
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async setNameAndDob(userId: string, payload: SetNameDobDto): Promise<any> {
    try {
      const { firstName, lastName, otherName, dob } = payload;
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      user.firstName = firstName;
      user.lastName = lastName;
      user.otherName = otherName;
      user.dob = dob;
      user.onboarding = 'COMPLETED';
      await this.userService.update(user.id, user);
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOne(email);
    const passwordHash = user.password;
    const isMatch = await bcrypt.compare(pass, passwordHash);
    if (user && isMatch) {
      const { password, ...result } = user;
      console.log('password', password);
      return result;
    }
    return null;
  }

  async completeSignUp(): Promise<any> {
    // phone number is verified
    // set passcode is true
    // set pin is true
    //set status to complete
    return 'complete';
  }

  async requestReset(payload: RequestResetDto): Promise<any> {
    try {
      console.log(payload);
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async resetPasscode(payload: SetPasscodeDto): Promise<any> {
    try {
      console.log(payload);
      // return await this.userService.create();
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
