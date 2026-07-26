import { Router } from "express";
import {
  deleteJob,
  growthTrends,
  platformOverview,
  recentActivity,
} from "../controllers/adminAnalytics.controller";
import { authorized, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.use(authorized, requireAdmin);

router.get("/analytics/overview", platformOverview);
router.get("/analytics/trends", growthTrends);
router.get("/analytics/recent-activity", recentActivity);
router.delete("/jobs/:jobId", deleteJob);

export default router;
