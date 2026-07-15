import { Router } from "express";
import {
  createJobHandler,
  deleteJobHandler,
  getClientJobsHandler,
  getClientStatsHandler,
  getFreelancerProposalsHandler,
  getFreelancerStatsHandler,
  getJobByIdHandler,
  getJobProposalsHandler,
  getOpenJobsHandler,
  submitProposalHandler,
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

// ─── Freelancer: proposal static routes ──────────────────────────────────────
router.get("/proposals/my-proposals", authorized, getFreelancerProposalsHandler);
router.get("/proposals/stats", authorized, getFreelancerStatsHandler);
router.patch("/proposals/:proposalId/status", authorized, updateProposalStatusHandler);
router.patch("/proposals/:proposalId/withdraw", authorized, withdrawProposalHandler);

// ─── Open job feed ────────────────────────────────────────────────────────────
router.get("/", authorized, getOpenJobsHandler);
router.post("/", authorized, createJobHandler);

// ─── Parameterised job routes (must come after all static routes) ─────────────
router.get("/:id", authorized, getJobByIdHandler);
router.patch("/:id", authorized, updateJobHandler);
router.delete("/:id", authorized, deleteJobHandler);

// ─── Proposals on a specific job ──────────────────────────────────────────────
router.get("/:jobId/proposals", authorized, getJobProposalsHandler);
router.post("/:jobId/proposals", authorized, submitProposalHandler);

export default router;
