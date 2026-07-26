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
