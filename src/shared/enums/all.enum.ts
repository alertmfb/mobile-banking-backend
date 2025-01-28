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
