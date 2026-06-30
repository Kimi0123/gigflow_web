const apiBaseUrl = "/api/proxy";

export type AdminUserRole = "freelancer" | "client" | "admin";

export type AdminUser = {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: AdminUserRole;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminUsersMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ApiFieldError = {
  field: string;
  message: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: AdminUsersMeta;
  errors?: ApiFieldError[];
};

export type AdminUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: AdminUserRole;
  password?: string;
};

export class AdminUsersApiError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

const parseFieldErrors = (errors?: ApiFieldError[]) =>
  errors?.reduce<Record<string, string>>((acc, error) => {
    acc[error.field] = error.message;
    return acc;
  }, {}) || {};

const request = async <T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok) {
    throw new AdminUsersApiError(
      result.message || "Request failed",
      parseFieldErrors(result.errors),
    );
  }

  return result;
};

export const listAdminUsersApi = async ({
  token,
  page,
  limit,
  search,
}: {
  token: string;
  page: number;
  limit: number;
  search: string;
}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search.trim()) params.set("search", search.trim());

  const response = await request<AdminUser[]>(`/admin/users?${params.toString()}`, token);

  return {
    data: response.data,
    meta:
      response.meta ||
      ({ page, limit, total: response.data.length, totalPages: 1 } satisfies AdminUsersMeta),
  };
};

export const createAdminUserApi = async (payload: AdminUserPayload, token: string) => {
  return request<AdminUser>("/admin/users", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateAdminUserApi = async (
  userId: string,
  payload: AdminUserPayload,
  token: string,
) => {
  const body = { ...payload };
  if (!body.password) delete body.password;

  return request<AdminUser>(`/admin/users/${userId}`, token, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
};

export const deleteAdminUserApi = async (userId: string, token: string) => {
  return request<{ id: string }>(`/admin/users/${userId}`, token, {
    method: "DELETE",
  });
};
