import { Request, Response, NextFunction } from "express";

/**
 * Middleware to verify the internal API key
 * Based on the verification process from the Azure Functions implementation
 */
export const verifyApiKey = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

  // If INTERNAL_API_KEY is not set, skip verification (optional protection)
  if (!INTERNAL_API_KEY) {
    return next();
  }

  // Check for the API key in the request headers
  const providedKey = req.headers["x-internal-api-key"];

  if (!providedKey || providedKey !== INTERNAL_API_KEY) {
    res.status(401).json({
      error: "Missing/invalid x-internal-api-key",
    });
    return;
  }

  // API key is valid, proceed to next middleware
  next();
};
