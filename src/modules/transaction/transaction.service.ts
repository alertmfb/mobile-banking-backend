import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { NameEnquiryDto } from './dtos/name-enquiry.dto';
import { GetTransactionsQueryDto } from './dtos/get-transaction-query.dto';
import { InterBankTransferDto } from './dtos/inter-bank-transfer.dto';

@Injectable()
export class TransactionService {
  private readonly coreBankingUrl;
  private readonly coreBankingAuthKey;
  private readonly enviroment;
  private readonly headers;
  private readonly logger;
  constructor(
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
    this.logger = new Logger(TransactionService.name);
  }

  //Methods that will call the Bank One Endpoints
  async fetchBanks() {
    try {
      return await this.fetchBanksApi();
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async nameEnquiry(payload: NameEnquiryDto) {
    try {
      const { accountNumber, bankCode } = payload;
      return await this.nameEnquiryApi(accountNumber, bankCode);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getTransactions(query: GetTransactionsQueryDto) {
    try {
      return await this.getTransactionsApi(query);
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
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async nameEnquiryApi(accountNumber: string, bankCode: string) {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          `${this.coreBankingUrl}/nameEnquiry?accountNumber=${accountNumber}&bankCode=${bankCode}`,
          { headers: this.headers },
        ),
      );
      return response.data;
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async interBankTransfer(payload: InterBankTransferDto) {
    try {
      const data = {
        TransactionReference: 'string',
        Amount: payload.amount,
        PayerAccountNumber: 'string',
        Payer: 'string',
        ReceiverBankCode: 'string',
        ReceiverAccountNumber: 'string',
        ReceiverName: 'string',
        ReceiverPhoneNumber: 'string',
        ReceiverAccountType: 'string',
        ReceiverKYC: 'string',
        ReceiverBVN: 'string',
        Narration: 'string',
        NIPSessionID: 'string',
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
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async intraBankTransfer(data: any) {
    try {
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
