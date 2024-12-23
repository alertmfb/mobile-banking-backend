import { BvnDto } from '../dto/bvn.dto';
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

export class DojahService implements KycProvider {
  private readonly baseUrl;
  private readonly apiKey;
  private readonly header;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get('KYB_URL');
    this.apiKey = this.configService.get('KYB_KEY');
    this.header = {
      authkey: this.apiKey,
    };
  }

  async verifyTin(tin: string): Promise<any> {
    const response = await lastValueFrom(
      this.httpService.get(`${this.baseUrl}/kyc/tin`, {
        headers: this.header,
        params: { tin },
      }),
    );
    return response.data;
  }

  async cacBasic(payload: CacBasicDto): Promise<any> {
    const { rcNumber, companyType } = payload;
    const response = await lastValueFrom(
      this.httpService.get(`${this.baseUrl}/kyc/cac/basic`, {
        headers: this.header,
        params: { rcNumber, companyType },
      }),
    );
    return response.data;
  }

  async cacAdvanced(payload: CacAdvancedDto): Promise<any> {
    const { rcNumber, type } = payload;
    const response = await lastValueFrom(
      this.httpService.get(`${this.baseUrl}/kyc/cac/advanced`, {
        headers: this.header,
        params: { rcNumber, type },
      }),
    );
    return response.data;
  }

  async bvnLooupBasic(payload: BvnDto): Promise<any> {
    const { bvn } = payload;
    const response = await lastValueFrom(
      this.httpService.get(`${this.baseUrl}/kyc/bvn/lookup/basic`, {
        headers: this.header,
        params: { bvn },
      }),
    );
    return response.data;
  }

  async bvnLookupAdvanced(payload: BvnDto): Promise<any> {
    const { bvn } = payload;
    const response = await lastValueFrom(
      this.httpService.get(`${this.baseUrl}/kyc/bvn/lookup/advanced`, {
        headers: this.header,
        params: { bvn },
      }),
    );
    return response.data;
  }

  async bvnValidate(payload: ValidateBvnDto): Promise<any> {
    const { bvn, firstName, lastName, dob } = payload;
    const response = await lastValueFrom(
      this.httpService.get(`${this.baseUrl}/kyc/bvn/validate`, {
        headers: this.header,
        params: { bvn, firstName, lastName, dob },
      }),
    );
    return response.data;
  }

  async phoneLookupBasic(phoneNumber: string): Promise<any> {
    const response = await lastValueFrom(
      this.httpService.get(`${this.baseUrl}/kyc/phoneNumber/lookup/basic`, {
        headers: this.header,
        params: { phoneNumber },
      }),
    );
    return response.data;
  }

  async phoneLookupAdvanced(phoneNumber: string): Promise<any> {
    const response = await lastValueFrom(
      this.httpService.post(`${this.baseUrl}/kyc/phoneNumber/lookup/advanced`, {
        headers: this.header,
        params: { phoneNumber },
      }),
    );
    return response.data;
  }

  async verifyBankAccount(payload: VerifyBankAccountDto): Promise<any> {
    const { accountNumber, bankCode } = payload;
    const response = await lastValueFrom(
      this.httpService.get(`${this.baseUrl}/kyc/nubanKyc/status`, {
        headers: this.header,
        params: { accountNumber, bankCode },
      }),
    );
    return response.data;
  }

  async getBankList(): Promise<any> {
    const response = await lastValueFrom(
      this.httpService.get(`${this.baseUrl}/general/banks`, {
        headers: this.header,
      }),
    );
    return response.data;
  }

  async ninLookup(nin: string): Promise<any> {
    const response = await lastValueFrom(
      this.httpService.post(`${this.baseUrl}/kyc/nin/lookup`, {
        headers: this.header,
        params: { nin },
      }),
    );
    return response.data;
  }

  async individualAddress(payload: IndividualAddressVerifyDto): Promise<any> {
    const response = await lastValueFrom(
      this.httpService.post(
        `${this.baseUrl}/address/individual/verify`,
        payload,
        {
          headers: this.header,
        },
      ),
    );
    return response.data;
  }

  async businessAddress(payload: BusinessAddressVerifyDto): Promise<any> {
    const response = await lastValueFrom(
      this.httpService.post(
        `${this.baseUrl}/address/business/verify`,
        payload,
        {
          headers: this.header,
        },
      ),
    );
    return response.data;
  }

  async addressStatus(referenceId: string): Promise<any> {
    const response = await lastValueFrom(
      this.httpService.get(`${this.baseUrl}/address/status`, {
        headers: this.header,
        params: { referenceId },
      }),
    );
    return response.data;
  }

  async bvnFaceMatch(payload: BvnFaceVerifyDto): Promise<any> {
    const response = await lastValueFrom(
      this.httpService.post(`${this.baseUrl}/identity/nin/selfie`, payload, {
        headers: this.header,
      }),
    );
    return response.data;
  }

  async ninFaceMatch(payload: NinVerifyDto): Promise<any> {
    const response = await lastValueFrom(
      this.httpService.post(`${this.baseUrl}/identity/nin/selfie`, payload, {
        headers: this.header,
      }),
    );
    return response.data;
  }

  async lineliness(payload: LinelinessDto): Promise<any> {
    const response = await lastValueFrom(
      this.httpService.post(`${this.baseUrl}/identity/lineness`, payload, {
        headers: this.header,
      }),
    );
    return response.data;
  }
}
