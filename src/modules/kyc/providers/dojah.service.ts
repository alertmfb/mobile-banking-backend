import { BvnDto } from './../dto/bvn.dto';
import { ConfigService } from '@nestjs/config';
import { KycProvider } from './kyc-provider.interface';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { NinVerifyDto } from '../dto/dojah/nin-face-verify.dto';
import { CacBasicDto } from '../dto/dojah/cac-basic.dto';
import { CacAdvancedDto } from '../dto/dojah/cac-advanced.dto';
import { ValidateBvnDto } from '../dto/dojah/validate-bvn.dto';
import { VerifyBankAccountDto } from '../dto/dojah/verify-bank.dto';
import { IndividualAddressVerifyDto } from '../dto/dojah/individual-address.dto';
import { LinelinessDto } from '../dto/dojah/lineliness.dto';
import { BusinessAddressVerifyDto } from '../dto/dojah/business-address.dto';
import { BvnFaceVerifyDto } from '../dto/dojah/bvn-face-verify.dto';
import { HttpException } from '@nestjs/common';

export class DojahService implements KycProvider {
  private readonly baseUrl;
  private readonly apiKey;
  private readonly header;
  private readonly environment;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.environment = this.configService.get<string>('APP_ENV');
    this.baseUrl =
      this.environment === 'production'
        ? 'https://api-middleware-staging.alertmfb.com.ng/api/sharedServices/v1'
        : 'https://api-middleware-staging.alertmfb.com.ng/api/sharedServices/v1';
    this.apiKey = this.configService.get('KYC_KEY');
    this.header = {
      apikey: this.apiKey,
    };
  }

  async verifyTin(tin: string): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.baseUrl}/verification/kyc/tin`, {
          headers: this.header,
          params: { tin },
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Verification Error: ${error?.response?.data?.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async cacBasic(payload: CacBasicDto): Promise<any> {
    try {
      const { rcNumber, companyType } = payload;
      const response = await lastValueFrom(
        this.httpService.get(`${this.baseUrl}/verification/kyc/cac/basic`, {
          headers: this.header,
          params: { rcNumber, companyType },
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Verification Error: ${error?.response?.data?.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async cacAdvanced(payload: CacAdvancedDto): Promise<any> {
    try {
      const { rcNumber, type } = payload;
      const response = await lastValueFrom(
        this.httpService.get(`${this.baseUrl}/kyc/cac/advanced`, {
          headers: this.header,
          params: { rcNumber, type },
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Verification Error: ${error?.response?.data?.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async bvnLooupBasic(payload: BvnDto): Promise<any> {
    try {
      const { bvn } = payload;
      const response = await lastValueFrom(
        this.httpService.get(
          `${this.baseUrl}/verification/kyc/bvn/lookup/basic`,
          {
            headers: this.header,
            params: { bvn },
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Verification Error: ${error?.response?.data?.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async bvnLookupAdvanced(payload: BvnDto): Promise<any> {
    try {
      const { bvn } = payload;
      const response = await lastValueFrom(
        this.httpService.get(
          `${this.baseUrl}/verification/kyc/bvn/lookup/advanced`,
          {
            headers: this.header,
            params: { bvn },
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Verification Error: ${error?.response?.data?.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async bvnValidate(payload: ValidateBvnDto): Promise<any> {
    try {
      const { bvn, firstName, lastName, dob } = payload;
      const response = await lastValueFrom(
        this.httpService.get(`${this.baseUrl}/verification/kyc/bvn/validate`, {
          headers: this.header,
          params: { bvn, firstName, lastName, dob },
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Verification Error: ${error?.response?.data?.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async phoneLookupBasic(phoneNumber: string): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.baseUrl}/kyc/phoneNumber/lookup/basic`, {
          headers: this.header,
          params: { phoneNumber },
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Verification Error: ${error?.response?.data?.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async phoneLookupAdvanced(phoneNumber: string): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.baseUrl}/kyc/phoneNumber/lookup/advanced`,
          {
            headers: this.header,
            params: { phoneNumber },
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Verification Error: ${error?.response?.data?.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async verifyBankAccount(payload: VerifyBankAccountDto): Promise<any> {
    try {
      const { accountNumber, bankCode } = payload;
      const response = await lastValueFrom(
        this.httpService.get(`${this.baseUrl}/kyc/nubanKyc/status`, {
          headers: this.header,
          params: { accountNumber, bankCode },
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Verification Error: ${error?.response?.data?.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async getBankList(): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.baseUrl}/general/banks`, {
          headers: this.header,
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Verification Error: ${error?.response?.data?.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async ninLookup(nin: string): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.baseUrl}/verification/kyc/nin/lookup`, {
          headers: this.header,
          params: { nin },
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Verification Error: ${error?.response?.data?.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async individualAddress(payload: IndividualAddressVerifyDto): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.baseUrl}/verification/address/individual`,
          payload,
          {
            headers: this.header,
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Verification Error: ${error?.response?.data?.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async businessAddress(payload: BusinessAddressVerifyDto): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.baseUrl}/verification/address/business`,
          { payload },
          {
            headers: this.header,
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Verification Error: ${error?.response?.data?.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async addressStatus(referenceId: string): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.baseUrl}/address/status`, {
          headers: this.header,
          params: { referenceId },
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Verification Error: ${error?.response?.data?.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async bvnFaceMatch(payload: BvnFaceVerifyDto): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.baseUrl}/verification/identity/bvn/selfie`,
          payload,
          {
            headers: this.header,
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Verification Error: ${error?.response?.data?.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async ninFaceMatch(payload: NinVerifyDto): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.baseUrl}/verification/identity/nin/selfie`,
          payload,
          {
            headers: this.header,
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Verification Error: ${error?.response?.data?.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }

  async liveness(payload: LinelinessDto): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.baseUrl}verification/identity/liveness`,
          payload,
          {
            headers: this.header,
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Verification Error: ${error?.response?.data?.message}`,
        error?.response?.data?.statusCode || error.status,
      );
    }
  }
}
