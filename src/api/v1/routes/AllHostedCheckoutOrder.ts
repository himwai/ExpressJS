import express, { Request, Response } from "express";
import type {
  AllHostedCheckoutOrderRequestBody,
  AllHostedCheckoutOrderResponse,
} from "../types";
import { CreateAllHostedCheckoutOrderRequest } from "../types/allHostedCheckoutOrderRequest";
import {
  generateSignature,
  generateTimestampAndNonce,
  createCheckoutUrl,
} from "../utils/crypto";
import { validateOrderRequest, ValidationError } from "../utils/validation";
import {
  KPayService,
  KPayApiError,
  createApiHeaders,
} from "../services/kpayService";
import { CONFIG } from "../config/constants";

const router = express.Router();
const kpayService = new KPayService();

const createOrderRequestBody = (
  body: AllHostedCheckoutOrderRequestBody
): CreateAllHostedCheckoutOrderRequest => ({
  merchantIcon: body.merchantIcon,
  managedOutTradeNo: `order_${Date.now()}`,
  payAmount: body.payAmount,
  payCurrency: CONFIG.DEFAULTS.CURRENCY,
  discountAmount: body.discountAmount,
  notifyUrl: body.notifyUrl,
  returnUrl: body.returnUrl,
  orderRemark: body.orderRemark,
  itemList: [
    {
      itemNo: body.itemNo,
      itemName: body.itemName,
      itemIcon: body.itemIcon,
      price: body.payAmount + (body.discountAmount || 0),
      priceCurrency: CONFIG.DEFAULTS.CURRENCY,
      quantity: body.quantity,
    },
  ],
});

router.post(
  "/",
  async (
    req: Request<AllHostedCheckoutOrderRequestBody>,
    res: Response<AllHostedCheckoutOrderResponse>
  ) => {
    try {
      // Validate request body
      validateOrderRequest(req.body);

      // Create order request
      const orderRequest = createOrderRequestBody(req.body);
      const { timestamp, nonceStr } = generateTimestampAndNonce();
      const bodyString = JSON.stringify(orderRequest);

      // Generate signature for order creation
      const signature = generateSignature(
        {
          requestMethod: "POST",
          requestUri: CONFIG.API.ENDPOINTS.CREATE_ALL_HOSTED_CHECKOUT_ORDER,
          body: bodyString,
          merchantCode: req.body.merchantCode,
          timestamp,
          nonceStr,
        },
        req.body.kpayApiKey
      );

      // Create API headers
      const headers = createApiHeaders({
        MerchantCode: req.body.merchantCode,
        NonceStr: nonceStr,
        Timestamp: timestamp.toString(),
        Signature: signature,
        Language: req.body.language,
      });

      // Create order via KPay API
      const apiResponse = await kpayService.createOrder(orderRequest, headers);
      if (
        !CONFIG.API.SUCCESS_CODES.includes(apiResponse.code) ||
        !apiResponse.data
      ) {
        throw new KPayApiError(
          `Failed to create order: ${apiResponse.message} with code ${apiResponse.code}`,
          undefined,
          apiResponse.code
        );
      }

      const managedOrderNo = apiResponse.data.managedOrderNo;

      // Generate new signature for checkout URL
      const { timestamp: newTimestamp, nonceStr: newNonceStr } =
        generateTimestampAndNonce();
      const checkoutSignature = generateSignature(
        {
          requestMethod: "GET",
          requestUri: `${CONFIG.API.ENDPOINTS.GENERATE_ALL_HOSTED_CHECKOUT_ORDER}?managedOrderNo=${managedOrderNo}&K-Merchant-Code=${req.body.merchantCode}&K-Nonce-Str=${newNonceStr}&K-Timestamp=${newTimestamp}`,
          body: "",
          merchantCode: req.body.merchantCode,
          timestamp: newTimestamp,
          nonceStr: newNonceStr,
        },
        req.body.kpayApiKey
      );

      // Create checkout URL
      const checkoutUrl = createCheckoutUrl(
        `${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.GENERATE_ALL_HOSTED_CHECKOUT_ORDER}`,
        managedOrderNo,
        req.body.merchantCode,
        newNonceStr,
        newTimestamp,
        checkoutSignature
      );

      res.status(200).json({
        message: "Hosted checkout order created successfully",
        checkoutUrl,
      });
    } catch (error) {
      console.error("Error processing hosted checkout order:", error);

      if (error instanceof ValidationError) {
        res.status(400).json({
          message: "Validation Error",
          error: error.message,
        });
        return;
      }

      if (error instanceof KPayApiError) {
        res.status(error.statusCode || 502).json({
          message: "Payment API Error",
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        message: "Internal Server Error",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }
);
export default router;
