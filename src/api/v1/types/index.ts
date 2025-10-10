import { Language } from "./kpayApi";

export interface AllHostedCheckoutOrderRequestBody {
  language: Language;
  kpayApiKey: string;
  merchantIcon: string | null;
  merchantCode: string;
  payAmount: number;
  discountAmount: number | null;
  notifyUrl: string | null;
  returnUrl: string | null;
  orderRemark: string | null;
  itemNo: string;
  itemName: string;
  itemIcon: string | null;
  quantity: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
}

export interface AllHostedCheckoutOrderResponse {
  message?: string;
  checkoutUrl?: string;
  error?: string;
}

export interface KPayApiResponse {
  code: number | string;
  message?: string;
  data?: {
    managedOrderNo: string;
  };
}

export interface SignatureParams {
  requestMethod: string;
  requestUri: string;
  timestamp: number;
  nonceStr: string;
  merchantCode: string;
  body: string;
}
