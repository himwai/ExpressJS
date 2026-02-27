import {
  CardOrganization,
  Language,
  OrderState,
  PaymentMethod,
  Result,
  TransactionType,
  WalletType,
} from "./typeKpayApi";

export interface SalesResultRequestMetaData {
  language?: Language;
  kpayApiUrl?: string;
  kpayApiKey: string;
  merchantCode: string;
  kpayApiQueryPaymentOrderEndpoint?: string;
}

export interface SalesResultRequestDataContent {
  outTradeNo?: string;
  orderNo?: string;
}

export interface SalesResultResponseDataContent {
  merchantCode: string;
  outTradeNo: string;
  orderNo: string;
  transactionNo?: string | undefined;
  transactionAmount?: number | undefined;
  payMethodId?: PaymentMethod | undefined;
  transactionTypeId?: TransactionType | undefined;
  cardOrganizationId?: CardOrganization | undefined;
  walletType?: WalletType | undefined;
  channelSerialNo?: string | undefined;
  payAmount: number;
  payCurrency: string;
  localPayAmount: number;
  localPayCurrency: string;
  transactionFinishTime?: string | undefined;
  result: Result;
  reason?: string | undefined;
  orderState: OrderState;
}

export interface SalesResultRequest
  extends RequestObject<
    SalesResultRequestDataContent,
    SalesResultRequestMetaData
  > {}

export interface SalesResultResponse
  extends ResultObject<SalesResultResponseDataContent> {}

export const requiredSalesResultDataContentFields: (keyof SalesResultRequestDataContent)[] =
  [];

export const requiredSalesResultMetaDataFields: (keyof SalesResultRequestMetaData)[] =
  ["kpayApiKey", "merchantCode"];
