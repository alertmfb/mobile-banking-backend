import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { HelperService } from 'src/utils/helper.service';
import {
  CreateUserDto,
  CreatedUserResponseDto,
  UserCredentialDto,
  ResponseDto,
  OtpVerificationDto,
  OtpType,
  TransactionPinDto,
  requestOtpDto,
  ResetPasswordDto,
} from './dto/user.dto';
import { EmailService } from 'src/common/email/mailer.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly helperService: HelperService,
    private readonly emailService: EmailService,
  ) {}

  async addPhoneNumber(phoneNumber: string): Promise<ResponseDto> {
    try {
      const existingUser = await this.prisma.user.findFirst({
        where: { phoneNumber: phoneNumber },
      });
      if (existingUser) {
        throw new BadRequestException(
          `Phone number ${phoneNumber} already used.`,
        );
      }
      const existingPhone = await this.prisma.phoneNumber.findFirst({
        where: { phoneNumber: phoneNumber },
      });
      const otp = await this.helperService.generateOtp();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 5);

      if (existingPhone) {
        await this.prisma.phoneNumber.update({
          where: { id: existingPhone.id },
          data: {
            otp: otp,
            otpExpiry: otpExpiry,
          },
        });
      } else {
        await this.prisma.phoneNumber.create({
          data: {
            phoneNumber: phoneNumber,
            otp: otp,
            otpExpiry: otpExpiry,
          },
        });
      }

      // TODO: Send SMS with the new OTP
      return {
        message: `A new OTP has been sent to ${phoneNumber}. Please verify it.`,
        statusCode: 200,
      };
    } catch (error) {
      return error.response;
    }
  }

  async verifyPhoneOtp(verifyOtpDto: OtpVerificationDto): Promise<ResponseDto> {
    try {
      const check = await this.prisma.phoneNumber.findFirst({
        where: { otp: verifyOtpDto?.otp },
      });
      if (!check) {
        throw new BadRequestException('Invalid OTP');
      }

      const currentTime = new Date();
      if (currentTime > check.otpExpiry) {
        throw new BadRequestException(`OTP has expired.`);
      }

      await this.prisma.phoneNumber.update({
        where: { id: check.id },
        data: { verificationStatus: true },
      });

      return {
        message: `OTP verified successfully.`,
        statusCode: 200,
      };
    } catch (error) {
      return error.response;
    }
  }

  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<CreatedUserResponseDto> {
    try {
      const check = await this.prisma.user.findFirst({
        where: { phoneNumber: createUserDto?.phoneNumber },
      });

      if (check) {
        throw new BadRequestException('Phone number already used');
      }

      const checkUsername = await this.prisma.user.findFirst({
        where: { username: createUserDto?.username },
      });

      if (checkUsername) {
        throw new BadRequestException(
          'username already used, please provide another username',
        );
      }

      const phoneStatus = await this.prisma.phoneNumber.findFirst({
        where: {
          phoneNumber: createUserDto?.phoneNumber,
          verificationStatus: true,
        },
      });

      if (!phoneStatus) {
        throw new BadRequestException('Phone number is not verified');
      }

      const hashedPassword = await this.helperService.hasher(
        createUserDto?.password,
        12,
      );

      const hashedPin = await this.helperService.hasher(
        createUserDto?.transactionPin,
        4,
      );
      const requireData = {
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        password: hashedPassword,
        transactionPin: hashedPin,
        country: createUserDto.country,
        phoneNumber: createUserDto.phoneNumber,
        nin: createUserDto.nin,
        bvn: createUserDto.bvn,
        city: createUserDto.city,
        address: createUserDto.address,
        state: createUserDto.state,
        zipCode: createUserDto.zipCode,
        username: createUserDto.username,
        dateOfBirth: new Date(createUserDto.dateOfBirth),
      };

      const user = await this.prisma.user.create({
        data: requireData,
      });

      if (!user) {
        throw new BadRequestException('Error occured while adding user');
      }

      const jwtPayload = { sub: user.id, email: user.email };

      const token = await this.helperService.generateToken(jwtPayload);

      //send user email
      const subject = 'Your account has been successfully.';
      const payload = {
        name: user?.firstName,
      };

      const recipientEmail = user.email;

      await this.emailService.sendMail(
        recipientEmail,
        subject,
        // 'welcomeUser',
        'emaill',
        payload,
      );

      const response: CreatedUserResponseDto = {
        message: 'Account created successfully',
        data: {
          id: user.id,
          token: token,
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
          dateOfBirth: user.dateOfBirth.toISOString().split('T')[0],
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
    UserCredentialDto: UserCredentialDto,
  ): Promise<CreatedUserResponseDto> {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: UserCredentialDto.email },
      });
      if (!existingUser) {
        throw new NotFoundException('User with this email does not exist');
      }

      let checkPassword = await this.helperService.matchChecker(
        UserCredentialDto.password,
        existingUser.password,
      );

      if (!checkPassword) {
        throw new UnauthorizedException('Invalid credentials!');
      }

      const jwtPayload = { sub: existingUser.id, email: existingUser.email };

      const token = await this.helperService.generateToken(jwtPayload);

      const response: CreatedUserResponseDto = {
        message: 'Login successfully',
        data: {
          id: existingUser.id,
          token: token,
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
          dateOfBirth: existingUser.dateOfBirth.toISOString().split('T')[0],
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

  async requestOtp(requestOtpDto: requestOtpDto): Promise<ResponseDto> {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: requestOtpDto.email },
      });
      if (!existingUser) {
        throw new NotFoundException('User with this email does not exist');
      }

      const otp = await this.helperService.generateOtp();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 5);

      await this.prisma.user.update({
        where: { email: existingUser.email },
        data: { resetOtp: otp, otpExpiry: otpExpiry },
      });

      //send user email
      const emailTemplate =
        requestOtpDto.type === OtpType.PASSWORD_RESET
          ? 'password'
          : 'transactionPin';

      const subject =
        requestOtpDto.type === OtpType.PASSWORD_RESET
          ? 'Reset Password'
          : 'Transaction PIN Update';

      const payload = { name: existingUser.firstName, url: otp };

      await this.emailService.sendMail(
        existingUser.email,
        subject,
        emailTemplate,
        payload,
      );

      return {
        message: 'Email reset code has been sent to your email',
        statusCode: 200,
      };
    } catch (error) {
      return error.response;
    }
  }

  async verifyResetOtp(
    OtpVerificationDto: OtpVerificationDto,
  ): Promise<ResponseDto> {
    try {
      const check = await this.prisma.user.findFirst({
        where: { resetOtp: OtpVerificationDto?.otp },
      });

      if (!check) {
        throw new BadRequestException('Invalid OTP');
      }

      const currentTime = new Date();
      if (currentTime > check.otpExpiry) {
        throw new BadRequestException(`OTP has expired.`);
      }

      const updateUser = await this.prisma.user.update({
        where: { id: check.id },
        data: { resetOtp: null },
      });

      if (!updateUser) {
        throw new BadRequestException('Error occured while updating');
      }

      return {
        message: 'OTP Verified successfully',
        statusCode: 200,
      };
    } catch (error) {
      return error.response;
    }
  }
  async resetPassword(userCredential: ResetPasswordDto): Promise<ResponseDto> {
    try {
      const checkUser = await this.prisma.user.findFirst({
        where: { id: userCredential.id },
      });

      if (!checkUser) {
        throw new NotFoundException('User not found');
      }

      const hashedPassword = await this.helperService.hasher(
        userCredential?.password,
        12,
      );

      const updateUser = await this.prisma.user.update({
        where: { id: checkUser.id },
        data: { password: hashedPassword },
      });

      if (!updateUser) {
        throw new BadRequestException('Error occured while updating');
      }

      return {
        message: 'Password reset successfully',
        statusCode: 200,
      };
    } catch (error) {
      return error.response;
    }
  }

  async getProfile(identifier: string): Promise<CreatedUserResponseDto> {
    try {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: identifier },
            { phoneNumber: identifier },
            { username: identifier },
          ],
        },
      });
      if (!existingUser) {
        throw new NotFoundException('User with this email does not exist');
      }
      const response: CreatedUserResponseDto = {
        message: 'User fetched successfully',
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
          dateOfBirth: existingUser.dateOfBirth.toISOString().split('T')[0],
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

  async resetTransactionPin(payload: TransactionPinDto): Promise<ResponseDto> {
    try {
      const checkUser = await this.prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!checkUser) {
        throw new NotFoundException('User not found');
      }

      const hashedPin = await this.helperService.hasher(
        payload.transactionPin,
        12,
      );

      const updateUser = await this.prisma.user.update({
        where: { id: checkUser.id },
        data: { transactionPin: hashedPin },
      });

      if (!updateUser) {
        throw new BadRequestException(
          'Error occured while resetting transaction pin',
        );
      }

      return {
        message: 'Transaction pin reset successfully',
        statusCode: 200,
      };
    } catch (error) {
      return error.response;
    }
  }
}
