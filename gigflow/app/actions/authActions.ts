import { z } from "zod";
import {
  AuthApiError,
  loginUserApi,
  registerUserApi,
  type LoginResponse,
} from "../lib/api/authApi";
import {
  loginSchema,
  registerSchema,
  type LoginFormValues,
  type RegisterFormValues,
} from "../lib/validations/auth";

type ActionResult<T> =
  | {
      ok: true;
      message: string;
      data: T;
    }
  | {
      ok: false;
      message: string;
      fieldErrors: Record<string, string>;
    };

const zodFieldErrors = (error: z.ZodError) => {
  return error.issues.reduce<Record<string, string>>((acc, issue) => {
    const field = issue.path.join(".");
    if (field && !acc[field]) {
      acc[field] = issue.message;
    }
    return acc;
  }, {});
};

export const registerAction = async (
  values: RegisterFormValues
): Promise<ActionResult<unknown>> => {
  const parsed = registerSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  try {
    const response = await registerUserApi(parsed.data);

    return {
      ok: true,
      message: response.message,
      data: response.data,
    };
  } catch (error) {
    if (error instanceof AuthApiError) {
      return {
        ok: false,
        message: error.message,
        fieldErrors: error.fieldErrors,
      };
    }

    return {
      ok: false,
      message: "Unable to create account. Please try again.",
      fieldErrors: {},
    };
  }
};

export const loginAction = async (
  values: LoginFormValues
): Promise<ActionResult<LoginResponse>> => {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  try {
    const response = await loginUserApi(parsed.data);

    return {
      ok: true,
      message: response.message,
      data: response.data,
    };
  } catch (error) {
    if (error instanceof AuthApiError) {
      return {
        ok: false,
        message: error.message,
        fieldErrors: error.fieldErrors,
      };
    }

    return {
      ok: false,
      message: "Unable to log in. Please try again.",
      fieldErrors: {},
    };
  }
};
