export enum CardType {
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD',
  VERVE = 'VERVE',
}

export enum PickupBranch {
  YABA = 'YABA',
  IKEJA = 'IKEJA',
  VI = 'VI',
  TRADEFAIR = 'TRADEFAIR',
  IKORODU = 'IKORODU',
}

export enum CardRequestStatus {
  RECEIVED = 'RECEIVED',
  PROCESSING = 'PROCESSING',
  PRINTING = 'PRINTING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  SENT = 'SENT',
}

export enum CardDeliveryOption {
  PICKUP = 'PICKUP',
  DELIVERY = 'DELIVERY',
}

export enum OrderBy {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum TransactionType {
  TRANSFER = 'TRANSFER',
  AIRTIME = 'AIRTIME',
  DATA = 'DATA',
  TV_BILL = 'TV_BILL',
  ELECTRICITY = 'ELECTRICITY',
  PENSION = 'PENSION',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
}

export enum NetworkProvider {
  MTN = 'MTN',
  GLO = 'GLO',
  AIRTEL = 'AIRTEL',
  NINE_MOBILE = 'NINE_MOBILE',
}

export enum TvProvider {
  DSTV = 'DSTV',
  GOTV = 'GOTV',
  STARTIMES = 'STARTIMES',
}

export enum ElectricityProvider {
  BEDC = 'BEDC',
  EKEDC = 'EKEDC',
  AEDC = 'AEDC',
  EEDC = 'EEDC',
  IBEDC = 'IBEDC',
  IKEDC = 'IKEDC',
  JEDC = 'JEDC',
  KAEDC = 'KAEDC',
  KAEDCO = 'KAEDCO',
  PHEDC = 'PHEDC',
  YEDEC = 'YEDEC',
}

export const meterAbb = {
  BEDC: 'Benin Electricity Distribution Company',
  EKEDC: 'Eko Electricity Distribution Company',
  AEDC: 'Abuja Electricity Distribution Company',
  EEDC: 'Enugu Electricity Distribution Company',
  IBEDC: 'Ibadan Electricity Distribution Company',
  IKEDC: 'Ikeja Electricity Distribution Company',
  JEDC: 'Jos Electricity Distribution Company',
  KAEDC: 'Kaduna Electricity Distribution Company',
  KEDCO: 'Kano Electricity Distribution Company',
  PHEDC: 'Port Harcourt Electricity Distribution Company',
  YEDC: 'Yola Electricity Distribution Company',
};