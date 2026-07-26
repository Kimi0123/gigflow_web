import { ContractModel } from "../models/contract.model";
import { JobModel } from "../models/job.model";
import { ReviewModel } from "../models/review.model";
import { UserModel } from "../models/user.model";

// ─── Platform Overview ────────────────────────────────────────────────────────

export const getPlatformOverview = async () => {
  const [
    totalUsers,
    totalClients,
    totalFreelancers,
    totalJobs,
    jobsByStatusRaw,
    totalContracts,
    contractsByStatusRaw,
    totalReviews,
    ratingAgg,
    completedValueAgg,
  ] = await Promise.all([
    UserModel.countDocuments(),
    UserModel.countDocuments({ role: "client" }),
    UserModel.countDocuments({ role: "freelancer" }),
    JobModel.countDocuments(),
    JobModel.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    ContractModel.countDocuments(),
    ContractModel.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    ReviewModel.countDocuments(),
    ReviewModel.aggregate<{ avgRating: number }>([
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]),
    ContractModel.aggregate<{ total: number }>([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$agreedAmount" } } },
    ]),
  ]);

  const jobsByStatus = {
    open: 0,
    inProgress: 0,
    closed: 0,
    draft: 0,
  };
  for (const entry of jobsByStatusRaw) {
    if (entry._id === "open") jobsByStatus.open = entry.count;
    else if (entry._id === "in-progress") jobsByStatus.inProgress = entry.count;
    else if (entry._id === "closed") jobsByStatus.closed = entry.count;
    else if (entry._id === "draft") jobsByStatus.draft = entry.count;
  }

  const contractsByStatus = { active: 0, completed: 0, cancelled: 0 };
  for (const entry of contractsByStatusRaw) {
    if (entry._id === "active") contractsByStatus.active = entry.count;
    else if (entry._id === "completed") contractsByStatus.completed = entry.count;
    else if (entry._id === "cancelled") contractsByStatus.cancelled = entry.count;
  }

  const platformAverageRating =
    ratingAgg.length > 0
      ? Math.round((ratingAgg[0].avgRating ?? 0) * 100) / 100
      : 0;

  const totalCompletedValue =
    completedValueAgg.length > 0 ? completedValueAgg[0].total : 0;

  return {
    totalUsers,
    totalClients,
    totalFreelancers,
    totalJobs,
    jobsByStatus,
    totalContracts,
    contractsByStatus,
    totalReviews,
    platformAverageRating,
    totalCompletedValue,
  };
};

// ─── Growth Trends (last ~12 weeks) ──────────────────────────────────────────

interface WeekBucket {
  weekStart: string;
  count: number;
}

interface WeekAggResult {
  _id: { year: number; week: number };
  weekStart: Date;
  count: number;
}

const twelveWeeksAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 84); // 12 * 7
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getGrowthTrends = async () => {
  const since = twelveWeeksAgo();

  const weekGroupStage = (dateField: string) => ({
    $group: {
      _id: {
        year: { $isoWeekYear: `$${dateField}` },
        week: { $isoWeek: `$${dateField}` },
      },
      weekStart: { $min: `$${dateField}` },
      count: { $sum: 1 },
    },
  });

  const sortStage = { $sort: { "_id.year": 1, "_id.week": 1 } as Record<string, 1 | -1> };

  const [rawUsers, rawJobs, rawContracts] = await Promise.all([
    UserModel.aggregate<WeekAggResult>([
      { $match: { createdAt: { $gte: since } } },
      weekGroupStage("createdAt"),
      sortStage,
    ]),
    JobModel.aggregate<WeekAggResult>([
      { $match: { createdAt: { $gte: since } } },
      weekGroupStage("createdAt"),
      sortStage,
    ]),
    ContractModel.aggregate<WeekAggResult>([
      { $match: { status: "completed", completedAt: { $gte: since } } },
      weekGroupStage("completedAt"),
      sortStage,
    ]),
  ]);

  const toSeries = (raw: WeekAggResult[]): WeekBucket[] =>
    raw.map((r) => ({
      weekStart: new Date(r.weekStart).toISOString().split("T")[0],
      count: r.count,
    }));

  return {
    newUsersByWeek: toSeries(rawUsers),
    newJobsByWeek: toSeries(rawJobs),
    completedContractsByWeek: toSeries(rawContracts),
  };
};

// ─── Recent Activity ──────────────────────────────────────────────────────────

export const getRecentActivity = async () => {
  const [recentJobsDocs, recentContractsDocs] = await Promise.all([
    JobModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate<{ client: { firstName: string; lastName: string } }>(
        "client",
        "firstName lastName"
      )
      .lean(),

    ContractModel.find({ status: "completed" })
      .sort({ completedAt: -1 })
      .limit(5)
      .populate<{ job: { title: string } }>("job", "title")
      .populate<{ client: { firstName: string; lastName: string } }>(
        "client",
        "firstName lastName"
      )
      .populate<{ freelancer: { firstName: string; lastName: string } }>(
        "freelancer",
        "firstName lastName"
      )
      .lean(),
  ]);

  const recentJobs = recentJobsDocs.map((j) => ({
    id: j._id,
    title: j.title,
    clientName: j.client
      ? `${j.client.firstName} ${j.client.lastName}`
      : "Unknown",
    status: j.status,
    createdAt: j.createdAt,
  }));

  const recentContracts = recentContractsDocs.map((c) => ({
    id: c._id,
    jobTitle: c.job ? c.job.title : "Unknown",
    freelancerName: c.freelancer
      ? `${c.freelancer.firstName} ${c.freelancer.lastName}`
      : "Unknown",
    clientName: c.client
      ? `${c.client.firstName} ${c.client.lastName}`
      : "Unknown",
    agreedAmount: c.agreedAmount,
    completedAt: c.completedAt,
  }));

  return { recentJobs, recentContracts };
};
