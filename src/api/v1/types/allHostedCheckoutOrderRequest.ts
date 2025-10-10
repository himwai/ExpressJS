import { PageFeatureControl } from "./kpayApi";


export interface OrderItem {
  itemNo: string;
  itemName: string;
  itemIcon: string | null;
  price: number;
  priceCurrency: string;
  quantity: number;
}

export interface PaymentEnvironmentInfo {
  browser: string | null;
  ipAddress: string | null;
  copyFlag: boolean;
  timeZone: number | null;
  language: string | null;
  webSite: string | null;
  screenWidth: number | null;
  screenHeight: number | null;
}

export interface DeliveryInfo {
  firstName: string;
  lastName: string;
  telephone: string;
  telephoneAreaCode: string;
  countryId?: number;
  provinceId?: number;
  address: string;
  postCode: string;
}

export interface BillInfo {
  firstName: string;
  lastName: string;
  telephone: string;
  telephoneAreaCode: string;
  countryId?: number;
  provinceId?: number;
  address: string;
  postCode: string;
}

export interface CreateAllHostedCheckoutOrderRequest {
  merchantIcon: string | null;
  managedOutTradeNo: string;
  payAmount: number;
  payCurrency: string;
  discountAmount: number | null;
  notifyUrl: string | null;
  returnUrl: string | null;
  orderRemark: string | null;
  pageFeatureControls?: PageFeatureControl[];
  itemList: OrderItem[];
  paymentEnvironmentInfo?: PaymentEnvironmentInfo;
  deliveryInfo?: DeliveryInfo;
  billInfo?: BillInfo;
}
