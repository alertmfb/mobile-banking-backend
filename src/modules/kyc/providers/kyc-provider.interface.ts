export interface KycProvider {
  verifyTin(payload: any): Promise<any>;
  cacBasic(payload: any): Promise<any>;
  cacAdvanced(payload: any): Promise<any>;
  bvnLooupBasic(payload: any): Promise<any>;
  bvnLookupAdvanced(payload: any): Promise<any>;
  bvnValidate(payload: any): Promise<any>;
  ninLookup(payload: any): Promise<any>;
  phoneLookupBasic(payload: any): Promise<any>;
  phoneLookupAdvanced(payload: any): Promise<any>;
  individualAddress(payload: any): Promise<any>;
  businessAddress(payload: any): Promise<any>;
  addressStatus(payload: any): Promise<any>;
  bvnFaceMatch(payload: any): Promise<any>;
  ninFaceMatch(payload: any): Promise<any>;
  liveness?(payload: any): Promise<any>;
  verifyBankAccount(payload: any): Promise<any>;
  getBankList(payload: any): Promise<any>;
}
