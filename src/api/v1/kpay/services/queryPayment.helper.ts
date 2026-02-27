import { KPayApiError, KPayService } from "./kpay.service";
import { CONFIG } from "../config/constants";
import {
  QueryPaymentOrderRequest,
  QueryPaymentOrderResponse,
} from "../types/typeKpayQueryPayment";
import { Language } from "../types/typeKpayApi";

/**
 * Shared helper to query a payment order via KPay API.
 * Used by both resultController and salesResultController.
 */
export const queryPaymentOrder = async (
  params: { outTradeNo: string; orderNo: string },
  merchantCode: string,
  kpayApiKey: string,
  language: Language,
  baseURL: string,
  endpoint: string
) => {
  const service = new KPayService<
    QueryPaymentOrderRequest,
    QueryPaymentOrderResponse
  >(baseURL, endpoint);

  const response = await service.get(
    params,
    merchantCode,
    kpayApiKey,
    language
  );

  if (!CONFIG.API.SUCCESS_CODES.includes(response.code) || !response.data) {
    throw new KPayApiError(
      `Failed to query payment order: ${response.message} with code ${response.code}`,
      undefined,
      response.code
    );
  }

  return response.data;
};
