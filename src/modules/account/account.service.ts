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
import { Cron, CronExpression } from '@nestjs/schedule';
import { plainToClass, plainToInstance } from 'class-transformer';
import { AccountBalanceResponseDto } from '../transaction/dtos/account-balance-reponse.dto';
import { GenerateStatementQueryDto } from './dto/generate-statement-query.dto';
import { SubAccountResponseDto } from './dto/sub-account-reponse.dto';

@Injectable()
export class AccountService {
  private readonly coreBankingUrl: string;
  private readonly coreBankingAuthKey: string;
  private readonly environment: string;
  private readonly headers: { apikey: string };
  private readonly logger: Logger;
  private accountCreationRunning: boolean;

  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly userService: UserService,
    private readonly kycService: KycService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.environment = this.configService.get<string>('APP_ENV');
    this.coreBankingUrl =
      this.environment == 'production'
        ? 'https://api-middleware-staging.alertmfb.com.ng/api/sharedServices/v1/core'
        : 'https://api-middleware-staging.alertmfb.com.ng/api/sharedServices/v1/core';
    this.coreBankingAuthKey =
      this.environment == 'production'
        ? this.configService.get<string>('CORE_BANKING_LIVE_KEY')
        : this.configService.get<string>('CORE_BANKING_SANDOX_KEY');
    this.headers = {
      apikey: this.coreBankingAuthKey,
    };
    this.logger = new Logger(AccountService.name);
    this.accountCreationRunning = false;
  }

  async findOne(id: string) {
    return this.accountRepository.getOneById(id);
  }

  async getUserByAccountNumber(accountNumber: string) {
    const account =
      await this.accountRepository.findByAccountNumber(accountNumber);
    if (!account) {
      throw new HttpException(
        ErrorMessages.ACCOUNT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    return await this.userService.findOne(account.userId);
  }

  async storeAccount(account: Prisma.AccountCreateInput) {
    return this.accountRepository.create(account);
  }

  async findStoredByAccountNumber(accountNumber: string) {
    return this.accountRepository.findByAccountNumber(accountNumber);
  }

  async getSubAccounts(userId: string) {
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      const customerId = await this.getCustomerId(user.id);
      const response = await this.getSubAccountsApi(customerId);
      if (!response.Accounts) {
        throw new HttpException(
          ErrorMessages.ACCOUNT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      return plainToInstance(SubAccountResponseDto, response.Accounts, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  async createAccount(userId: string, background?: boolean) {
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        if (background) {
          return;
        } else {
          throw new HttpException(
            ErrorMessages.USER_NOT_FOUND,
            HttpStatus.NOT_FOUND,
          );
        }
      }

      const account = await this.accountRepository.getAccountByUserId(user.id);
      if (account) {
        if (background) {
          return;
        } else {
          throw new HttpException(
            ErrorMessages.ACCOUNT_ALREADY_EXISTS,
            HttpStatus.CONFLICT,
          );
        }
      }

      const kyc = await this.kycService.getKyc(userId);
      const kycDetails = await this.kycService.getKycUserDetails(userId);

      if (!kyc || !kycDetails) {
        if (background) {
          return;
        } else {
          if (background) {
            return;
          } else {
            throw new HttpException(
              ErrorMessages.USER_NOT_DONE_KYC,
              HttpStatus.NOT_FOUND,
            );
          }
        }
      }

      // check if user has done bvn and nin verification
      if (!kyc.bvnStatus && !kyc.ninStatus) {
        throw new HttpException(
          'User has not done BVN or NIN verification',
          HttpStatus.NOT_FOUND,
        );
      }

      if (!user.bvnLookup) {
        if (background) {
          return;
        } else {
          throw new HttpException(
            ErrorMessages.USER_BVN_NOT_FOUND,
            HttpStatus.NOT_FOUND,
          );
        }
      }

      // check if user has added residential address
      const residentialAdress =
        await this.kycService.getResidentialAddress(userId);

      const email = user.email || kycDetails.email;
      const phone =
        user.phoneNumber || kycDetails.phoneOne || kycDetails.phoneTwo;
      const address = residentialAdress
        ? `${residentialAdress.address}, ${residentialAdress.city}, ${residentialAdress.state}`
        : `${kycDetails.residentialAddress}, ${kycDetails.residentialLga}, ${kycDetails.residentialState}`;
      //check if names, email, phone number, dob is set
      console.log({ user, email, phone, address });
      if (
        !user.firstName ||
        !user.lastName ||
        !email ||
        !phone ||
        !user.dob ||
        !address
      ) {
        if (background) {
          return;
        } else {
          throw new HttpException(
            ErrorMessages.USER_DETAILS_INCOMPLETE,
            HttpStatus.NOT_FOUND,
          );
        }
      }

      const data = {
        Gender: user.gender == 'MALE' ? '0' : '1',
        BVN:
          this.environment == 'production'
            ? decrypt(user.bvnLookup)
            : randomInt(10000000000, 99999999999).toString(),

        FirstName: user.firstName,
        LastName: user.lastName,
        OtherNames: user.otherName,
        PlaceOfBirth: user.pob,
        DateOfBirth: user.dob,
        PhoneNo: phone,
        Address: address,
        Email: email,
      };

      const response = await lastValueFrom(
        this.httpService.post(
          `${this.coreBankingUrl}/accounts/create-account`,
          data,
          {
            headers: this.headers,
          },
        ),
      );

      if (!response || !response.data || !response.data.IsSuccessful) {
        throw new HttpException(
          'Account creation failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      console.log('creating...');
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

      //update kyc
      await this.kycService.updateKyc(user.id, {
        accountIssued: true,
      });

      // create account number
      console.log('Account created');
      return;
    } catch (error) {
      throw new HttpException(
        `Account Error: ${error?.response?.data?.message || error.message}`,
        error?.response?.data?.statusCode || error.status,
      );
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

  async getAccountBalanceByAccountNumber(accountNumber: string) {
    try {
      return await this.balanceEnquiryApi(accountNumber);
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
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

  async getAccountBalance(userId: string) {
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
      const response = await this.balanceEnquiryApi(account.accountNumber);
      return plainToInstance(AccountBalanceResponseDto, response, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  async closeAccount(userId: string) {
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
      const response = await this.closeAccountApi(
        account.accountNumber,
        'Close Account',
      );
      return response;
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  async getCustomerId(userId: string) {
    try {
      const account = await this.accountRepository.getAccountByUserId(userId);
      if (!account) {
        throw new HttpException(
          ErrorMessages.ACCOUNT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      return account.customerId;
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  async generateStatement(userId: string, query: GenerateStatementQueryDto) {
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
      const response = await this.generateStatementApi({
        ...query,
        accountNumber: account.accountNumber,
      });
      return response;
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  //Bank One Endpoints for Transactions
  async generateStatementApi(query: GenerateStatementQueryDto) {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          `${this.coreBankingUrl}/accounts/generate-statement`,
          {
            params: query,
            headers: this.headers,
          },
        ),
      );
      return response.data;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAccountByBvnApi(bvn: string) {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.coreBankingUrl}/customers/get-by-bvn`, {
          headers: this.headers,
          params: { bvn },
        }),
      );
      return response.data;
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  async getAccountByPhoneApi(phoneNumber: string) {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          `${this.coreBankingUrl}/customers/get-by-phoneNo`,
          {
            headers: this.headers,
            params: { phoneNumber },
          },
        ),
      );
      return response.data;
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  async getSubAccountsApi(customerId: string) {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          `${this.coreBankingUrl}/accounts/get-sub-accounts`,
          {
            headers: this.headers,
            params: { customerId },
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Account Error: ${error?.response?.data?.message || error.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async balanceEnquiryApi(accountNumber: string) {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          `${this.coreBankingUrl}/accounts/balance-enquiry`,
          {
            headers: this.headers,
            params: { accountNumber },
          },
        ),
      );
      return response.data;
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  async closeAccountApi(accountNumber: string, narration: string) {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.coreBankingUrl}/accounts/close-account`,
          { accountNumber, narration },
          { headers: this.headers },
        ),
      );
      return response.data;
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCreateAccount() {
    if (this.accountCreationRunning) {
      this.logger.warn('Previous job still running. Skipping this execution.');
      return;
    }
    this.accountCreationRunning = true;
    try {
      const kycs = await this.kycService.getManyKycWhereQuery(
        {
          bvnStatus: true,
          accountIssued: false,
        },
        5,
      );
      for (const kyc of kycs) {
        const background = true;
        await this.createAccount(kyc.userId, background);
      }
    } catch (error) {
      this.logger.error('Error creating account', error);
    } finally {
      this.accountCreationRunning = false;
    }
  }
}
