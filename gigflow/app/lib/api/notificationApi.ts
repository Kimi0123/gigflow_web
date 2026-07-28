const apiBase = "/api/proxy";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: { field: string; message: string }[];
};

class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;
  constructor(
    msg: string,
    status: number,
    errors?: { field: string; message: string }[]
  ) {
    super(msg);
    this.status = status;
    this.fieldErrors = (errors ?? []).reduce<Record<string, string>>((acc, e) => {
      acc[e.field] = e.message;
      return acc;
    }, {});
  }
}

async function request<T>(
  path: string,
  options: RequestInit,
  token: string
): Promise<T> {
  const headers = new Headers({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });

  const res = await fetch(`${apiBase}${path}`, { ...options, headers });
  const body = (await res.json()) as ApiResponse<T>;

  if (!res.ok) {
    throw new ApiError(body.message || "Request failed", res.status, body.errors);
  }
  return body.data;
}

export type NotificationType =
  | "proposal_received"
  | "proposal_accepted"
  | "proposal_rejected"
  | "new_message"
  | "contract_completed"
  | "review_received";

export type NotificationModel = {
  _id: string;
  id: string;
  recipient: string;
  type: NotificationType;
  message: string;
  relatedId?: string | null;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};

export const notificationApi = {
  getNotifications: (token: string, limit = 20) =>
    request<NotificationModel[]>(`/notifications?limit=${limit}`, { method: "GET" }, token),

  getUnreadCount: (token: string) =>
    request<{ unreadCount: number }>("/notifications/unread-count", { method: "GET" }, token),

  markAsRead: (token: string, id: string) =>
    request<NotificationModel>(`/notifications/${id}/read`, { method: "PATCH" }, token),

  markAllAsRead: (token: string) =>
    request<{ message: string }>("/notifications/read-all", { method: "PATCH" }, token),
};
