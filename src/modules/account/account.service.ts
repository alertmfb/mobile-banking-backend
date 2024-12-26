import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AccountRepository } from './account.repository';
import { Prisma } from '@prisma/client';
import { KycService } from '../kyc/kyc.service';

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
        ? 'https://api-middleware-staging.alertmfb.com.ng/api/sharedServices/v1'
        : 'https://api-middleware-staging.alertmfb.com.ng/api/sharedServices/v1';
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
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const residentialAdress =
        await this.kycService.getResidentialAddress(userId);

      if (!residentialAdress) {
        throw new HttpException(
          'User residential address not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const data = {
        TransactionTrackingRef: user.id,
        AccountOpeningTrackingRef: 'TestQuick4',
        ProductCode: '101',
        CustomerID: '',
        LastName: user.lastName,
        OtherNames: `${user.firstName} ${user.otherName}`,
        BVN: user.id,
        PhoneNo: user.reference,
        Gender: user.gender == 'MALE' ? '0' : '1',
        PlaceOfBirth: user.pob,
        DateOfBirth: user.dob,
        Address: `${residentialAdress.address}, ${residentialAdress.city}, ${residentialAdress.state}`,
        AccountOfficerCode: '101',
        Email: user.email,
        NotificationPreference: 0,
        TransactionPermission: '0',
        AccountTier: '1',
      };

      const response = await lastValueFrom(
        this.httpService.post(`${this.coreBankingUrl}/create-bank`, data, {
          headers: {
            Authorization: this.coreBankingAuthKey,
          },
        }),
      );

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
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  async createCustomerAndAccount(userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
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
}
