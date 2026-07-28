import crypto from "crypto";

export const generateEsewaSignature = (
  totalAmount: number | string,
  transactionUuid: string,
  productCode: string,
  secretKey: string
): string => {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(message);
  return hmac.digest("base64");
};

export const decodeEsewaCallback = (base64Data: string): Record<string, any> => {
  const decodedStr = Buffer.from(base64Data, "base64").toString("utf-8");
  return JSON.parse(decodedStr);
};

export const verifyEsewaSignature = (
  decodedPayload: Record<string, any>,
  secretKey: string
): boolean => {
  if (!decodedPayload || !decodedPayload.signed_field_names || !decodedPayload.signature) {
    return false;
  }

  const fieldNames: string[] = decodedPayload.signed_field_names.split(",");
  const message = fieldNames
    .map((field) => `${field}=${decodedPayload[field] ?? ""}`)
    .join(",");

  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(message);
  const calculatedSignature = hmac.digest("base64");

  return calculatedSignature === decodedPayload.signature;
};
