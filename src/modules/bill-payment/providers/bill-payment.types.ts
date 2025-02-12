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
  requestId: string;
  serviceId: string;
  amount: string;
  recipient: string;
  date: string;
};

export type CreditSwitchBuyData = {
  requestId: string;
  serviceId: string;
  amount: string;
  recipient: string;
  date: string;
  productId: string;
};

export type CreditSwitchBuyElectricity = {
  serviceId: string;
  requestId: string;
  amount: string;
  customerName: string;
  customerAddress: string;
  customerAccountId: string;
};

export type CreditSwitchBuyCableTv = Partial<{
  // StarTimes
  smartCardCode: string;
  fee: string;

  // ShowMax
  subscriptionType: string;
  packageName: string;

  // MultiChoice
  serviceId: string;
  invoicePeriod: string;
  customerNo: string;
  customerName: string;
  amount: string;
  productsCodes: string[];

  // General
  transactionRef: string;
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
