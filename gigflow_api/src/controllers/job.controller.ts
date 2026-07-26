import { NextFunction, Request, Response } from "express";
import { generateProposalDraft } from "../services/aiAssist.service";
import {
  createJob,
  deleteJob,
  getClientJobs,
  getClientStats,
  getFreelancerProposals,
  getFreelancerStats,
  getJobById,
  getJobProposals,
  getOpenJobs,
  getSavedJobs,
  saveJob,
  submitProposal,
  unsaveJob,
  updateJob,
  updateProposalStatus,
  withdrawProposal,
} from "../services/job.service";
import { sendSuccess } from "../utils/api-response";

// ─── Job Controllers ──────────────────────────────────────────────────────────

export const createJobHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const job = await createJob(req.userId!, req.body);
    sendSuccess(res, 201, "Job posted successfully", job);
  } catch (error) {
    next(error);
  }
};

export const getClientJobsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const jobs = await getClientJobs(req.userId!);
    sendSuccess(res, 200, "Jobs fetched successfully", jobs);
  } catch (error) {
    next(error);
  }
};

export const getOpenJobsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getOpenJobs({
      category: req.query.category as string,
      budgetType: req.query.budgetType as string,
      skills: req.query.skills as string,
      search: req.query.search as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    sendSuccess(res, 200, "Jobs fetched successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getJobByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const job = await getJobById(req.params.id as string, req.userId);
    sendSuccess(res, 200, "Job fetched successfully", job);
  } catch (error) {
    next(error);
  }
};

export const updateJobHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const job = await updateJob(req.userId!, req.params.id as string, req.body);
    sendSuccess(res, 200, "Job updated successfully", job);
  } catch (error) {
    next(error);
  }
};

export const deleteJobHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await deleteJob(req.userId!, req.params.id as string);
    sendSuccess(res, 200, "Job deleted successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getClientStatsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await getClientStats(req.userId!);
    sendSuccess(res, 200, "Stats fetched successfully", stats);
  } catch (error) {
    next(error);
  }
};

// ─── Proposal Controllers ─────────────────────────────────────────────────────

export const submitProposalHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const proposal = await submitProposal(req.userId!, req.params.jobId as string, req.body);
    sendSuccess(res, 201, "Proposal submitted successfully", proposal);
  } catch (error) {
    next(error);
  }
};

export const generateProposalDraftHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await generateProposalDraft(
      req.userId!,
      req.params.jobId as string
    );
    sendSuccess(res, 200, "Proposal draft generated successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getFreelancerProposalsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const proposals = await getFreelancerProposals(req.userId!);
    sendSuccess(res, 200, "Proposals fetched successfully", proposals);
  } catch (error) {
    next(error);
  }
};

export const getJobProposalsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const proposals = await getJobProposals(req.userId!, req.params.jobId as string);
    sendSuccess(res, 200, "Proposals fetched successfully", proposals);
  } catch (error) {
    next(error);
  }
};

export const updateProposalStatusHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const proposal = await updateProposalStatus(req.userId!, req.params.proposalId as string, req.body);
    sendSuccess(res, 200, "Proposal status updated", proposal);
  } catch (error) {
    next(error);
  }
};

export const withdrawProposalHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await withdrawProposal(req.userId!, req.params.proposalId as string);
    sendSuccess(res, 200, "Proposal withdrawn", result);
  } catch (error) {
    next(error);
  }
};

export const getFreelancerStatsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await getFreelancerStats(req.userId!);
    sendSuccess(res, 200, "Stats fetched successfully", stats);
  } catch (error) {
    next(error);
  }
};

// ─── Saved Jobs Controllers ───────────────────────────────────────────────────

export const saveJobHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await saveJob(req.userId!, req.params.jobId as string);
    sendSuccess(res, 200, "Job saved successfully", result);
  } catch (error) {
    next(error);
  }
};

export const unsaveJobHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await unsaveJob(req.userId!, req.params.jobId as string);
    sendSuccess(res, 200, "Job unsaved successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getSavedJobsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const jobs = await getSavedJobs(req.userId!);
    sendSuccess(res, 200, "Saved jobs fetched successfully", jobs);
  } catch (error) {
    next(error);
  }
};
