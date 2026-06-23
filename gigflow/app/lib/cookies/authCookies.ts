import type { AuthUser } from "../api/authApi";

const authTokenCookie = "gigflow_token";
const authUserCookie = "gigflow_user";

const setCookie = (name: string, value: string, maxAge: number) => {
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${maxAge}; SameSite=Lax`;
};

export const saveAuthSession = (
  token: string,
  user: AuthUser,
  remember: boolean
) => {
  const maxAge = remember ? 60 * 60 * 24 * 7 : 60 * 60 * 24;

  setCookie(authTokenCookie, token, maxAge);
  setCookie(authUserCookie, JSON.stringify(user), maxAge);
};

export const clearAuthSession = () => {
  setCookie(authTokenCookie, "", 0);
  setCookie(authUserCookie, "", 0);
};

export const getSavedUser = (): AuthUser | null => {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${authUserCookie}=`));

  if (!cookie) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(cookie.split("=")[1])) as AuthUser;
  } catch {
    return null;
  }
};

export const getSavedToken = (): string | null => {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${authTokenCookie}=`));

  return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
};
