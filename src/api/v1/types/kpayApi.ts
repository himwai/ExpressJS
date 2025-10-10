export enum Language {
  ZH_CN = "zh_CN",
  ZH_HK = "zh_HK",
  EN_US = "en_US",
}

export enum PageFeatureControl {
  HIDE_REMAINING_PAYMENT_TIME = "HIDE_REMAINING_PAYMENT_TIME",
  HIDE_ORDER_ITEM_DETAILS_BUTTON = "HIDE_ORDER_ITEM_DETAILS_BUTTON",
  HIDE_BIND_CARD_PAY_BUTTON = "HIDE_BIND_CARD_PAY_BUTTON",
  HIDE_EMAIL_ADDRESS = "HIDE_EMAIL_ADDRESS",
  HIDE_BILL_INFORMATION = "HIDE_BILL_INFORMATION",
}

export interface Headers {
  MerchantCode: string;
  NonceStr: string;
  Signature: string;
  Timestamp: string;
  Language: Language;
}