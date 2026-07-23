// Review API client — follows the same fetch/error-handling pattern as contractApi.ts

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

// ─── Types ────────────────────────────────────────────────────────────────────
export type ReviewerRole = "client" | "freelancer";

export interface Review {
  id: string;
  _id: string;
  contractId: string;
  jobId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerInitials: string;
  reviewerProfilePicture?: string;
  revieweeId: string;
  rating: number;
  comment: string;
  reviewerRole: ReviewerRole;
  createdAt: string;
}

export interface UserRatingSummary {
  averageRating: number;
  totalReviews: number;
}

export interface SubmitReviewPayload {
  rating: number;
  comment: string;
}

export interface PaginatedReviews {
  reviews: Review[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Review API ───────────────────────────────────────────────────────────────
export const reviewApi = {
  getUserReviews: (token: string, userId: string, page = 1, limit = 10) =>
    get<PaginatedReviews>(`/reviews/user/${userId}?page=${page}&limit=${limit}`, token),

  getUserRatingSummary: (token: string, userId: string) =>
    get<UserRatingSummary>(`/reviews/user/${userId}/summary`, token),

  getContractReviews: (token: string, contractId: string) =>
    get<Review[]>(`/reviews/contract/${contractId}`, token),

  submitReview: (token: string, contractId: string, payload: SubmitReviewPayload) =>
    post<Review>(`/reviews/contract/${contractId}`, payload, token),
};

export { ApiError };
