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
import { SetPasscodeDto } from './dto/set-passcode.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SetNameDobDto } from './dto/set-name-dob.dto';
import { VerifyEmailOtpDto } from './dto/verify-email-otp.dto';
import {
  convertBankOneDateToStandardFormat,
  encrypt,
  obfuscatePhoneNumber,
  toSmsNo,
} from 'src/utils/helpers';
import { AccountService } from '../account/account.service';
import { VerifyExistingDto } from './dto/verify-existing.dto';
import { SetExistingPasscodeDto } from './dto/set-existing-passcode.dto';
import { VerifyResetPasscodeDto } from './dto/verify-reset-passcode.dto';
import { ResetPasscodeDto } from './dto/reset-passcode.dto';
import { RequestResetDto } from './dto/request-reset.dto';
import { AccountCreateEvent } from '../account/events/account-create.event';
import { Events } from 'src/shared/enums/events.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name, { timestamp: true });

  constructor(
    @Inject('MessagingProvider')
    private readonly messagingService: MessagingService,
    private readonly userService: UserService,
    private jwtService: JwtService,
    private readonly accountService: AccountService,
    private readonly eventEmitter: EventEmitter2,
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
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (user.login !== 'PHONE_VERIFIED') {
        throw new HttpException('Phone not verified', HttpStatus.BAD_REQUEST);
      }

      const isMatch = await bcrypt.compare(passcode, user.passcode);

      if (!isMatch) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      const payload = {
        id: user.id,
        sub: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      };

      return {
        access_token: await this.jwtService.signAsync(payload, {
          expiresIn: '1d',
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
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      };

      const decoded = this.jwtService.decode(refreshToken);
      if (decoded.sub !== userId) {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }

      return {
        access_token: await this.jwtService.signAsync(payload, {
          expiresIn: '1d',
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
      const { phoneNumber, onboardType } = payload;
      if (onboardType === 'EXISTING') {
        return await this.handleExistingUser(phoneNumber);
      }

      const user = await this.userService.findOneByPhoneNumber(phoneNumber);

      const invalidOnboardStates = ['COMPLETED', 'SET_PIN', 'SET_PASSCODE'];
      if (user && invalidOnboardStates.includes(user.onboarding)) {
        throw new HttpException(
          ErrorMessages.PHONE_IN_USE,
          HttpStatus.BAD_REQUEST,
        );
      }

      const otp = Math.floor(100000 + Math.random() * 900000);
      const otpExpire = new Date(new Date().getTime() + 60 * 60 * 1000);
      const message = `Your verification code is ${otp}. Valid for 1 hour`;

      // call messaging servide to send OTP
      const response = await this.messagingService.sendSms(
        toSmsNo(phoneNumber),
        message,
      );

      if (!response) {
        throw new HttpException(
          ErrorMessages.COULD_NOT_SEND_OTP,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const otpId = response.message_id;

      const validOnboardStates = [
        'NEW',
        'INITIATED',
        'PHONE_VERIFIED',
        'EMAIL_VERIFIED',
      ];

      // update existing user
      if (user && validOnboardStates.includes(user.onboarding)) {
        user.otpId = otpId;
        user.otp = otp.toString();
        user.otpExpires = otpExpire;
        user.onboardType = payload.onboardType || 'NEW';
        await this.userService.update(user.id, user);
        return otp + ' Valid for 1 hour';
      }

      // create new user
      await this.userService.create({
        phoneNumber,
        otpId: otp.toString(),
        otp: otp.toString(),
        otpExpires: otpExpire,
        onboardType: payload.onboardType || 'NEW',
        onboarding: 'INITIATED',
      });

      return otp + ' Valid for 1 hour';
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async handleExistingUser(accountNo: string): Promise<any> {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpire = new Date(new Date().getTime() + 60 * 60 * 1000);
    const message = `Your verification code is ${otp}. Valid for 1 hour`;

    try {
      // Check if account exists in the system
      const accountExist =
        await this.accountService.findStoredByAccountNumber(accountNo);
      if (accountExist) {
        const user = await this.userService.findById(accountExist.userId);
        if (!user) {
          throw new HttpException(
            ErrorMessages.USER_NOT_FOUND,
            HttpStatus.NOT_FOUND,
          );
        }

        const validOnboardStates = [
          'NEW',
          'INITIATED',
          'PHONE_VERIFIED',
          'EMAIL_VERIFIED',
        ];
        if (!validOnboardStates.includes(user.onboarding)) {
          throw new HttpException(
            ErrorMessages.USER_EXIST,
            HttpStatus.BAD_REQUEST,
          );
        }

        user.onboardType = 'EXISTING';
        user.onboarding = 'INITIATED';
        user.otpId = otp.toString();
        user.otp = otp.toString();
        user.otpExpires = otpExpire;

        await this.userService.update(user.id, user);

        const otpResponse = await this.messagingService.sendSms(
          toSmsNo(user.phoneNumber),
          message,
        );
        if (!otpResponse) {
          throw new HttpException(
            ErrorMessages.COULD_NOT_SEND_OTP,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        return {
          message: `We have sent an OTP to ${obfuscatePhoneNumber(user.phoneNumber)}. Valid for 1 hour`,
          otp: otp,
        };
      }

      // If account does not exist, fetch account details
      const response =
        await this.accountService.getAccountByAccountNumber(accountNo);
      if (!response) {
        throw new HttpException(
          ErrorMessages.ACCOUNT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      const { customerID, BVN, dateOfBirth, gender, phoneNumber, email, name } =
        response;

      // Validate phone number existence
      const phoneExist =
        await this.userService.findOneByPhoneNumber(phoneNumber);
      if (phoneExist) {
        throw new HttpException(
          ErrorMessages.USER_EXIST,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate email existence
      const emailExist = await this.userService.findOneByEmail(email);
      if (emailExist) {
        throw new HttpException(
          ErrorMessages.USER_EXIST,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Split and clean the name
      const nameToUse = name.replace(/,/g, '').split(' ');

      // Create a new user
      const newUser = await this.userService.create({
        bvnLookup: encrypt(BVN),
        phoneNumber,
        gender: gender.toUpperCase(),
        dob: convertBankOneDateToStandardFormat(dateOfBirth),
        email,
        firstName: nameToUse[0],
        lastName: nameToUse[1],
        otherName: nameToUse[2] || null,
        otpId: otp.toString(),
        otp: otp.toString(),
        otpExpires: otpExpire,
        onboardType: 'EXISTING',
        onboarding: 'INITIATED',
      });

      // Create account and link it to the user
      await this.accountService.storeAccount({
        accountNumber: accountNo,
        customerId: customerID,
        provider: 'BANKONE',
        user: { connect: { id: newUser.id } },
      });

      // Send OTP to the user's phone number
      const otpResponse = await this.messagingService.sendSms(
        toSmsNo(phoneNumber),
        message,
      );
      if (!otpResponse) {
        throw new HttpException(
          ErrorMessages.COULD_NOT_SEND_OTP,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        message: `We have sent an OTP to ${obfuscatePhoneNumber(phoneNumber)}. Valid for 1 hour`,
        otp: otp,
      };
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyExisting(payload: VerifyExistingDto) {
    try {
      const { accountNumber, otp } = payload;

      const account =
        await this.accountService.findStoredByAccountNumber(accountNumber);
      if (!account) {
        throw new HttpException(
          ErrorMessages.ACCOUNT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      const user = await this.userService.findById(account.userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (user.otp !== otp || user.otpExpires < new Date()) {
        throw new HttpException(
          ErrorMessages.INVALID_OTP,
          HttpStatus.BAD_REQUEST,
        );
      }

      user.onboarding = 'PHONE_VERIFIED';
      await this.userService.update(user.id, user);

      return;
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
      const user = await this.userService.findOneByPhoneNumber(phoneNumber);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      const userExist = await this.userService.findOneByEmail(email);
      if (userExist && userExist.id !== user.id) {
        throw new HttpException(
          ErrorMessages.USER_EXIST,
          HttpStatus.BAD_REQUEST,
        );
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpRes = await this.messagingService.sendEmailToken({
        email_address: email,
        code: otp,
      });
      if (!otpRes) {
        throw new HttpException(
          ErrorMessages.EMAIL_OTP_NOT_SENT,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      user.otp = otp;
      user.otpExpires = new Date(new Date().getTime() + 60 * 60 * 1000);
      user.otpId = otpRes.message_id;
      user.email = email;
      await this.userService.update(user.id, user);
      return;
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyEmail(payload: VerifyEmailOtpDto): Promise<any> {
    try {
      const { phoneNumber, email, otp } = payload;
      const user = await this.userService.findOneByPhoneNumber(phoneNumber);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      const userExist = await this.userService.findOneByEmail(email);
      if (userExist && userExist.id !== user.id) {
        throw new HttpException(
          ErrorMessages.USER_EXIST,
          HttpStatus.BAD_REQUEST,
        );
      }

      const invalidOnboardingStates = ['COMPLETED', 'SET_PIN', 'SET_PASSCODE'];
      if (user && invalidOnboardingStates.includes(user.onboarding)) {
        throw new HttpException(
          ErrorMessages.CANNOT_VERIFY_EMAIL_AGAIN,
          HttpStatus.BAD_REQUEST,
        );
      }

      const validOnboardingStates = ['PHONE_VERIFIED', 'EMAIL_VERIFIED'];
      if (!validOnboardingStates.includes(user.onboarding)) {
        throw new HttpException(
          ErrorMessages.PHONE_NOT_VERIFIED,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (user.email !== email) {
        throw new HttpException(
          ErrorMessages.EMAIL_MISMATCH,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (user.otp != otp || user.otpExpires < new Date()) {
        throw new HttpException(
          ErrorMessages.INVALID_OTP,
          HttpStatus.BAD_REQUEST,
        );
      }
      user.onboarding = 'EMAIL_VERIFIED';
      await this.userService.update(user.id, user);
      return;
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async setExistingPasscode(payload: SetExistingPasscodeDto): Promise<any> {
    try {
      const { accountNumber, otp, passcode, confirmPasscode } = payload;
      const account =
        await this.accountService.findStoredByAccountNumber(accountNumber);
      if (!account) {
        throw new HttpException(
          ErrorMessages.ACCOUNT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      const user = await this.userService.findById(account.userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      if (user.otp !== otp || user.otpExpires < new Date()) {
        throw new HttpException(
          ErrorMessages.INVALID_OTP,
          HttpStatus.BAD_REQUEST,
        );
      }
      if (passcode !== confirmPasscode) {
        throw new HttpException(
          ErrorMessages.PASSWORDS_DO_NOT_MATCH,
          HttpStatus.BAD_REQUEST,
        );
      }
      const hashedPasscode = await bcrypt.hash(passcode.toString(), 10);
      user.passcode = hashedPasscode;
      user.onboarding = 'COMPLETED';
      user.login = 'PHONE_VERIFIED';
      await this.userService.update(user.id, user);

      // Sign in with the new passcode
      return await this.signInWithPasscode(user.phoneNumber, passcode);
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async setPasscode(payload: SetPasscodeDto): Promise<any> {
    const { phoneNumber, passcode, confirmPasscode } = payload;

    // Validate passcode match
    if (passcode !== confirmPasscode) {
      throw new HttpException(
        ErrorMessages.PASSCODE_MISMATCH,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Find user by phone number
    const user = await this.userService.findOneByPhoneNumber(phoneNumber);
    if (!user) {
      throw new HttpException(
        ErrorMessages.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const validOnboardingStates = [
      'EMAIL_VERIFIED',
      'SET_PASSCODE',
      'PHONE_VERIFIED',
    ];
    if (!validOnboardingStates.includes(user.onboarding)) {
      throw new HttpException(
        ErrorMessages.EMAIL_NOT_VERIFIED,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Hash the passcode
      const hashedPasscode = await bcrypt.hash(passcode.toString(), 10);

      // Update user details
      Object.assign(user, {
        passcode: hashedPasscode,
        onboarding: 'SET_PASSCODE',
        login: 'PHONE_VERIFIED',
      });
      await this.userService.update(user.id, user);

      // Sign in with the new passcode
      return await this.signInWithPasscode(phoneNumber, passcode);
    } catch (error) {
      this.logger.error('Error setting passcode', error.stack);
      throw new HttpException(
        'An unexpected error occurred while setting passcode.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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

      // const validOnboardingStatus = ['COMPLETE', 'SET_PIN', 'SET_PASSCODE'];

      // if (!validOnboardingStatus.includes(user.onboarding)) {
      //   throw new HttpException(
      //     ErrorMessages.PIN_NOT_SET,
      //     HttpStatus.BAD_REQUEST,
      //   );
      // }

      //initiate create account number
      if (user.onboardType == 'NEW') {
        console.log('emitting event');
        const createAccount = new AccountCreateEvent();
        createAccount.userId = userId;
        this.eventEmitter.emit(Events.ON_CREATE_ACCOUNT_NUMBER, createAccount);
      }

      const hashedPin = await bcrypt.hash(pin.toString(), 10);
      user.pin = hashedPin;
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

  async requestResetPasscode(payload: RequestResetDto): Promise<any> {
    try {
      const { emailOrAccountNumber } = payload;
      let user;
      if (emailOrAccountNumber.includes('@')) {
        user = await this.userService.findOneByEmail(emailOrAccountNumber);
      } else {
        const account =
          await this.accountService.findStoredByAccountNumber(
            emailOrAccountNumber,
          );
        if (!account) {
          throw new HttpException(
            ErrorMessages.ACCOUNT_NOT_FOUND,
            HttpStatus.NOT_FOUND,
          );
        }
        user = await this.userService.findById(account.userId);
      }
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      const otp = Math.floor(100000 + Math.random() * 900000);
      const otpExpire = new Date(new Date().getTime() + 60 * 60 * 1000);
      const message = `Your passcode reset code is ${otp}. Valid for 1 hour`;

      // call messaging servide to send OTP
      const otpRes = await this.messagingService.sendEmailToken({
        email_address: user.email,
        code: otp,
      });
      if (!otpRes) {
        throw new HttpException(
          ErrorMessages.EMAIL_OTP_NOT_SENT,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      user.otp = otp.toString();
      user.otpExpires = otpExpire;
      user.otpId = otpRes.message_id;
      await this.userService.update(user.id, user);

      return {
        message,
        otp,
      };
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyResetPasscode(payload: VerifyResetPasscodeDto): Promise<any> {
    try {
      const { emailOrAccountNumber, otp } = payload;
      let user;
      if (emailOrAccountNumber.includes('@')) {
        user = await this.userService.findOneByEmail(emailOrAccountNumber);
      } else {
        const account =
          await this.accountService.findStoredByAccountNumber(
            emailOrAccountNumber,
          );
        if (!account) {
          throw new HttpException(
            ErrorMessages.ACCOUNT_NOT_FOUND,
            HttpStatus.NOT_FOUND,
          );
        }
        user = await this.userService.findById(account.userId);
      }
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (user.otp !== otp || user.otpExpires < new Date()) {
        throw new HttpException(
          ErrorMessages.INVALID_OTP,
          HttpStatus.BAD_REQUEST,
        );
      }

      return;
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async resetPasscode(payload: ResetPasscodeDto): Promise<any> {
    try {
      const { emailOrAccountNumber, otp, passcode, confirmPasscode } = payload;
      let user;
      if (emailOrAccountNumber.includes('@')) {
        user = await this.userService.findOneByEmail(emailOrAccountNumber);
      } else {
        const account =
          await this.accountService.findStoredByAccountNumber(
            emailOrAccountNumber,
          );
        if (!account) {
          throw new HttpException(
            ErrorMessages.ACCOUNT_NOT_FOUND,
            HttpStatus.NOT_FOUND,
          );
        }
        user = await this.userService.findById(account.userId);
      }
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (user.otp !== otp || user.otpExpires < new Date()) {
        throw new HttpException(
          ErrorMessages.INVALID_OTP,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (passcode !== confirmPasscode) {
        throw new HttpException(
          ErrorMessages.PASSWORDS_DO_NOT_MATCH,
          HttpStatus.BAD_REQUEST,
        );
      }

      const hashedPasscode = await bcrypt.hash(passcode.toString(), 10);
      user.passcode = hashedPasscode;
      await this.userService.update(user.id, user);

      return;
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
