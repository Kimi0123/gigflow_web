export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing in environment variables");
  }

  return secret;
};

export const getJwtExpiresIn = (): string =>
  process.env.JWT_EXPIRES_IN || "7d";

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

export const getSmtpConfig = (): SmtpConfig => {
  const host = process.env.SMTP_HOST || process.env.SMPT_HOST || "smtp.gmail.com";
  const port = parseInt(
    process.env.SMTP_PORT || process.env.SMPT_PORT || "587",
    10,
  );
  const user = process.env.SMTP_USER || process.env.SMPT_USER;
  const pass = process.env.SMTP_PASS || process.env.SMPT_PASS;

  if (!user) {
    throw new Error("SMTP_USER is missing in environment variables");
  }

  if (!pass) {
    throw new Error("SMTP_PASS is missing in environment variables");
  }

  return { host, port, user, pass };
};

export const getClientUrl = (): string =>
  process.env.CLIENT_URL || "http://localhost:3005";

export const getGeminiApiKey = (): string => {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error("GEMINI_API_KEY is missing in environment variables");
  }

  return key;
};

export interface EsewaConfig {
  productCode: string;
  secretKey: string;
  gatewayUrl: string;
  statusUrl: string;
}

export const getEsewaConfig = (): EsewaConfig => {
  const productCode = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
  const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
  const gatewayUrl =
    process.env.ESEWA_GATEWAY_URL || "https://rc-epay.esewa.com.np";
  const statusUrl =
    process.env.ESEWA_STATUS_URL || "https://rc.esewa.com.np";

  if (!productCode) {
    throw new Error("ESEWA_PRODUCT_CODE is missing in environment variables");
  }
  if (!secretKey) {
    throw new Error("ESEWA_SECRET_KEY is missing in environment variables");
  }

  return { productCode, secretKey, gatewayUrl, statusUrl };
};

export interface FirebaseConfig {
  serviceAccountPath: string;
}

export const getFirebaseConfig = (): FirebaseConfig => {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "";
  return { serviceAccountPath };
};

