import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
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
import { generateTransactionReference, nairaToKobo } from 'src/utils/helpers';
import { Beneficiary, Transaction } from '@prisma/client';
import { GetAllTransactionQueryDto } from './dtos/get-all-transaction-query.dto';
import { GetBundlesDto } from '../bill-payment/dtos/get-bundles.dto';
import { BuyCableTvDto } from '../bill-payment/dtos/buy-cable-tv.dto';
import { BuyInternetDto } from '../bill-payment/dtos/buy-internet.dto';
import { BuyAirtimeDto } from '../bill-payment/dtos/buy-airtime.dto';
import { BillPaymentProvider } from '../bill-payment/providers/bill-payment.provider.interface';
import { BuyElectricityDto } from '../bill-payment/dtos/buy-electricity.dto';
import { meterAbb } from 'src/shared/enums/all.enum';

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
    @Inject('BillPaymentProvider')
    private readonly billService: BillPaymentProvider,
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

  async getOneForUser(userId: string, id: string) {
    try {
      const t = await this.transactionRepository.findOneTransactionForUser(
        id,
        userId,
      );
      if (!t) {
        throw new HttpException(
          ErrorMessages.TRANSACTION_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      return t;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //Methods that will call the Bank One Endpoints
  async fetchBanks() {
    try {
      const alertProp = {
        Code: '00000',
        Gateway: null,
        ID: '00000',
        Name: 'Alert Microfinance Bank',
        Status: false,
        StatusDetails: null,
        RequestStatus: false,
        ResponseDescription: null,
        ResponseStatus: null,
      };

      const otherProp = await this.fetchBanksApi();
      const otherBanks = Array.isArray(otherProp) ? otherProp : [];

      return [alertProp, ...otherBanks];
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
      user.isPinSet = true;
      await this.userService.update(user.id, user);
      return;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async validateBalance(accountNumber: string, amount: number) {
    try {
      const balance =
        await this.accountService.getAccountBalanceByAccountNumber(
          accountNumber,
        );
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

  async generateTransactionReference() {
    try {
      let reference: string;
      let transactionCheck: Transaction;
      do {
        reference = generateTransactionReference();
        transactionCheck =
          await this.transactionRepository.findTransactionByReference(
            reference,
          );
      } while (transactionCheck);
      return reference;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async validateUserAndAccount(userId: string, accountNumber: string) {
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new HttpException(
          ErrorMessages.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      const account =
        await this.accountService.findStoredByAccountNumber(accountNumber);
      if (!account || account.userId !== userId) {
        throw new HttpException(
          ErrorMessages.ACCOUNT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      return { user, account };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async sendMoney(userId: string, payload: SendMoneyDto) {
    try {
      const {
        fromAccountNumber,
        amount,
        accountNumber,
        bankCode,
        narration,
        accountName,
        bankName,
        pin,
      } = payload;

      // validate user and account
      const validated = await this.validateUserAndAccount(
        userId,
        fromAccountNumber,
      );

      //check if pin is correct
      await this.confirmPin(userId, { pin });

      //enquire name
      // const nameEnquiry = await this.nameEnquiry({ accountNumber, bankCode });

      //check if user has enough balance
      await this.validateBalance(fromAccountNumber, amount);

      const reference = await this.generateTransactionReference();

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
              bankCode: bankCode,
              accountName: accountName,
              bankName: bankName,
              user: { connect: { id: userId } },
              account: { connect: { id: validated.account.id } },
            },
          });
        }

        //create transaction
        const transaction = await prisma.transaction.create({
          data: {
            reference,
            amount,
            narration,
            action: 'DEBIT',
            transactionType: 'TRANSFER',
            user: { connect: { id: userId } },
            beneficiary: { connect: { id: beneficiary.id } },
            newBalance: 0,
            status: 'PENDING',
            account: { connect: { id: validated.account.id } },
          },
        });

        if (transaction) {
          let transferResponse: {
            message: string | Record<string, any>;
            statusCode: number;
          };
          if (bankCode == '00000') {
            transferResponse = await this.intraBankTransfer({
              amount: amount.toString(),
              fromAccountNumber: validated.account.accountNumber,
              toAccountNumber: accountNumber,
              narration,
              reference: transaction.reference,
            });

            if (transferResponse) {
              await prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: 'SUCCESS' },
              });
            }
          } else {
            transferResponse = await this.interBankTransfer({
              transactionReference: transaction.reference,
              amount: amount.toString(),
              payerAccountNumber: validated.account.accountNumber,
              payer: `${validated.user.firstName} ${validated.user.lastName} ${validated.user.otherName}`,
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

  async createAirtimeTransaction(userId: string, data: BuyAirtimeDto) {
    try {
      const {
        amount,
        phoneNumber,
        fromAccountNumber,
        pin,
        network,
        serviceCategoryId,
      } = data;

      // validate user and account
      const validated = await this.validateUserAndAccount(
        userId,
        fromAccountNumber,
      );

      console.log('validated', validated);

      //validate pin
      await this.confirmPin(userId, { pin });

      //validate balance
      await this.validateBalance(fromAccountNumber, amount);

      return await this.prismaService.$transaction(async (prisma) => {
        //get the beneficiary
        let beneficiary: Beneficiary;
        beneficiary = await prisma.beneficiary.findFirst({
          where: {
            phoneNumber,
            userId,
            networkProvider: network,
          },
        });

        if (!beneficiary) {
          beneficiary = await prisma.beneficiary.create({
            data: {
              phoneNumber,
              networkProvider: network,
              user: { connect: { id: userId } },
            },
          });
        }

        //create transaction
        const transaction = await prisma.transaction.create({
          data: {
            reference: await this.generateTransactionReference(),
            amount,
            narration: 'Airtime Purchase',
            action: 'DEBIT',
            transactionType: 'AIRTIME',
            user: { connect: { id: userId } },
            newBalance: 0,
            status: 'PENDING',
            account: { connect: { id: validated.account.id } },
            beneficiary: { connect: { id: beneficiary.id } },
          },
        });

        if (transaction) {
          //create bill
          await prisma.billPayments.create({
            data: {
              user: { connect: { id: userId } },
              transaction: { connect: { id: transaction.id } },
              amount: amount,
              biller: 'shiga',
              productId: serviceCategoryId,
            },
          });

          const transferResponse = await this.intraBankTransfer({
            amount: amount.toString(),
            fromAccountNumber: validated.account.accountNumber,
            toAccountNumber: '1100063641',
            narration: 'Airtime Purchase',
            reference: transaction.reference,
          });
          if (!transferResponse) {
            throw new HttpException(
              ErrorMessages.TRANSACTION_FAILED,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }

          return transaction;
        }

        throw new HttpException(
          ErrorMessages.TRANSACTION_FAILED,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createInternetTransaction(userId: string, data: BuyInternetDto) {
    try {
      const {
        fromAccountNumber,
        pin,
        network,
        phoneNumber,
        serviceCategoryId,
        bundleCode,
      } = data;

      // validate user and account
      const validated = await this.validateUserAndAccount(
        userId,
        fromAccountNumber,
      );

      //validate pin
      await this.confirmPin(userId, { pin });

      //get the amount
      const amount = await this.getInternetAmount({
        serviceCategoryId,
        bundleCode,
      });

      //validate balance
      await this.validateBalance(fromAccountNumber, amount);

      return await this.prismaService.$transaction(async (prisma) => {
        //get the beneficiary
        let beneficiary: Beneficiary;
        beneficiary = await prisma.beneficiary.findFirst({
          where: {
            phoneNumber,
            userId,
            networkProvider: network,
          },
        });

        if (!beneficiary) {
          beneficiary = await prisma.beneficiary.create({
            data: {
              beneficiaryType: 'DATA',
              phoneNumber,
              networkProvider: network,
              user: { connect: { id: userId } },
            },
          });
        }

        //create transaction
        const transaction = await prisma.transaction.create({
          data: {
            reference: await this.generateTransactionReference(),
            amount,
            narration: 'Internet Purchase',
            action: 'DEBIT',
            transactionType: 'DATA',
            user: { connect: { id: userId } },
            newBalance: 0,
            status: 'PENDING',
            account: { connect: { id: validated.account.id } },
            beneficiary: { connect: { id: beneficiary.id } },
          },
        });

        if (transaction) {
          //create bill payments
          await prisma.billPayments.create({
            data: {
              user: { connect: { id: userId } },
              transaction: { connect: { id: transaction.id } },
              amount: amount,
              biller: 'shiga',
              productId: serviceCategoryId,
            },
          });
          const transferResponse = await this.intraBankTransfer({
            amount: amount.toString(),
            fromAccountNumber: validated.account.accountNumber,
            toAccountNumber: '1100063641', // bill payment collection account
            narration: 'Internet Purchase',
            reference: transaction.reference,
          });

          if (!transferResponse) {
            throw new HttpException(
              transferResponse.message,
              transferResponse.statusCode,
            );
          }
          return transaction;
        }

        throw new HttpException(
          ErrorMessages.TRANSACTION_FAILED,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createCableTvTransaction(userId: string, data: BuyCableTvDto) {
    try {
      const { fromAccountNumber, pin, provider, cardNumber, name } = data;

      const amount = 0;

      // validate user and account
      const validated = await this.validateUserAndAccount(
        userId,
        fromAccountNumber,
      );

      //validate pin
      await this.confirmPin(userId, { pin });

      //validate balance
      await this.validateBalance(fromAccountNumber, amount);

      return await this.prismaService.$transaction(async (prisma) => {
        //get the beneficiary
        let beneficiary: Beneficiary;
        beneficiary = await prisma.beneficiary.findFirst({
          where: {
            tvCardNumber: cardNumber,
            tvProvider: provider,
            userId,
          },
        });

        if (!beneficiary) {
          beneficiary = await prisma.beneficiary.create({
            data: {
              beneficiaryType: 'TV_BILL',
              tvCardNumber: cardNumber,
              tvProvider: provider,
              tvCardName: name,
              user: { connect: { id: userId } },
            },
          });
        }

        //create transaction
        const transaction = await prisma.transaction.create({
          data: {
            reference: await this.generateTransactionReference(),
            amount,
            narration: 'Cable TV Purchase',
            action: 'DEBIT',
            transactionType: 'TV_BILL',
            user: { connect: { id: userId } },
            newBalance: 0,
            status: 'PENDING',
            account: { connect: { id: validated.account.id } },
            beneficiary: { connect: { id: beneficiary.id } },
          },
        });

        if (transaction) {
          //create bill payments
          await prisma.billPayments.create({
            data: {
              user: { connect: { id: userId } },
              transaction: { connect: { id: transaction.id } },
              amount: amount,
              biller: 'shiga',
              productId: provider,
            },
          });

          //transfer to bill payment account
          const transferResponse = await this.intraBankTransfer({
            amount: amount.toString(),
            fromAccountNumber: validated.account.accountNumber,
            toAccountNumber: '1100063641', // bill payment collection account
            narration: 'Cable TV Purchase',
            reference: transaction.reference,
          });

          if (!transferResponse) {
            throw new HttpException(
              transferResponse.message,
              transferResponse.statusCode,
            );
          }
          return transaction;
        }

        throw new HttpException(
          ErrorMessages.TRANSACTION_FAILED,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createElectricityTransaction(userId: string, data: BuyElectricityDto) {
    try {
      const {
        amount,
        fromAccountNumber,
        pin,
        meterNumber,
        meterName,
        serviceCategoryId,
        vendType,
        meterType,
      } = data;

      // validate user and account
      const validated = await this.validateUserAndAccount(
        userId,
        fromAccountNumber,
      );
      //validate pin
      await this.confirmPin(userId, { pin });
      //validate balance
      await this.validateBalance(fromAccountNumber, amount);
      return await this.prismaService.$transaction(async (prisma) => {
        //get the beneficiary
        let beneficiary: Beneficiary;
        beneficiary = await prisma.beneficiary.findFirst({
          where: {
            meterNumber,
            meterType,
            userId,
          },
        });
        if (!beneficiary) {
          beneficiary = await prisma.beneficiary.create({
            data: {
              meterNumber,
              meterName,
              user: { connect: { id: userId } },
              meterType,
              meterTypeFull: meterAbb[meterType],
            },
          });
        }
        //create transaction
        const transaction = await prisma.transaction.create({
          data: {
            reference: await this.generateTransactionReference(),
            amount,
            narration: 'Electricity Purchase',
            action: 'DEBIT',
            transactionType: 'ELECTRICITY',
            user: { connect: { id: userId } },
            newBalance: 0,
            status: 'PENDING',
            account: { connect: { id: validated.account.id } },
            beneficiary: { connect: { id: beneficiary.id } },
          },
        });
        if (transaction) {
          //store more details about the bill payment
          await prisma.billPayments.create({
            data: {
              user: { connect: { id: userId } },
              transaction: { connect: { id: transaction.id } },
              amount: amount,
              biller: 'shiga',
              productId: serviceCategoryId,
              productType: vendType,
            },
          });
          const transferResponse = await this.intraBankTransfer({
            amount: amount.toString(),
            fromAccountNumber: validated.account.accountNumber,
            toAccountNumber: '1100063641', // bill payment collection account
            narration: 'Electricity Purchase',
            reference: transaction.reference,
          });
          if (!transferResponse) {
            throw new HttpException(
              transferResponse.message,
              transferResponse.statusCode,
            );
          }
          return transaction;
        }
        throw new HttpException(
          ErrorMessages.TRANSACTION_FAILED,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // async createTransaction
  async getFee(amount: number) {
    try {
      return amount;
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

  async getInternetAmount(payload: GetBundlesDto) {
    try {
      const { serviceCategoryId, bundleCode } = payload;
      const bundles =
        await this.billService.getInternetPlans(serviceCategoryId);
      const bundle = bundles.find((b: any) => b.bundleCode === bundleCode);
      if (!bundle) {
        throw new HttpException(
          ErrorMessages.BUNDLE_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      return Number(bundle.amount);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
        Amount: nairaToKobo(payload.amount, true),
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
        Amount: nairaToKobo(payload.amount, true),
        FromAccountNumber: payload.fromAccountNumber,
        ToAccountNumber: payload.toAccountNumber,
      };
      console.log('data', data);
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.coreBankingUrl}/transactions/intra-bank-transfer`,
          data,
          {
            headers: this.headers,
          },
        ),
      );

      console.log('response', response.data);

      if (response.data?.ResponseCode != '00') {
        throw new HttpException(
          response.data?.ResponseMessage,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return response.data;
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //webhook for transaction
  async handleTransactionWebhook(data: any) {
    try {
      const {
        Amount,
        AccountNumber,
        RecipientAccountNumber,
        AvailableBalance,
        ResponseCode,
        TransactionReference,
        Narration,
      } = data;

      const transaction =
        await this.transactionRepository.findTransactionByReference(
          TransactionReference,
        );

      const debitUserBalanceEnq =
        await this.accountService.getAccountBalanceByAccountNumber(
          AccountNumber,
        );

      const creditUser = await this.accountService.getUserByAccountNumber(
        RecipientAccountNumber,
      );

      const creditAccount = await this.accountService.getAccountByAccountNumber(
        RecipientAccountNumber,
      );

      if (!creditUser || !creditAccount) {
        throw new HttpException(
          ErrorMessages.ACCOUNT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      if (ResponseCode !== '00') {
        transaction.status = 'FAILED';
        await this.transactionRepository.updateTransaction(transaction.id, {
          status: 'FAILED',
          newBalance: debitUserBalanceEnq?.WithdrawableBalance,
        });
      }

      if (ResponseCode == '00') {
        await this.prismaService.$transaction(async (prisma) => {
          if (
            transaction &&
            transaction.beneficiary.accountNumber == AccountNumber
          ) {
            await prisma.transaction.update({
              where: { id: transaction.id },
              data: {
                status: 'SUCCESS',
                newBalance: debitUserBalanceEnq?.WithdrawableBalance,
              },
            });
          }

          let beneficiary: Beneficiary;

          beneficiary = await prisma.beneficiary.findFirst({
            where: {
              accountNumber: RecipientAccountNumber,
              userId: creditUser.id,
            },
          });

          if (!beneficiary) {
            beneficiary = await prisma.beneficiary.create({
              data: {
                accountNumber: RecipientAccountNumber,
                accountName: creditAccount.accountName,
                bankCode: creditAccount.bankCode,
                bankName: creditAccount.bankName,
                user: { connect: { id: creditUser.id } },
                account: { connect: { id: creditAccount.id } },
              },
            });
          }

          await prisma.transaction.create({
            data: {
              reference: await this.generateTransactionReference(),
              amount: Amount,
              narration: Narration,
              action: 'CREDIT',
              transactionType: 'TRANSFER',
              user: { connect: { id: creditUser.id } },
              newBalance: AvailableBalance,
              status: 'SUCCESS',
              account: { connect: { id: creditAccount.id } },
              beneficiary: { connect: { id: beneficiary.id } },
            },
          });
        });
      }
      return;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
