import { Router } from "express";
import {
  createReviewHandler,
  getContractReviewsHandler,
  getUserRatingSummaryHandler,
  getUserReviewsHandler,
} from "../controllers/review.controller";
import { authorized } from "../middlewares/auth.middleware";

const router = Router();

// ─── IMPORTANT: static / more specific routes MUST come before parameterised routes ───

// Contract reviews
router.post("/contract/:contractId", authorized, createReviewHandler);
router.get("/contract/:contractId", authorized, getContractReviewsHandler);

// User reviews summary (must come before /user/:userId)
router.get("/user/:userId/summary", authorized, getUserRatingSummaryHandler);
router.get("/user/:userId", authorized, getUserReviewsHandler);

export default router;
