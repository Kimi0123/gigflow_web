// Message API client — follows the same pattern as contractApi.ts

const apiBase = "/api/proxy";

class ApiError extends Error {
  status: number;
  constructor(msg: string, status: number) {
    super(msg);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit, token: string): Promise<T> {
  const headers = new Headers({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });
  const res = await fetch(`${apiBase}${path}`, { ...options, headers });
  const body = await res.json();
  if (!res.ok) {
    throw new ApiError(body.message || "Request failed", res.status);
  }
  return body.data as T;
}

const get = <T>(path: string, token: string) =>
  request<T>(path, { method: "GET" }, token);

const post = <T>(path: string, body: unknown, token: string) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body) }, token);

const patch = <T>(path: string, body: unknown, token: string) =>
  request<T>(path, { method: "PATCH", body: JSON.stringify(body) }, token);

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Message {
  id: string;
  contractId: string;
  senderId: string;
  senderName: string;
  senderInitials: string;
  senderProfilePicture?: string;
  content: string;
  readAt: string | null;
  createdAt: string;
}

export interface MessagePagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MessagesResponse {
  messages: Message[];
  pagination: MessagePagination;
}

// ─── Message API ─────────────────────────────────────────────────────────────
export const messageApi = {
  getContractMessages: (token: string, contractId: string, page = 1, limit = 20) =>
    get<MessagesResponse>(`/messages/contract/${contractId}?page=${page}&limit=${limit}`, token),

  getUnreadCount: (token: string) =>
    get<{ unreadCount: number }>("/messages/unread-count", token),

  markMessagesRead: (token: string, contractId: string) =>
    patch<{ message: string }>(`/messages/contract/${contractId}/read`, {}, token),

  // REST fallback for when socket isn't connected
  sendMessageRest: (token: string, contractId: string, content: string) =>
    post<Message>(`/messages/contract/${contractId}`, { content }, token),
};

export { ApiError };
