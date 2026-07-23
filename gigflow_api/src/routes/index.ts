import { Router } from "express";
import adminUserRoutes from "./admin-user.route";
import authRoutes from "./auth.route";
import contractRoutes from "./contract.route";
import healthRoutes from "./health.route";
import jobRoutes from "./job.route";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/admin/users", adminUserRoutes);
router.use("/jobs", jobRoutes);
router.use("/contracts", contractRoutes);

export default router;
