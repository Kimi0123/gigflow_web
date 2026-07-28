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
export type TransactionType = "fund" | "release" | "refund" | "topup" | "withdraw";

export interface Transaction {
  id: string;
  _id: string;
  contract: string | null;
  from: string | null;
  to: string | null;
  amount: number;
  type: TransactionType;
  status?: string;
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

export interface EsewaFormFields {
  amount: number;
  tax_amount: number;
  total_amount: number;
  transaction_uuid: string;
  product_code: string;
  product_service_charge: number;
  product_delivery_charge: number;
  success_url: string;
  failure_url: string;
  signed_field_names: string;
  signature: string;
  gatewayUrl: string;
}

export interface VerifyTopupResult {
  balance: number;
  transaction: Transaction;
}

export interface WithdrawResult {
  balance: number;
  transaction: Transaction;
}

// ─── Payment API ──────────────────────────────────────────────────────────────
export const paymentApi = {
  getWallet: (token: string) =>
    get<WalletSummary>("/payments/wallet/me", token),

  fundContract: (token: string, contractId: string) =>
    post<FundContractResult>(`/payments/contracts/${contractId}/fund`, {}, token),

  mockTopup: (token: string, amount: number) =>
    post<{ balance: number; transaction: Transaction }>("/payments/topup", { amount }, token),

  initiateTopup: (token: string, amount: number) =>
    post<EsewaFormFields>("/payments/topup/initiate", { amount }, token),

  verifyTopup: async (data: string) => {
    const res = await fetch(`${apiBase}/payments/topup/verify?data=${encodeURIComponent(data)}`);
    const body = await res.json();
    if (!res.ok) {
      throw new ApiError(body.message || "Verification failed", res.status);
    }
    return body.data as VerifyTopupResult;
  },

  withdraw: (token: string, amount: number) =>
    post<WithdrawResult>("/payments/withdraw", { amount }, token),
};

export { ApiError };
