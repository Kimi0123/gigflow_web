import mongoose from "mongoose";
import {
  createJobDto,
  createProposalDto,
  updateJobDto,
  updateProposalStatusDto,
} from "../dtos/job.dto";
import { ErrorCodes } from "../errors/error-codes";
import { HttpError } from "../errors/http-error";
import { ContractModel } from "../models/contract.model";
import { IJobDocument, JobModel } from "../models/job.model";
import { ProposalModel } from "../models/proposal.model";
import { SavedJobModel } from "../models/savedJob.model";
import { UserModel } from "../models/user.model";
import { createNotification } from "./notification.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const formatBudget = (doc: IJobDocument): string => {
  const min = `Rs. ${doc.budgetMin.toLocaleString()}`;
  if (doc.budgetMax && doc.budgetMax > doc.budgetMin) {
    return doc.budgetType === "hourly"
      ? `Rs. ${doc.budgetMin.toLocaleString()} – ${doc.budgetMax.toLocaleString()} / hr`
      : `${min} – ${doc.budgetMax.toLocaleString()}`;
  }
  return doc.budgetType === "hourly" ? `${min} / hr` : min;
};

const timeAgo = (date: Date): string => {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(date).toLocaleDateString();
};

// ─── Job Service ──────────────────────────────────────────────────────────────

export const createJob = async (clientId: string, input: unknown) => {
  const data = createJobDto.parse(input);

  const client = await UserModel.findById(clientId);
  if (!client || client.role !== "client") {
    throw new HttpError(403, "Only clients can post jobs", {
      code: ErrorCodes.AUTH_FORBIDDEN,
    });
  }

  const job = await JobModel.create({ ...data, client: clientId });
  return serializeJob(job, clientId);
};

export const getClientJobs = async (clientId: string) => {
  const jobs = await JobModel.find({ client: clientId }).sort({ createdAt: -1 });
  return jobs.map((j) => serializeJob(j, clientId));
};

