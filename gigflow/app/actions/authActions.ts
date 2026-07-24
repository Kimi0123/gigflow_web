import { z } from "zod";
import {
  AuthApiError,
  loginUserApi,
  registerUserApi,
  updatePasswordApi,
  updateProfileApi,
  type LoginResponse,
  type AuthUser,
} from "../lib/api/authApi";
import {
  loginSchema,
  registerSchema,
  updatePasswordSchema,
  updateProfileSchema,
  type LoginFormValues,
  type RegisterFormValues,
  type UpdatePasswordFormValues,
  type UpdateProfileFormValues,
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

export const updateProfileAction = async (
  values: UpdateProfileFormValues,
  profilePicture: File | null,
  cvFile: File | null,
  token: string
): Promise<ActionResult<AuthUser>> => {
  const parsed = updateProfileSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const formData = new FormData();
  formData.set("firstName", parsed.data.firstName);
  formData.set("lastName", parsed.data.lastName);
  formData.set("phoneNumber", parsed.data.phoneNumber);
  if (parsed.data.bio !== undefined) formData.set("bio", parsed.data.bio);
  if (parsed.data.title !== undefined) formData.set("title", parsed.data.title);
  if (parsed.data.skills !== undefined) formData.set("skills", parsed.data.skills);

  if (profilePicture) formData.set("profilePicture", profilePicture);
  if (cvFile) formData.set("cv", cvFile);

  try {
    const response = await updateProfileApi(formData, token);

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
      message: "Unable to update profile. Please try again.",
      fieldErrors: {},
    };
  }
};

export const updatePasswordAction = async (
  values: UpdatePasswordFormValues,
  token: string
): Promise<ActionResult<AuthUser>> => {
  const parsed = updatePasswordSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  try {
    const response = await updatePasswordApi(parsed.data, token);

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
      message: "Unable to update password. Please try again.",
      fieldErrors: {},
    };
  }
};
