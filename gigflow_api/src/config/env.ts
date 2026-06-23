export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing in environment variables");
  }

  return secret;
};

export const getJwtExpiresIn = (): string =>
  process.env.JWT_EXPIRES_IN || "7d";
