export interface BillPaymentProvider {
  getAirtimeCategories(): Promise<any>;
  buyAirtime(data: any): Promise<any>;
  getInternetCategories(): Promise<any>;
  getInternetPlans(data: any): Promise<any>;
  buyInternet(data: any): Promise<any>;
  getElectricityProviders(): Promise<any>;
  validateElectricityMeterNumber(data: any): Promise<any>;
  buyElectricity(data: any): Promise<any>;
  getCableTvProviders(): Promise<any>;
  getCableTvPlans(data: any): Promise<any>;
  validateCableTvSmartCardNumber(data: any): Promise<any>;
  buyCableTv(data: any): Promise<any>;
}
