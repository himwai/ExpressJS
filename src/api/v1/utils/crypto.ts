import * as jsrsasign from "jsrsasign";
import type { SignatureParams } from "../types";

const formatPrivateKey = (privateKey: string): string => {
  if (privateKey.startsWith("-----BEGIN PRIVATE KEY-----")) {
    return privateKey;
  }

  return `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
};

export const generateSignature = (
  {
    requestMethod,
    requestUri,
    timestamp,
    nonceStr,
    merchantCode,
    body,
  }: SignatureParams,
  kpayApiKey: string
): string => {
  try {
    const signString = `${requestMethod}\n${requestUri}\n${timestamp}\n${nonceStr}\n${merchantCode}\n${body}\n`;
    const formattedPrivateKey = formatPrivateKey(kpayApiKey);

    const sha256withrsa = new jsrsasign.KJUR.crypto.Signature({
      alg: "SHA256withRSA",
    });

    sha256withrsa.init(formattedPrivateKey);
    sha256withrsa.updateString(signString);

    return jsrsasign.hextob64(sha256withrsa.sign());
  } catch (error) {
    console.error("Signature generation failed:", error);
    throw new Error("Failed to generate signature");
  }
};

export const generateTimestampAndNonce = () => ({
  timestamp: Date.now(),
  nonceStr: Math.random().toString(36).substring(2, 34),
});

export const createCheckoutUrl = (
  baseUrl: string,
  managedOrderNo: string,
  merchantCode: string,
  nonceStr: string,
  timestamp: number,
  signature: string
): string => {
  const params = new URLSearchParams({
    managedOrderNo,
    "K-Merchant-Code": merchantCode,
    "K-Nonce-Str": nonceStr,
    "K-Timestamp": timestamp.toString(),
    "K-Signature": signature,
  });

  return `${baseUrl}?${params.toString()}`;
};
