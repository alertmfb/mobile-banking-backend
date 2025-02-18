export type ShigaBuyAirtime = {
  serviceCategoryId: string;
  amount: number;
  phoneNumber: string;
};

export type ShigaBuyInternet = {
  serviceCategoryId: string;
  phoneNumber: string;
  bundleCode: string;
};

export type ShigaValidateElectricityMeterNumber = {
  serviceCategoryId: string;
  entityNumber: string;
};

export type ShigaBuyElectricity = {
  vendType: 'PREPAID' | 'POSTPAID';
  serviceCategoryId: string;
  amount: number;
  meterNumber: string;
};

export type ShigaValidateSmartCard = {
  serviceCategoryId: string;
  entityNumber: string;
};

export type ShigaBuyCableTv = {
  serviceCategoryId: string;
  bundleCode: string;
  cardNumber: string;
};

export type CreditSwitchBuyAirtime = {
  transactionId: string;
  serviceCategoryId: string;
  amount: string;
  phoneNumber: string;
  date: string;
};

export type CreditSwitchBuyData = {
  transactionId: string;
  serviceCategoryId: string;
  amount: string;
  phoneNumber: string;
  date: string;
  bundleCode: string;
};

export type CreditSwitchBuyElectricity = {
  vendType: 'PREPAID' | 'POSTPAID';
  serviceCategoryId: string;
  transactionId: string;
  amount: string;
  customerName: string;
  customerAddress: string;
  meterNumber: string;
};

export type CreditSwitchBuyCableTv = Partial<{
  invoicePeriod: string;
  cardNumber: string;
  customerName: string;
  amount: string;
  bundleCode: string;
  transactionId: string;
  serviceCategoryId: string;
}>;

export class CreditSwitchValidateCableTvSmartCardNumber {
  serviceCategoryId: string;
  entityNumber: string;
}

export class CreditSwitchValidateElectricityMeterNumber {
  serviceCategoryId: string;
  entityNumber: string;
  vendType: 'POSTPAID' | 'PREPAID';
}
