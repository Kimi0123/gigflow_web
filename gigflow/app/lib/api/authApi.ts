import type { LoginFormValues, RegisterFormValues } from "../validations/auth";

const apiBaseUrl = "/api/proxy";

type ApiFieldError = {
  field: string;
  message: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: ApiFieldError[];
};

export type AuthUser = {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
  role: "freelancer" | "client" | "admin";
  profilePicture?: string;
  averageRating?: number;
  totalReviews?: number;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export class AuthApiError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

const request = async <T>(
  path: string,
  body: Record<string, unknown> | FormData,
  token?: string,
  method = "POST"
): Promise<ApiResponse<T>> => {
  const isFormData = body instanceof FormData;
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: isFormData ? body : JSON.stringify(body),
  });

  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok) {
    const fieldErrors =
      result.errors?.reduce<Record<string, string>>((acc, error) => {
        acc[error.field] = error.message;
        return acc;
      }, {}) || {};

    throw new AuthApiError(result.message || "Request failed", fieldErrors);
  }

  return result;
};

export const resolveAssetUrl = (url?: string | null) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${apiBaseUrl}${url.startsWith("/") ? url : `/${url}`}`;
};

const getRequest = async <T>(
  path: string,
  token: string
): Promise<ApiResponse<T>> => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok) {
    throw new AuthApiError(result.message || "Request failed");
  }

  return result;
};

export const registerUserApi = async (values: RegisterFormValues) => {
  const [firstName, ...rest] = values.fullName.trim().split(/\s+/);
  return request<AuthUser>("/auth/register", {
    firstName,
    lastName: rest.join(" ") || firstName,
    email: values.email,
    phoneNumber: values.phoneNumber,
    role: values.role,
    password: values.password,
  });
};

export const loginUserApi = async (values: LoginFormValues) => {
  return request<LoginResponse>("/auth/login", {
    email: values.email,
    password: values.password,
  });
};

export const getCurrentUserApi = async (token: string) => {
  return getRequest<AuthUser>("/auth/whoami", token);
};

export const updateProfileApi = async (formData: FormData, token: string) => {
  return request<AuthUser>("/auth/update", formData, token, "PATCH");
};

export const updatePasswordApi = async (
  values: Record<string, string>,
  token: string
) => {
  return request<AuthUser>("/auth/update/password", values, token, "PATCH");
};

