import { Router } from "express";
import {
  createJobHandler,
  deleteJobHandler,
  generateProposalDraftHandler,
  getClientJobsHandler,
  getClientProposalsHandler,
  getClientStatsHandler,
  getFreelancerProposalsHandler,
  getFreelancerStatsHandler,
  getJobByIdHandler,
  getJobProposalsHandler,
  getOpenJobsHandler,
  getSavedJobsHandler,
  saveJobHandler,
  submitProposalHandler,
  unsaveJobHandler,
  updateJobHandler,
  updateProposalStatusHandler,
  withdrawProposalHandler,
} from "../controllers/job.controller";
import { authorized } from "../middlewares/auth.middleware";

const router = Router();

// ─── IMPORTANT: static routes MUST come before parameterised (/:id) routes ───

// ─── Client: static routes ────────────────────────────────────────────────────
router.get("/client/my-jobs", authorized, getClientJobsHandler);
router.get("/client/stats", authorized, getClientStatsHandler);
router.get("/proposals/client/all-proposals", authorized, getClientProposalsHandler);

// ─── Freelancer: proposal & saved jobs static routes ──────────────────────────
router.get("/proposals/my-proposals", authorized, getFreelancerProposalsHandler);
router.get("/proposals/stats", authorized, getFreelancerStatsHandler);
router.get("/saved/my-jobs", authorized, getSavedJobsHandler);
router.patch("/proposals/:proposalId/status", authorized, updateProposalStatusHandler);
router.patch("/proposals/:proposalId/withdraw", authorized, withdrawProposalHandler);

// ─── Open job feed ────────────────────────────────────────────────────────────
router.get("/", authorized, getOpenJobsHandler);
router.post("/", authorized, createJobHandler);

// ─── Parameterised job routes (must come after all static routes) ─────────────
router.get("/:id", authorized, getJobByIdHandler);
router.patch("/:id", authorized, updateJobHandler);
router.delete("/:id", authorized, deleteJobHandler);

// ─── Saved jobs on a specific job ─────────────────────────────────────────────
router.post("/:jobId/save", authorized, saveJobHandler);
router.delete("/:jobId/save", authorized, unsaveJobHandler);

// ─── Proposals on a specific job ──────────────────────────────────────────────
router.get("/:jobId/proposals", authorized, getJobProposalsHandler);
router.post("/:jobId/proposals", authorized, submitProposalHandler);
router.post("/:jobId/generate-proposal", authorized, generateProposalDraftHandler);

export default router;
