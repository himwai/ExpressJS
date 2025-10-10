import axios, { AxiosError } from "axios";
import type { KPayApiResponse } from "../types";
import type { CreateAllHostedCheckoutOrderRequest } from "../types/allHostedCheckoutOrderRequest";
import { CONFIG } from "../config/constants";
import type { Headers } from "../types/kpayApi";

export class KPayApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public apiCode?: string | number
  ) {
    super(message);
    this.name = "KPayApiError";
  }
}

export class KPayService {
  private readonly baseURL = CONFIG.API.BASE_URL;
  private readonly timeout = CONFIG.TIMEOUTS.REQUEST;

  async createOrder(
    requestBody: CreateAllHostedCheckoutOrderRequest,
    headers: Record<string, string>
  ): Promise<KPayApiResponse> {
    try {
      const response = await axios.post<KPayApiResponse>(
        `${this.baseURL}${CONFIG.API.ENDPOINTS.CREATE_ALL_HOSTED_CHECKOUT_ORDER}`,
        requestBody,
        { headers, timeout: this.timeout }
      );

      if (!response.data) {
        throw new KPayApiError(
          "Invalid response from payment API - no data received"
        );
      }

      const { code, message } = response.data;
      if (!CONFIG.API.SUCCESS_CODES.includes(code)) {
        throw new KPayApiError(
          `Payment API error: ${message || code}`,
          response.status,
          code
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof KPayApiError) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        throw new KPayApiError(
          `API request failed: ${axiosError.message}`,
          axiosError.response?.status,
          axiosError.code
        );
      }

      throw new KPayApiError("Unknown error occurred during API request");
    }
  }
}

export const createApiHeaders = (headers: Headers) => ({
  "K-Merchant-Code": headers.MerchantCode,
  "K-Nonce-Str": headers.NonceStr,
  "K-Timestamp": headers.Timestamp,
  "K-Signature": headers.Signature,
  "K-Language": headers.Language,
});
