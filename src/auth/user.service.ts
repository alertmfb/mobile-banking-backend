import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { HelperService } from 'src/utils/helper.service';
import {
  CreateUserDto,
  CreatedUserResponseDto,
  EmailDto,
  UserCredentialDto,
  ResponseDto,
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
          `Phone number ${phoneNumber} already exists.`,
        );
      }
      const otp = await this.helperService.generateOtp();

      const newUser = await this.prisma.user.create({
        data: { phoneNumber: phoneNumber, phoneOtp: otp },
      });

      const response: ResponseDto = {
        message: `Phone number has been added successfully.`,
        statusCode: 200,
      };
      return response;
    } catch (error) {
      return error.response;
    }
  }

  async createUser(
    createUserDto: CreateUserDto,
    phoneNumber: string,
  ): Promise<CreatedUserResponseDto> {
    try {
      const existingUser = await this.prisma.user.findFirst({
        where: { phoneNumber: phoneNumber },
      });

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

      //send user email
      const subject = 'Your account has been successfully.';
      const payload = {
        name: user?.firstName,
      };

      const recipientEmail = user.email;

      await this.emailService.sendMail(
        recipientEmail,
        subject,
        'welcomeUser',
        payload,
      );

      const response: CreatedUserResponseDto = {
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
        throw new BadRequestException('Invalid credentials!');
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

  async forgotPassword(emailDto: EmailDto): Promise<ResponseDto> {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: emailDto.email },
      });
      if (!existingUser) {
        throw new NotFoundException('User with this email does not exist');
      }

      const otp = await this.helperService.generateOtp();

      const updatedUser = await this.prisma.user.update({
        where: { email: existingUser.email },
        data: { resetOtp: otp },
      });

      const url = otp;
      //send user email
      const subject = 'Reset Password.';
      const payload = {
        name: existingUser?.firstName,
        url: otp,
      };
      const recipientEmail = existingUser.email;

      await this.emailService.sendMail(
        recipientEmail,
        subject,
        'resetLink',
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
    resetPasswordDto: ResetPasswordDto,
  ): Promise<ResponseDto> {
    try {
      const checkUser = await this.prisma.user.findFirst({
        where: { resetOtp: resetPasswordDto?.otp },
      });

      if (!checkUser) {
        throw new BadRequestException('Invalid OTP');
      }

      const updateUser = await this.prisma.user.update({
        where: { email: checkUser.email },
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
  async resetPassword(userCredential: UserCredentialDto): Promise<ResponseDto> {
    try {
      const checkUser = await this.prisma.user.findFirst({
        where: { resetOtp: userCredential.email },
      });

      if (!checkUser) {
        throw new NotFoundException('User not found');
      }

      const cryptedPassword = await this.helperService.hasher(
        userCredential?.password,
        12,
      );

      const updateUser = await this.prisma.user.update({
        where: { email: checkUser.email },
        data: { password: cryptedPassword },
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
}
