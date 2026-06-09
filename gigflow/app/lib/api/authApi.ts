import type { LoginFormValues, RegisterFormValues } from "../validations/auth";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
  fullName: string;
  email: string;
  role: "freelancer" | "client";
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
  body: Record<string, unknown>
): Promise<ApiResponse<T>> => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
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

export const registerUserApi = async (values: RegisterFormValues) => {
  return request<AuthUser>("/auth/register", {
    fullName: values.fullName,
    email: values.email,
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
