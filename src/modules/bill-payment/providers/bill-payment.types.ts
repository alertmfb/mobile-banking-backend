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
