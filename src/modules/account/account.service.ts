import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AccountRepository } from './account.repository';
import { Prisma } from '@prisma/client';
import { KycService } from '../kyc/kyc.service';
import { ErrorMessages } from 'src/shared/enums/error.message.enum';
import { decrypt } from 'src/utils/helpers';
import { randomInt } from 'node:crypto';

@Injectable()
export class AccountService {
  private readonly coreBankingUrl;
  private readonly coreBankingAuthKey;
  private readonly enviroment;
  private readonly headers;
  private readonly logger;
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly userService: UserService,
    private readonly kycService: KycService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.enviroment = this.configService.get<string>('APP_ENV');
    this.coreBankingUrl =
      this.enviroment == 'production'
        ? 'https://api-middleware-staging.alertmfb.com.ng/api/sharedServices/v1/core'
        : 'https://api-middleware-staging.alertmfb.com.ng/api/sharedServices/v1/core';
    this.coreBankingAuthKey =
      this.enviroment == 'production'
        ? this.configService.get<string>('CORE_BANKING_SANDOX_KEY')
        : this.configService.get<string>('CORE_BANKING_LIVE_KEY');
    this.headers = {
      Authorization: this.coreBankingAuthKey,
    };
    this.logger = new Logger(AccountService.name);
  }

  async storeAccount(account: Prisma.AccountCreateInput) {
    return this.accountRepository.create(account);
  }

  async findStoredByAccountNumber(accountNumber: string) {
    return this.accountRepository.findByAccountNumber(accountNumber);
  }

  async createAccount(userId: string) {
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      const account = await this.accountRepository.getAccountByUserId(user.id);
      if (account) {
        throw new HttpException(
          ErrorMessages.ACCOUNT_ALREADY_EXISTS,
          HttpStatus.CONFLICT,
        );
      }

      const kyc = await this.kycService.getKyc(userId);

      if (!kyc) {
        throw new HttpException('User has not done KYC', HttpStatus.NOT_FOUND);
      }

      // check if user has done bvn and nin verification
      if (!kyc.bvnStatus || !kyc.ninStatus) {
        throw new HttpException(
          'User has not done BVN or NIN verification',
          HttpStatus.NOT_FOUND,
        );
      }

      // check if user has added nationality
      if (!kyc.nationalityStatus) {
        throw new HttpException(
          `User has not added nationality`,
          HttpStatus.NOT_FOUND,
        );
      }

      // check if user has added residential address
      const residentialAdress =
        await this.kycService.getResidentialAddress(userId);

      if (!residentialAdress) {
        throw new HttpException(
          'User residential address not found',
          HttpStatus.NOT_FOUND,
        );
      }

      console.log('bvn lookup', user.bvnLookup);

      if (!user.bvnLookup) {
        throw new HttpException('User BVN not found', HttpStatus.NOT_FOUND);
      }

      const data = {
        Gender: user.gender == 'MALE' ? '0' : '1',
        BVN:
          this.enviroment == 'production'
            ? decrypt(user.bvnLookup)
            : randomInt(10000000000, 99999999999).toString(),

        FirstName: user.firstName,
        LastName: user.lastName,
        OtherNames: user.otherName,
        PlaceOfBirth: user.pob,
        DateOfBirth: user.dob,
        PhoneNo: user.phoneNumber,
        Address: `${residentialAdress.address}, ${residentialAdress.city}, ${residentialAdress.state}`,
        Email: user.email,
      };

      // console.log('Creating account...', data);
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.coreBankingUrl}/accounts/create-account`,
          data,
        ),
      );

      console.log('Response', response.data);

      if (!response || !response.data || !response.data.IsSuccessful) {
        throw new HttpException(
          'Account creation failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.accountRepository.create({
        user: {
          connect: {
            id: user.id,
          },
        },
        accountNumber: response.data.Message.AccountNumber,
        customerId: response.data.Message.CustomerID,
        provider: 'BANKONE',
      });

      // create account number
      console.log('Account created');
      return;
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  async createCustomerAndAccount(userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new HttpException(
        ErrorMessages.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getAccountByAccountNumber(accountNo: string) {
    const response = await lastValueFrom(
      this.httpService.get(
        `${this.coreBankingUrl}/customers/get-by-accountNo`,
        {
          headers: this.headers,
          params: { accountNo },
        },
      ),
    );
    return response.data;
  }

  async getUserAccount(userId: string) {
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      const account = await this.accountRepository.getAccountByUserId(user.id);
      if (!account) {
        throw new HttpException(
          ErrorMessages.ACCOUNT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      return account;
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }
}
