// Contract API client — follows the same fetch/error-handling pattern as jobApi.ts

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

const patch = <T>(path: string, body: unknown, token: string) =>
  request<T>(path, { method: "PATCH", body: JSON.stringify(body) }, token);

// ─── Types ────────────────────────────────────────────────────────────────────
export type ContractStatus = "active" | "completed" | "cancelled";

export interface Contract {
  id: string;
  _id: string;
  jobId: string;
  jobTitle: string;
  clientId: string;
  clientName: string;
  clientInitials: string;
  clientProfilePicture?: string;
  freelancerId: string;
  freelancerName: string;
  freelancerInitials: string;
  freelancerProfilePicture?: string;
  agreedAmount: number;
  status: ContractStatus;
  isFunded: boolean;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
}

// ─── Contract API ─────────────────────────────────────────────────────────────
export const contractApi = {
  getClientContracts: (token: string) =>
    get<Contract[]>("/contracts/client/my-contracts", token),

  getFreelancerContracts: (token: string) =>
    get<Contract[]>("/contracts/freelancer/my-contracts", token),

  completeContract: (token: string, contractId: string) =>
    patch<Contract>(`/contracts/${contractId}/complete`, {}, token),
};

export { ApiError };
