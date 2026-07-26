// All job & proposal API calls — proxied through Next.js /api/proxy

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
  constructor(msg: string, status: number, errors?: { field: string; message: string }[]) {
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
  const isFormData = options.body instanceof FormData;
  const headers = new Headers({
    Authorization: `Bearer ${token}`,
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
  });

  const res = await fetch(`${apiBase}${path}`, { ...options, headers });
  const body = (await res.json()) as ApiResponse<T>;

  if (!res.ok) {
    throw new ApiError(body.message || "Request failed", res.status, body.errors);
  }
  return body.data;
}

const get = <T>(path: string, token: string) =>
  request<T>(path, { method: "GET" }, token);

const post = <T>(path: string, body: unknown, token: string) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body) }, token);

const patch = <T>(path: string, body: unknown, token: string) =>
  request<T>(path, { method: "PATCH", body: JSON.stringify(body) }, token);

const del = <T>(path: string, token: string) =>
  request<T>(path, { method: "DELETE" }, token);

// ─── Types ────────────────────────────────────────────────────────────────────
export type JobStatus = "open" | "closed" | "draft" | "in-progress";
export type BudgetType = "fixed" | "hourly";
export type ProposalStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface Job {
  id: string;
  _id: string;
  title: string;
  description: string;
  category: string;
  budgetType: BudgetType;
  budgetMin: number;
  budgetMax?: number;
  budget: string;
  skills: string[];
  duration: string;
  status: JobStatus;
  proposalCount: number;
  client: { id: string; name: string; initials: string };
  postedAt: string;
  createdAt: string;
}

export interface Proposal {
  id: string;
  _id: string;
  jobId: string;
  jobTitle: string;
  bidAmount: number;
  coverLetter: string;
  deliveryTime: string;
  status: ProposalStatus;
  submittedAt: string;
  createdAt: string;
  budget?: string;
  freelancer?: {
    id: string;
    name: string;
    initials: string;
    email: string;
    profilePicture?: string;
  };
}

export interface JobsPage {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ClientStats {
  totalJobs: number;
  activeJobs: number;
  closedJobs: number;
  totalProposals: number;
  hired: number;
}

export interface FreelancerStats {
  activeProposals: number;
  jobsWon: number;
  totalRejected: number;
}

export interface PostJobPayload {
  title: string;
  description: string;
  category: string;
  budgetType: BudgetType;
  budgetMin: number;
  budgetMax?: number;
  skills: string[];
  duration: string;
  status: "open" | "draft";
}

export type UpdateJobPayload = Partial<Omit<PostJobPayload, "status">> & {
  status?: JobStatus;
};

export interface SubmitProposalPayload {
  coverLetter: string;
  bidAmount: number;
  deliveryTime: string;
}

// ─── Job API ──────────────────────────────────────────────────────────────────
export const jobApi = {
  // Browse open jobs (freelancer feed)
  browse: (token: string, params?: {
    category?: string;
    budgetType?: string;
    skills?: string;
    search?: string;
    page?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.category && params.category !== "All") qs.set("category", params.category);
    if (params?.budgetType && params.budgetType !== "All projects") qs.set("budgetType", params.budgetType);
    if (params?.skills) qs.set("skills", params.skills);
    if (params?.search) qs.set("search", params.search);
    if (params?.page) qs.set("page", String(params.page));
    const query = qs.toString() ? `?${qs.toString()}` : "";
    return get<JobsPage>(`/jobs${query}`, token);
  },

  // Client: get own posted jobs
  myJobs: (token: string) => get<Job[]>("/jobs/client/my-jobs", token),

  // Client: stats
  clientStats: (token: string) => get<ClientStats>("/jobs/client/stats", token),

  // Client: post a job
  post: (token: string, payload: PostJobPayload) => post<Job>("/jobs", payload, token),

  // Client: update job
  update: (token: string, jobId: string, payload: UpdateJobPayload) =>
    patch<Job>(`/jobs/${jobId}`, payload, token),

  // Client: delete job
  delete: (token: string, jobId: string) => del<{ id: string }>(`/jobs/${jobId}`, token),

  // Client: view proposals on a job
  proposals: (token: string, jobId: string) =>
    get<Proposal[]>(`/jobs/${jobId}/proposals`, token),

  // Client: accept or reject a proposal
  updateProposalStatus: (token: string, proposalId: string, status: "accepted" | "rejected") =>
    patch<Proposal>(`/jobs/proposals/${proposalId}/status`, { status }, token),

  // Freelancer: save a job
  save: (token: string, jobId: string) =>
    post<{ jobId: string; saved: boolean }>(`/jobs/${jobId}/save`, {}, token),

  // Freelancer: unsave a job
  unsave: (token: string, jobId: string) =>
    del<{ jobId: string; saved: boolean }>(`/jobs/${jobId}/save`, token),

  // Freelancer: get saved jobs
  savedJobs: (token: string) => get<Job[]>("/jobs/saved/my-jobs", token),
};

// ─── Proposal API ─────────────────────────────────────────────────────────────
export const proposalApi = {
  // Freelancer: submit proposal
  submit: (token: string, jobId: string, payload: SubmitProposalPayload) =>
    post<Proposal>(`/jobs/${jobId}/proposals`, payload, token),

  // Freelancer: get own proposals
  mine: (token: string) => get<Proposal[]>("/jobs/proposals/my-proposals", token),

  // Freelancer: stats
  stats: (token: string) => get<FreelancerStats>("/jobs/proposals/stats", token),

  // Freelancer: withdraw
  withdraw: (token: string, proposalId: string) =>
    patch<{ id: string }>(`/jobs/proposals/${proposalId}/withdraw`, {}, token),
};

export { ApiError };
