"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../providers/AuthContext";
import {
  getOverviewApi,
  getRecentActivityApi,
  getTrendsApi,
  type GrowthTrends,
  type PlatformOverview,
  type RecentActivity,
  type TrendBucket,
} from "../../lib/api/adminAnalyticsApi";

export default function AdminAnalyticsPage() {
  const { token } = useAuth();

  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [trends, setTrends] = useState<GrowthTrends | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError("");

    try {
      const [overviewData, trendsData, activityData] = await Promise.all([
        getOverviewApi(token),
        getTrendsApi(token),
        getRecentActivityApi(token),
      ]);

      setOverview(overviewData);
      setTrends(trendsData);
      setRecentActivity(activityData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="p-5 lg:p-8 space-y-6">
        <div className="border-b border-[#e1e8f0] bg-white p-5">
          <div className="h-7 w-48 animate-pulse rounded bg-[#f1f5f9]" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border border-[#dfe7f0] bg-white p-5">
              <div className="h-4 w-20 animate-pulse rounded bg-[#f1f5f9]" />
              <div className="mt-3 h-8 w-16 animate-pulse rounded bg-[#f1f5f9]" />
              <div className="mt-2 h-3 w-32 animate-pulse rounded bg-[#f1f5f9]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 lg:p-8">
        <div className="border border-[#f0c7c7] bg-[#fff5f5] p-5 text-[14px] font-semibold text-[#a93c3c]">
          {error}
          <button
            onClick={() => void loadData()}
            className="ml-4 text-[12px] font-bold text-[#111d31] underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-[#e1e8f0] bg-white px-5 py-4 lg:px-8">
        <h1 className="text-[24px] font-black tracking-[0.02em]">Analytics Dashboard</h1>
      </div>

      <div className="p-5 space-y-8 lg:p-8">
        {/* Stat Cards Row */}
        {overview && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              label="Total Users"
              value={overview.totalUsers.toLocaleString()}
              subtitle={`${overview.totalClients} Clients · ${overview.totalFreelancers} Freelancers`}
              bgColor="#e0f7ff"
              color="#0284c7"
            />
            <StatCard
              label="Total Jobs"
              value={overview.totalJobs.toLocaleString()}
              subtitle={`${overview.jobsByStatus.open} Open · ${overview.jobsByStatus.inProgress} In-Progress · ${overview.jobsByStatus.closed} Closed`}
              bgColor="#fef3c7"
              color="#d97706"
            />
            <StatCard
              label="Total Contracts"
              value={overview.totalContracts.toLocaleString()}
              subtitle={`${overview.contractsByStatus.active} Active · ${overview.contractsByStatus.completed} Completed`}
              bgColor="#ede9fe"
              color="#6d28d9"
            />
            <StatCard
              label="Total Reviews"
              value={overview.totalReviews.toLocaleString()}
              subtitle={`⭐ ${overview.platformAverageRating.toFixed(2)} Avg Rating`}
              bgColor="#dcfce7"
              color="#15803d"
            />
            <StatCard
              label="Completed Revenue"
              value={`Rs. ${overview.totalCompletedValue.toLocaleString()}`}
              subtitle="Total Agreed Value"
              bgColor="#fef2f2"
              color="#b91c1c"
            />
          </div>
        )}

        {/* 12-Week Growth Trends */}
        {trends && (
          <div className="space-y-4">
            <h2 className="text-[18px] font-black text-[#111d31]">
              12-Week Growth Trends
            </h2>
            <div className="grid gap-6 lg:grid-cols-3">
              <BarChartCard
                title="New Users / Week"
                data={trends.newUsersByWeek}
                barColor="#38bdf8"
              />
              <BarChartCard
                title="New Jobs / Week"
                data={trends.newJobsByWeek}
                barColor="#f59e0b"
              />
              <BarChartCard
                title="Completed Contracts / Week"
                data={trends.completedContractsByWeek}
                barColor="#22c55e"
              />
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {recentActivity && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Jobs */}
            <div className="overflow-hidden border border-[#dfe7f0] bg-white">
              <div className="border-b border-[#e8edf3] px-5 py-4">
                <h3 className="text-[16px] font-black text-[#111d31]">
                  Recent Jobs Posted
                </h3>
              </div>
              <div className="divide-y divide-[#edf2f6]">
                {recentActivity.recentJobs.length === 0 ? (
                  <p className="p-5 text-center text-[13px] font-medium text-[#70829d]">
                    No recent jobs.
                  </p>
                ) : (
                  recentActivity.recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 transition hover:bg-[#fafcff]"
                    >
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="truncate text-[14px] font-bold text-[#111d31]">
                          {job.title}
                        </p>
                        <p className="text-[12px] text-[#70829d]">
                          Client: {job.clientName}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3 text-right">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            job.status === "open"
                              ? "bg-[#e0f7ff] text-[#0369a1]"
                              : job.status === "in-progress"
                              ? "bg-[#fef3c7] text-[#92400e]"
                              : "bg-[#f1f5f9] text-[#475569]"
                          }`}
                        >
                          {job.status}
                        </span>
                        <span className="text-[11px] font-semibold text-[#94a3b8]">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Completed Contracts */}
            <div className="overflow-hidden border border-[#dfe7f0] bg-white">
              <div className="border-b border-[#e8edf3] px-5 py-4">
                <h3 className="text-[16px] font-black text-[#111d31]">
                  Recent Completed Contracts
                </h3>
              </div>
              <div className="divide-y divide-[#edf2f6]">
                {recentActivity.recentContracts.length === 0 ? (
                  <p className="p-5 text-center text-[13px] font-medium text-[#70829d]">
                    No completed contracts yet.
                  </p>
                ) : (
                  recentActivity.recentContracts.map((contract) => (
                    <div
                      key={contract.id}
                      className="flex items-center justify-between p-4 transition hover:bg-[#fafcff]"
                    >
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="truncate text-[14px] font-bold text-[#111d31]">
                          {contract.jobTitle}
                        </p>
                        <p className="text-[12px] text-[#70829d]">
                          Client: {contract.clientName} · Freelancer:{" "}
                          {contract.freelancerName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[14px] font-black text-[#15803d]">
                          Rs. {contract.agreedAmount.toLocaleString()}
                        </p>
                        {contract.completedAt && (
                          <p className="text-[11px] font-semibold text-[#94a3b8]">
                            {new Date(contract.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stat Card Component ──────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  subtitle,
  bgColor,
  color,
}: {
  label: string;
  value: string;
  subtitle: string;
  bgColor: string;
  color: string;
}) {
  return (
    <div className="border border-[#dfe7f0] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6f8099]">
          {label}
        </p>
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <p className="mt-2 text-[26px] font-black text-[#111d31] leading-none">
        {value}
      </p>
      <p className="mt-2 text-[11px] font-semibold text-[#70829d] truncate">
        {subtitle}
      </p>
    </div>
  );
}

// ─── Bar Chart Component ──────────────────────────────────────────────────────
function BarChartCard({
  title,
  data,
  barColor,
}: {
  title: string;
  data: TrendBucket[];
  barColor: string;
}) {
  const maxVal = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="border border-[#dfe7f0] bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-[14px] font-extrabold text-[#111d31]">{title}</h3>
      {data.length === 0 ? (
        <p className="py-8 text-center text-[12px] text-[#94a3b8]">
          No data recorded yet
        </p>
      ) : (
        <div className="flex h-36 items-end gap-1.5 pt-4">
          {data.map((item, idx) => {
            const heightPercent = Math.max(8, (item.count / maxVal) * 100);
            return (
              <div
                key={idx}
                className="group relative flex flex-1 flex-col items-center h-full justify-end"
              >
                {/* Tooltip on hover */}
                <div className="pointer-events-none absolute -top-8 hidden rounded bg-[#111d31] px-2 py-1 text-[10px] font-bold text-white group-hover:block z-10 whitespace-nowrap">
                  {item.count} ({item.weekStart})
                </div>

                {/* Bar */}
                <div
                  className="w-full rounded-t transition-all group-hover:opacity-80"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: barColor,
                  }}
                />

                {/* Count text */}
                <span className="mt-1 text-[9px] font-bold text-[#6f8099]">
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
