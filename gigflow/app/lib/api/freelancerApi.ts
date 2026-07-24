// Freelancer / Public Profile API client
// Follows the same fetch/error-handling pattern as reviewApi.ts

import { resolveAssetUrl } from "./authApi";

export { resolveAssetUrl };

const apiBase = "/api/proxy";

class ApiError extends Error {
  status: number;
  constructor(msg: string, status: number) {
    super(msg);
    this.status = status;
  }
}

async function get<T>(path: string, token?: string | null): Promise<T> {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${apiBase}${path}`, { method: "GET", headers });
  const body = await res.json();

  if (!res.ok) {
    throw new ApiError(body.message || "Request failed", res.status);
  }
  return body.data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FreelancerProfile {
  id: string;
  firstName: string;
  lastName: string;
  initials: string;
  profilePicture?: string;
  bio?: string;
  title?: string;
  skills: string[];
  cvUrl?: string;
  role: string;
  createdAt: string;
  completedContractsCount: number;
  averageRating: number;
  totalReviews: number;
}

export interface PaginatedFreelancers {
  freelancers: FreelancerProfile[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ListFreelancersParams {
  search?: string;
  page?: number;
  limit?: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const freelancerApi = {
  listFreelancers: (
    token: string | null | undefined,
    { search = "", page = 1, limit = 12 }: ListFreelancersParams = {}
  ) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", String(page));
    params.set("limit", String(limit));
    return get<PaginatedFreelancers>(`/users/freelancers?${params.toString()}`, token);
  },

  getPublicProfile: (token: string | null | undefined, userId: string) =>
    get<FreelancerProfile>(`/users/${userId}/public-profile`, token),
};

export { ApiError };
