import {
  requiredCheckoutDataContentFields,
  requiredCheckoutMetaDataFields,
} from "../types/typeCheckout";
import type { OrderRequest } from "../types/typeCheckout";
import {
  RefundRequest,
  requiredRefundDataContentFields,
  requiredRefundMetaDataFields,
} from "../types/typeRefund";
import { ResultRequest } from "../types/typeResult";
import {
  SalesResultRequest,
  requiredSalesResultDataContentFields,
  requiredSalesResultMetaDataFields,
} from "../types/typeSalesResult";
import { ValidationError } from "./error.middleware";

export const validateRefundRequest = (body: Partial<RefundRequest>): void => {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Request body must be a valid object");
  }

  if (!body.metaData || typeof body.metaData !== "object") {
    throw new ValidationError("metaData must be a valid object");
  }

  if (!body.dataContent || typeof body.dataContent !== "object") {
    throw new ValidationError("dataContent must be a valid object");
  }

  for (const field of requiredRefundDataContentFields) {
    if (!body.dataContent[field]) {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  }

  for (const field of requiredRefundMetaDataFields) {
    if (!body.metaData[field]) {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  }

  if (
    typeof body.dataContent?.refundAmount !== "number" ||
    body.dataContent?.refundAmount <= 0
  ) {
    throw new ValidationError("refundAmount must be a positive number");
  }
};

export const validateResultRequest = (body: Partial<ResultRequest>): void => {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Request body must be a valid object");
  }

  if (!body.metaData || typeof body.metaData !== "object") {
    throw new ValidationError("metaData must be a valid object");
  }

  if (!body.dataContent || typeof body.dataContent !== "object") {
    throw new ValidationError("dataContent must be a valid object");
  }

  if (!body.dataContent.managedOrderNo && !body.dataContent.managedOutTradeNo) {
    throw new ValidationError(
      "Either managedOrderNo or managedOutTradeNo must be provided in dataContent"
    );
  }
};

export const validateOrderRequest = (body: Partial<OrderRequest>): void => {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Request body must be a valid object");
  }

  if (!body.metaData || typeof body.metaData !== "object") {
    throw new ValidationError("metaData must be a valid object");
  }

  if (!body.dataContent || typeof body.dataContent !== "object") {
    throw new ValidationError("dataContent must be a valid object");
  }

  for (const field of requiredCheckoutDataContentFields) {
    if (!body.dataContent[field]) {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  }

  for (const field of requiredCheckoutMetaDataFields) {
    if (!body.metaData[field]) {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  }

  if (
    typeof body.dataContent?.payAmount !== "number" ||
    body.dataContent?.payAmount <= 0
  ) {
    throw new ValidationError("payAmount must be a positive number");
  }

  if (
    body.dataContent?.discountAmount !== null &&
    body.dataContent?.discountAmount !== undefined
  ) {
    if (
      typeof body.dataContent?.discountAmount !== "number" ||
      body.dataContent?.discountAmount < 0
    ) {
      throw new ValidationError("discountAmount must be a non-negative number");
    }
  }

  if (body.dataContent?.email && !isValidEmail(body.dataContent.email)) {
    throw new ValidationError("Invalid email format");
  }

  if (body.dataContent?.phone && !isValidPhone(body.dataContent.phone)) {
    throw new ValidationError("Invalid phone format");
  }
};

export const validateSalesResultRequest = (
  body: Partial<SalesResultRequest>
): void => {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Request body must be a valid object");
  }

  if (!body.metaData || typeof body.metaData !== "object") {
    throw new ValidationError("metaData must be a valid object");
  }

  if (!body.dataContent || typeof body.dataContent !== "object") {
    throw new ValidationError("dataContent must be a valid object");
  }

  for (const field of requiredSalesResultDataContentFields) {
    if (!body.dataContent[field]) {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  }

  for (const field of requiredSalesResultMetaDataFields) {
    if (!body.metaData[field]) {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  }

  if (!body.dataContent.outTradeNo && !body.dataContent.orderNo) {
    throw new ValidationError(
      "Either outTradeNo or orderNo must be provided in dataContent"
    );
  }
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[2-9]\d{7}$/; // Hong Kong phone number format
  return phoneRegex.test(phone);
};
