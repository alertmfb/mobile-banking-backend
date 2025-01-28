import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { NameEnquiryDto } from './dtos/name-enquiry.dto';
import { GetTransactionsQueryDto } from './dtos/get-transaction-query.dto';
import { InterBankTransferDto } from './dtos/inter-bank-transfer.dto';
import { SendMoneyDto } from './dtos/send-money.dto';
import { UserService } from '../user/user.service';
import { ErrorMessages } from 'src/shared/enums/error.message.enum';
import * as bcrypt from 'bcrypt';
import { AccountService } from '../account/account.service';
import { ConfirmPinDto } from './dtos/confirm-pin-query.dto';
import { SetPinDto } from '../auth/dto/set-pin.dto';
import { TransactionRepository } from './transaction.repository';
import { SetTransactionLimitDto } from './dtos/set-transaction-limit.dto';
import { PrismaService } from '../prisma/prisma.service';
import { IntraBankTransferDto } from './dtos/intra-bank-transfer.dto';
import { generateTransactionReference } from 'src/utils/helpers';
import { Beneficiary, Transaction } from '@prisma/client';
import { GetAllTransactionQueryDto } from './dtos/get-all-transaction-query.dto';

@Injectable()
export class TransactionService {
  private readonly coreBankingUrl: string;
  private readonly coreBankingAuthKey: string;
  private readonly environment: string;
  private readonly headers: { apikey: string };
  private readonly logger: Logger;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly userService: UserService,
    private readonly accountService: AccountService,
    private readonly transactionRepository: TransactionRepository,
    private readonly prismaService: PrismaService,
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
    this.logger = new Logger(TransactionService.name);
  }

  //Methods that will call the Bank One Endpoints
  async fetchBanks() {
    try {
      return await this.fetchBanksApi();
    } catch (error) {
      throw new HttpException(
        `Transaction Error: ${error?.response?.data?.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async getBankCodes(code: string) {
    const banks = await this.fetchBanks();
    if (code) {
      return banks.find((bank: any) => bank.Code === code);
    }
  }

  async nameEnquiry(payload: NameEnquiryDto) {
    try {
      const { accountNumber, bankCode } = payload;
      if (bankCode == '00000') {
        const accountCheck =
          await this.accountService.getAccountByAccountNumber(accountNumber);
        if (!accountCheck) {
          throw new HttpException(
            ErrorMessages.ACCOUNT_NOT_FOUND,
            HttpStatus.NOT_FOUND,
          );
        }
        return {
          name: accountCheck.Accounts[0].accountName,
          bankCode,
          bankName: 'Alert Microfinance Bank',
        };
      }
      const accountCheck = await this.nameEnquiryApi(accountNumber, bankCode);
      if (!accountCheck) {
        throw new HttpException(
          ErrorMessages.ACCOUNT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      const bank = await this.getBankCodes(bankCode);
      return {
        name: accountCheck.Name,
        bankCode,
        bankName: bank?.Name,
      };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getTransactions(query: GetAllTransactionQueryDto, userId?: string) {
    try {
      return await this.transactionRepository.findAllTransactions(
        query,
        userId,
      );
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async checkPinSet(userId: string) {
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      if (!user.pin) {
        return { pinSet: false };
      }
      return { pinSet: true };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async confirmPin(userId: string, payload: ConfirmPinDto) {
    try {
      const { pin } = payload;
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (!user.pin) {
        throw new HttpException(
          ErrorMessages.PIN_NOT_SET,
          HttpStatus.BAD_REQUEST,
        );
      }

      const isMatch = await bcrypt.compare(pin, user.pin);
      if (!isMatch) {
        throw new HttpException(
          ErrorMessages.PIN_MISMATCH,
          HttpStatus.BAD_REQUEST,
        );
      }
      return;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async setPin(userId: string, payload: SetPinDto) {
    try {
      const { pin, confirmPin } = payload;
      if (pin !== confirmPin) {
        throw new HttpException(
          ErrorMessages.PASSCODE_MISMATCH,
          HttpStatus.BAD_REQUEST,
        );
      }
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      const hashedPin = await bcrypt.hash(pin, 10);
      user.pin = hashedPin;
      await this.userService.update(user.id, user);
      return;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async validateBalance(userId: string, amount: number) {
    try {
      const balance = await this.accountService.getAccountBalance(userId);
      const { WithdrawableBalance } = balance;
      if (amount > Number(WithdrawableBalance)) {
        throw new HttpException(
          ErrorMessages.INSUFFICIENT_BALANCE,
          HttpStatus.BAD_REQUEST,
        );
      }
      return;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async sendMoney(userId: string, payload: SendMoneyDto) {
    try {
      const { accountId, amount, accountNumber, bankCode, narration, pin } =
        payload;

      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      const account = await this.accountService.findOne(accountId);
      if (!account) {
        throw new HttpException(
          ErrorMessages.ACCOUNT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      //check if pin is correct
      await this.confirmPin(userId, { pin });

      //enquire name
      const nameEnquiry = await this.nameEnquiry({ accountNumber, bankCode });

      //check if user has enough balance
      await this.validateBalance(userId, amount);

      let reference: string;
      let transactionCheck: Transaction;

      do {
        reference = generateTransactionReference();
        transactionCheck =
          await this.transactionRepository.findTransactionByReference(
            reference,
          );
      } while (transactionCheck);

      //now initiate transfer
      return await this.prismaService.$transaction(async (prisma) => {
        //create beneficary first
        let beneficiary: Beneficiary;

        beneficiary = await prisma.beneficiary.findFirst({
          where: {
            accountNumber,
            bankCode,
            userId,
          },
        });

        if (!beneficiary) {
          beneficiary = await prisma.beneficiary.create({
            data: {
              accountNumber,
              bankCode: nameEnquiry.bankCode,
              accountName: nameEnquiry.name,
              bankName: nameEnquiry.bankName,
              user: { connect: { id: userId } },
              account: { connect: { id: accountId } },
            },
          });
        }

        //create transaction
        const transaction = await prisma.transaction.create({
          data: {
            reference,
            amount,
            narration,
            transactionType: 'TRANSFER',
            user: { connect: { id: userId } },
            beneficiary: { connect: { id: beneficiary.id } },
            newBalance: 0,
            status: 'PENDING',
            account: { connect: { id: accountId } },
          },
        });

        if (transaction) {
          let transferResponse;
          if (bankCode == '00000') {
            transferResponse = await this.intraBankTransfer({
              amount: amount.toString(),
              fromAccountNumber: account.accountNumber,
              toAccountNumber: accountNumber,
              narration,
              reference: transaction.reference,
            });
          } else {
            transferResponse = await this.interBankTransfer({
              transactionReference: transaction.reference,
              amount: amount.toString(),
              payerAccountNumber: account.accountNumber,
              payer: `${user.firstName} ${user.lastName} ${user.otherName}`,
              receiverBankCode: bankCode,
              receiverAccountNumber: accountNumber,
            });
          }

          if (!transferResponse) {
            throw new HttpException(
              transferResponse.message,
              transferResponse.statusCode,
            );
          }
        }
      });

      //start transaction to debit and credit
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // async createTransaction

  async getFee(amount: number) {
    try {
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async setLimit(userId: string, payload: SetTransactionLimitDto) {
    try {
      const { transactionType } = payload;
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      const limit = await this.transactionRepository.findLimitByUserIdAndType(
        userId,
        transactionType,
      );
      if (limit) {
        await this.transactionRepository.updateTransactionLimit(limit.id, {
          singleLimit: payload.singleLimit,
          dailyLimit: payload.dailyLimit,
          monthlyLimit: payload.monthlyLimit,
        });
      }

      await this.transactionRepository.createTransactionLimit({
        user: { connect: { id: userId } },
        transactionType,
        singleLimit: payload.singleLimit,
        dailyLimit: payload.dailyLimit,
        monthlyLimit: payload.monthlyLimit,
      });

      return await this.transactionRepository.findTransactionLimitByUserId(
        userId,
      );
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getLimit(userId: string) {
    try {
      const defaultLimits: any = [
        { beneficiaryType: 'TRANSFER', dailyLimit: 100000, singleLimit: 50000 },
        { beneficiaryType: 'DATA', dailyLimit: 50000, singleLimit: 20000 },
        { beneficiaryType: 'AIRTIME', dailyLimit: 5000, singleLimit: 2000 },
        { beneficiaryType: 'ELECTRICITY', dailyLimit: 5000, singleLimit: 2000 },
      ];

      const limit =
        await this.transactionRepository.findTransactionLimitByUserId(userId);

      if (limit.length > 0) {
        const limitMap = new Map(limit.map((l) => [l.transactionType, l]));
        defaultLimits.forEach((defaultLimit) => {
          if (!limitMap.has(defaultLimit.beneficiaryType)) {
            limit.push(defaultLimit);
          }
        });

        return limit;
      }

      return defaultLimits;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //Bank One Endpoints for Transactions
  private async getTransactionsApi(query: GetTransactionsQueryDto) {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          `${this.coreBankingUrl}/accounts/get-account-transactions`,
          {
            params: query,
            headers: this.headers,
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Transaction Error: ${error?.response?.data?.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  private async nameEnquiryApi(accountNumber: string, bankCode: string) {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.coreBankingUrl}/transactions/name-enquiry`,
          {
            AccountNumber: accountNumber,
            BankCode: bankCode,
          },
          { headers: this.headers },
        ),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Transaction Error: ${error?.response?.data?.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  private async fetchBanksApi() {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          `${this.coreBankingUrl}/transactions/fetch-banks`,
          {
            headers: this.headers,
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Transaction Error: ${error?.response?.data?.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  private async interBankTransfer(payload: InterBankTransferDto) {
    try {
      const data = {
        TransactionReference: payload.transactionReference,
        Amount: payload.amount,
        PayerAccountNumber: payload.payerAccountNumber,
        Payer: payload.payer,
        ReceiverBankCode: payload.receiverBankCode,
        ReceiverAccountNumber: payload.receiverAccountNumber,
        ReceiverName: payload.receiverName,
        ReceiverPhoneNumber: payload.receiverPhoneNumber,
        ReceiverAccountType: payload.receiverAccountType,
        ReceiverKYC: payload.receiverKYC,
        ReceiverBVN: payload.receiverBVN,
        Narration: payload.narration,
        NIPSessionID: payload.nipSessionID,
      };
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.coreBankingUrl}/transactions/inter-bank-transfer`,
          data,
          {
            headers: this.headers,
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Transaction Error: ${error?.response?.data?.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  private async intraBankTransfer(payload: IntraBankTransferDto) {
    try {
      const data = {
        RetrievalReference: payload.reference,
        Narration: payload.narration,
        Amount: payload.amount,
        FromAccountNumber: payload.fromAccountNumber,
        ToAccountNumber: payload.toAccountNumber,
      };
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.coreBankingUrl}/transactions/intra-bank-transfer`,
          data,
          {
            headers: this.headers,
          },
        ),
      );
      return response.data;
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