export const getOpenJobs = async (query: {
  category?: string;
  budgetType?: string;
  skills?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const filter: Record<string, unknown> = { status: "open" };

  if (query.category && query.category !== "All") {
    filter.category = query.category;
  }
  if (query.budgetType && query.budgetType !== "all") {
    filter.budgetType = query.budgetType;
  }
  if (query.skills) {
    const skillArr = query.skills.split(",").map((s) => s.trim()).filter(Boolean);
    if (skillArr.length > 0) {
      filter.skills = { $in: skillArr };
    }
  }
if (query.search) {
  const safeSearch = escapeRegex(query.search);
  filter.$or = [
    { title: { $regex: safeSearch, $options: "i" } },
    { description: { $regex: safeSearch, $options: "i" } },
    { skills: { $in: [new RegExp(safeSearch, "i")] } },
  ];
}

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const [jobs, total] = await Promise.all([
    JobModel.find(filter)
      .populate("client", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    JobModel.countDocuments(filter),
  ]);

  return {
    jobs: jobs.map((j) => serializeJob(j as IJobDocument, null)),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getJobById = async (jobId: string, requesterId?: string | null) => {
  const job = await JobModel.findById(jobId).populate("client", "firstName lastName profilePicture");
  if (!job) {
    throw new HttpError(404, "Job not found", { code: ErrorCodes.NOT_FOUND });
  }
  return serializeJob(job, requesterId ?? null);
};

export const updateJob = async (clientId: string, jobId: string, input: unknown) => {
  const data = updateJobDto.parse(input);

  const job = await JobModel.findOne({
    _id: jobId,
    client: clientId,
  });

  if (!job) {
    throw new HttpError(404, "Job not found or you do not own it", {
      code: ErrorCodes.NOT_FOUND,
    });
  }

  Object.assign(job, data);
  await job.save();
  return serializeJob(job, clientId);
};

export const deleteJob = async (clientId: string, jobId: string) => {
  const job = await JobModel.findOneAndDelete({
    _id: jobId,
    client: clientId,
  });

  if (!job) {
    throw new HttpError(404, "Job not found or you do not own it", {
      code: ErrorCodes.NOT_FOUND,
    });
  }

  // Remove all proposals for this job
  await ProposalModel.deleteMany({ job: jobId });
  return { id: jobId };
};

export const getClientStats = async (clientId: string) => {
  const [total, active, closed] = await Promise.all([
    JobModel.countDocuments({ client: clientId }),
    JobModel.countDocuments({ client: clientId, status: "open" }),
    JobModel.countDocuments({ client: clientId, status: "closed" }),
  ]);

  const proposalAgg = await ProposalModel.aggregate([
    {
      $lookup: {
        from: "jobs",
        localField: "job",
        foreignField: "_id",
        as: "jobDoc",
      },
    },
    { $unwind: "$jobDoc" },
    {
      $match: {
        "jobDoc.client": new mongoose.Types.ObjectId(clientId),
      },
    },
    { $count: "total" },
  ]);

  const acceptedAgg = await ProposalModel.aggregate([
    {
      $lookup: {
        from: "jobs",
        localField: "job",
        foreignField: "_id",
        as: "jobDoc",
      },
    },
    { $unwind: "$jobDoc" },
    {
      $match: {
        "jobDoc.client": new mongoose.Types.ObjectId(clientId),
        status: "accepted",
      },
    },
    { $count: "total" },
  ]);

  return {
    totalJobs: total,
    activeJobs: active,
    closedJobs: closed,
    totalProposals: proposalAgg[0]?.total ?? 0,
    hired: acceptedAgg[0]?.total ?? 0,
  };
};

// ─── Proposal Service ─────────────────────────────────────────────────────────

export const submitProposal = async (freelancerId: string, jobId: string, input: unknown) => {
  const data = createProposalDto.parse(input);

  const freelancer = await UserModel.findById(freelancerId);
  if (!freelancer || freelancer.role !== "freelancer") {
    throw new HttpError(403, "Only freelancers can submit proposals", {
      code: ErrorCodes.AUTH_FORBIDDEN,
    });
  }

  const job = await JobModel.findById(jobId);
  if (!job) {
    throw new HttpError(404, "Job not found", { code: ErrorCodes.NOT_FOUND });
  }
  if (job.status !== "open") {
    throw new HttpError(400, "This job is no longer accepting proposals", {
      code: ErrorCodes.BAD_REQUEST,
    });
  }

const existing = await ProposalModel.findOne({ job: jobId, freelancer: freelancerId });

if (existing && existing.status !== "withdrawn") {
  throw new HttpError(409, "You have already submitted a proposal for this job", {
    code: ErrorCodes.CONFLICT,
  });
}

let proposal;
if (existing) {
  // Reactivate the withdrawn proposal instead of creating a duplicate
  // (a hard unique index on {job, freelancer} would reject a second document anyway)
  existing.set({ ...data, status: "pending" });
  proposal = await existing.save();
} else {
  proposal = await ProposalModel.create({
    job: jobId,
    freelancer: freelancerId,
    ...data,
  });
}

  // Increment proposal count on the job
  await JobModel.findByIdAndUpdate(jobId, { $inc: { proposalCount: 1 } });

  await createNotification(
    job.client.toString(),
    "proposal_received",
    `New proposal received for "${job.title}"`,
    proposal._id.toString()
  );

  return serializeProposal(proposal, job.title, null);
};

export const getFreelancerProposals = async (freelancerId: string) => {
  const proposals = await ProposalModel.find({ freelancer: freelancerId })
    .populate("job", "title budgetMin budgetMax budgetType")
    .sort({ createdAt: -1 });

  return proposals.map((p) => {
    const job = p.job as unknown as IJobDocument & { title: string };
    return serializeProposal(p, job?.title ?? "Unknown Job", job);
  });
};

export const getJobProposals = async (clientId: string, jobId: string) => {
  const job = await JobModel.findOne({ _id: jobId, client: clientId });
  if (!job) {
    throw new HttpError(404, "Job not found or you do not own it", {
      code: ErrorCodes.NOT_FOUND,
    });
  }

  const proposals = await ProposalModel.find({ job: jobId })
    .populate("freelancer", "firstName lastName email profilePicture cvUrl")
    .sort({ createdAt: -1 });

  return proposals.map((p) => serializeProposal(p, job.title, null));
};

export const getClientProposals = async (clientId: string) => {
  const clientJobs = await JobModel.find({ client: clientId }).select("_id");
  const jobIds = clientJobs.map((j) => j._id);

  const proposals = await ProposalModel.find({ job: { $in: jobIds } })
    .populate("freelancer", "firstName lastName email profilePicture cvUrl")
    .populate("job", "title budgetMin budgetMax budgetType")
    .sort({ createdAt: -1 });

  return proposals.map((p) => {
    const job = p.job as unknown as IJobDocument & { title: string };
    return serializeProposal(p, job?.title ?? "Unknown Job", job);
  });
};

export const updateProposalStatus = async (
  clientId: string,
  proposalId: string,
  input: unknown
) => {
  const data = updateProposalStatusDto.parse(input);

  const proposal = await ProposalModel.findById(proposalId)
    .populate("job")
    .populate("freelancer", "firstName lastName email profilePicture cvUrl");
  if (!proposal) {
    throw new HttpError(404, "Proposal not found", { code: ErrorCodes.NOT_FOUND });
  }

  const job = proposal.job as unknown as IJobDocument;
  if (job.client.toString() !== clientId) {
    throw new HttpError(403, "You do not own this job", {
      code: ErrorCodes.AUTH_FORBIDDEN,
    });
  }

if (data.status === "accepted" && job.status !== "open") {
  throw new HttpError(400, "This job already has an active contract", {
    code: ErrorCodes.BAD_REQUEST,
  });
}

if (proposal.status !== "pending") {
  throw new HttpError(400, "Only pending proposals can be updated", {
    code: ErrorCodes.BAD_REQUEST,
  });
}

proposal.status = data.status;
await proposal.save();

  if (data.status === "accepted") {
    // Auto-create a contract between client and the winning freelancer
    await ContractModel.create({
      job: job._id,
      client: job.client,
      freelancer: proposal.freelancer,
      proposal: proposal._id,
      agreedAmount: proposal.bidAmount,
    });

    // Move job to in-progress (not closed — it closes when contract is completed)
    await JobModel.findByIdAndUpdate(job._id, { status: "in-progress" });

    // Auto-reject all other pending proposals on this job
    await ProposalModel.updateMany(
      { job: job._id, _id: { $ne: proposal._id }, status: "pending" },
      { $set: { status: "rejected" } }
    );

    const freelancerId = (proposal.freelancer as any)?._id
      ? (proposal.freelancer as any)._id.toString()
      : proposal.freelancer.toString();

    await createNotification(
      freelancerId,
      "proposal_accepted",
      `Your proposal for "${job.title}" was accepted!`,
      proposal._id.toString()
    );
  } else if (data.status === "rejected") {
    const freelancerId = (proposal.freelancer as any)?._id
      ? (proposal.freelancer as any)._id.toString()
      : proposal.freelancer.toString();

    await createNotification(
      freelancerId,
      "proposal_rejected",
      `Your proposal for "${job.title}" was rejected.`,
      proposal._id.toString()
    );
  }

  return serializeProposal(proposal, job.title, null);
};

export const withdrawProposal = async (freelancerId: string, proposalId: string) => {
  const proposal = await ProposalModel.findOne({
    _id: proposalId,
    freelancer: freelancerId,
  });

  if (!proposal) {
    throw new HttpError(404, "Proposal not found", { code: ErrorCodes.NOT_FOUND });
  }

  if (proposal.status !== "pending") {
    throw new HttpError(400, "Only pending proposals can be withdrawn", {
      code: ErrorCodes.BAD_REQUEST,
    });
  }

  proposal.status = "withdrawn";
  await proposal.save();

  await JobModel.findByIdAndUpdate(proposal.job, { $inc: { proposalCount: -1 } });

  return { id: proposalId };
};

export const getFreelancerStats = async (freelancerId: string) => {
  const [active, accepted, rejected] = await Promise.all([
    ProposalModel.countDocuments({ freelancer: freelancerId, status: "pending" }),
    ProposalModel.countDocuments({ freelancer: freelancerId, status: "accepted" }),
    ProposalModel.countDocuments({ freelancer: freelancerId, status: "rejected" }),
  ]);

  return {
    activeProposals: active,
    jobsWon: accepted,
    totalRejected: rejected,
  };
};

// ─── Saved Jobs Service ───────────────────────────────────────────────────────

export const saveJob = async (freelancerId: string, jobId: string) => {
  const job = await JobModel.findById(jobId);
  if (!job) {
    throw new HttpError(404, "Job not found", { code: ErrorCodes.NOT_FOUND });
  }

  try {
    await SavedJobModel.create({ freelancer: freelancerId, job: jobId });
  } catch (error: any) {
    if (error.code === 11000) {
      // Duplicate key error — treat as idempotent success
      return { jobId, saved: true };
    }
    throw error;
  }

  return { jobId, saved: true };
};

export const unsaveJob = async (freelancerId: string, jobId: string) => {
  await SavedJobModel.findOneAndDelete({ freelancer: freelancerId, job: jobId });
  return { jobId, saved: false };
};

export const getSavedJobs = async (freelancerId: string) => {
  const savedDocs = await SavedJobModel.find({ freelancer: freelancerId })
    .populate({
      path: "job",
      populate: {
        path: "client",
        select: "firstName lastName profilePicture",
      },
    })
    .sort({ createdAt: -1 });

  const validJobs = savedDocs
    .map((doc) => doc.job as unknown as IJobDocument)
    .filter((job) => job && job._id);

  return validJobs.map((job) => serializeJob(job, freelancerId));
};

// ─── Serializers ──────────────────────────────────────────────────────────────
const serializeJob = (job: IJobDocument, requesterId: string | null) => {
  const clientDoc = job.populated("client")
    ? (job.client as unknown as { firstName: string; lastName: string; profilePicture?: string; _id: string })
    : null;

  return {
    _id: job._id.toString(),
    id: job._id.toString(),
    title: job.title,
    description: job.description,
    category: job.category,
    budgetType: job.budgetType,
    budgetMin: job.budgetMin,
    budgetMax: job.budgetMax,
    budget: formatBudget(job),
    skills: job.skills,
    duration: job.duration,
    status: job.status,
    proposalCount: job.proposalCount,
    client: clientDoc
      ? {
          id: clientDoc._id,
          name: `${clientDoc.firstName} ${clientDoc.lastName}`,
          initials: `${clientDoc.firstName[0]}${clientDoc.lastName[0]}`.toUpperCase(),
          profilePicture: clientDoc.profilePicture ?? undefined,
        }
      : { id: requesterId ?? "", name: "", initials: "", profilePicture: undefined },
    postedAt: timeAgo(job.createdAt),
    createdAt: job.createdAt.toISOString(),
  };
};

const serializeProposal = (
  proposal: InstanceType<typeof ProposalModel>,
  jobTitle: string,
  jobDoc: IJobDocument | null
) => {
  const freelancerDoc = proposal.populated("freelancer")
    ? (proposal.freelancer as unknown as {
        firstName: string;
        lastName: string;
        email: string;
        profilePicture?: string;
        cvUrl?: string;
        _id: string;
      })
    : null;

  const jobId = (proposal.job as any)?._id
    ? (proposal.job as any)._id.toString()
    : proposal.job.toString();

  return {
    _id: proposal._id.toString(),
    id: proposal._id.toString(),
    jobId,
    jobTitle,
    bidAmount: proposal.bidAmount,
    coverLetter: proposal.coverLetter,
    deliveryTime: proposal.deliveryTime,
    status: proposal.status,
    submittedAt: timeAgo(proposal.createdAt),
    createdAt: proposal.createdAt.toISOString(),
    ...(freelancerDoc
      ? {
          freelancer: {
            id: freelancerDoc._id,
            name: `${freelancerDoc.firstName} ${freelancerDoc.lastName}`,
            initials: `${freelancerDoc.firstName[0]}${freelancerDoc.lastName[0]}`.toUpperCase(),
            email: freelancerDoc.email,
            profilePicture: freelancerDoc.profilePicture,
            cvUrl: freelancerDoc.cvUrl ?? null,
          },
        }
      : {}),
    ...(jobDoc
      ? {
          budget: formatBudget(jobDoc),
          company: "Client",
        }
      : {}),
  };
};
