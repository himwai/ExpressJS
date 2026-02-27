import { Request, Response } from "express";
import {
  SalesResultRequest,
  SalesResultResponse,
} from "../types/typeSalesResult";
import { validateSalesResultRequest } from "../middleware/validation.middleware";
import { KPayApiError } from "../services/kpay.service";
import { CONFIG } from "../config/constants";
import { queryPaymentOrder } from "../services/queryPayment.helper";
import { ValidationError } from "../middleware/error.middleware";
import { Language } from "../types/typeKpayApi";

export const salesResultController = async (
  req: Request<SalesResultRequest>,
  res: Response<SalesResultResponse>
) => {
  try {
    // Extract and validate request data
    validateSalesResultRequest(req.body);

    const dataContent = req.body.dataContent || {};
    const metaData = req.body.metaData || {};
    const language = metaData.language || Language.ZH_HK;
    const kpayApiKey = metaData.kpayApiKey;
    const merchantCode = metaData.merchantCode;
    const outTradeNo = dataContent.outTradeNo || "";
    const orderNo = dataContent.orderNo || "";
    const baseURL = metaData.kpayApiUrl || CONFIG.API.BASE_URL;
    const queryPaymentOrderEndpoint =
      metaData.kpayApiQueryPaymentOrderEndpoint ||
      CONFIG.API.ENDPOINTS.QUERY_PAYMENT_ORDER;

    // Query payment order via KPay API
    const paymentData = await queryPaymentOrder(
      { outTradeNo, orderNo },
      merchantCode,
      kpayApiKey,
      language,
      baseURL,
      queryPaymentOrderEndpoint
    );

    // Send successful response
    res.status(200).json({
      resultType: "SUCCESS",
      resultMessage: "Payment order information retrieved successfully",
      dataContent: {
        merchantCode: paymentData.merchantCode,
        outTradeNo: paymentData.outTradeNo,
        orderNo: paymentData.orderNo,
        transactionNo: paymentData.transactionNo,
        transactionAmount: paymentData.transactionAmount,
        payMethodId: paymentData.payMethodId,
        transactionTypeId: paymentData.transactionTypeId,
        cardOrganizationId: paymentData.cardOrganizationId,
        walletType: paymentData.walletType,
        channelSerialNo: paymentData.channelSerialNo,
        payAmount: paymentData.payAmount,
        payCurrency: paymentData.payCurrency,
        localPayAmount: paymentData.localPayAmount,
        localPayCurrency: paymentData.localPayCurrency,
        transactionFinishTime: paymentData.transactionFinishTime,
        result: paymentData.result,
        reason: paymentData.reason,
        orderState: paymentData.orderState,
      },
      metaData: CONFIG.META_DATA,
    });
  } catch (error) {
    console.error("Error processing sales result query:", error);

    if (error instanceof ValidationError) {
      res.status(400).json({
        resultType: "ERROR",
        resultMessage: "Validation Error: " + error.message,
        metaData: CONFIG.META_DATA,
      });
      return;
    }

    if (error instanceof KPayApiError) {
      res.status(error.statusCode || 502).json({
        resultType: "ERROR",
        resultMessage: "Payment API Error: " + error.message,
        metaData: CONFIG.META_DATA,
      });
      return;
    }

    res.status(500).json({
      resultType: "ERROR",
      resultMessage: "Internal Server Error: " + (error as Error).message,
      metaData: CONFIG.META_DATA,
    });
  }
};
