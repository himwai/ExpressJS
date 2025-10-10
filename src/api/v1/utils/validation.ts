import type { AllHostedCheckoutOrderRequestBody } from "../types";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export const validateOrderRequest = (body: Partial<AllHostedCheckoutOrderRequestBody>): void => {
  const requiredFields = [
    "language",
    "kpayApiKey",
    "merchantCode",
    "payAmount",
  ] as const;

  for (const field of requiredFields) {
    if (!body[field]) {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  }

  if (typeof body.payAmount !== "number" || body.payAmount <= 0) {
    throw new ValidationError("payAmount must be a positive number");
  }

  if (body.discountAmount !== null && body.discountAmount !== undefined) {
    if (typeof body.discountAmount !== "number" || body.discountAmount < 0) {
      throw new ValidationError("discountAmount must be a non-negative number");
    }
  }

  if (body.email && !isValidEmail(body.email)) {
    throw new ValidationError("Invalid email format");
  }

  if (body.phone && !isValidPhone(body.phone)) {
    throw new ValidationError("Invalid phone format");
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
