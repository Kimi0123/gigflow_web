// Payment API client — mirrors contractApi.ts fetch/error-handling style exactly

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
export type TransactionType = "fund" | "release" | "refund";

export interface Transaction {
  id: string;
  _id: string;
  contract: string;
  from: string | null;
  to: string | null;
  amount: number;
  type: TransactionType;
  createdAt: string;
}

export interface WalletSummary {
  balance: number;
  transactions: Transaction[];
}

export interface FundContractResult {
  contract: {
    id: string;
    isFunded: boolean;
    agreedAmount: number;
    status: string;
  };
  walletBalance: number;
}

// ─── Payment API ──────────────────────────────────────────────────────────────
export const paymentApi = {
  getWallet: (token: string) =>
    get<WalletSummary>("/payments/wallet/me", token),

  fundContract: (token: string, contractId: string) =>
    post<FundContractResult>(`/payments/contracts/${contractId}/fund`, {}, token),
};

export { ApiError };
