const apiBaseUrl = "/api/proxy";

export type PlatformOverview = {
  totalUsers: number;
  totalClients: number;
  totalFreelancers: number;
  totalJobs: number;
  jobsByStatus: {
    open: number;
    inProgress: number;
    closed: number;
    draft: number;
  };
  totalContracts: number;
  contractsByStatus: {
    active: number;
    completed: number;
    cancelled: number;
  };
  totalReviews: number;
  platformAverageRating: number;
  totalCompletedValue: number;
};

export type TrendBucket = {
  weekStart: string;
  count: number;
};

export type GrowthTrends = {
  newUsersByWeek: TrendBucket[];
  newJobsByWeek: TrendBucket[];
  completedContractsByWeek: TrendBucket[];
};

export type RecentJob = {
  id: string;
  title: string;
  clientName: string;
  status: string;
  createdAt: string;
};

export type RecentContract = {
  id: string;
  jobTitle: string;
  freelancerName: string;
  clientName: string;
  agreedAmount: number;
  completedAt?: string;
};

export type RecentActivity = {
  recentJobs: RecentJob[];
  recentContracts: RecentContract[];
};

export class AdminAnalyticsApiError extends Error {
  status: number;
  constructor(message: string, status: number = 400) {
    super(message);
    this.status = status;
  }
}

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const request = async <T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> => {
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
    throw new AdminAnalyticsApiError(
      result.message || "Request failed",
      response.status
    );
  }

  return result.data;
};

export const getOverviewApi = (token: string) =>
  request<PlatformOverview>("/admin/analytics/overview", token);

export const getTrendsApi = (token: string) =>
  request<GrowthTrends>("/admin/analytics/trends", token);

export const getRecentActivityApi = (token: string) =>
  request<RecentActivity>("/admin/analytics/recent-activity", token);

export const deleteJobApi = (token: string, jobId: string) =>
  request<Record<string, unknown>>(`/admin/jobs/${jobId}`, token, {
    method: "DELETE",
  });
