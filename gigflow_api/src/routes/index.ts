import { Router } from "express";
import adminUserRoutes from "./admin-user.route";
import authRoutes from "./auth.route";
import contractRoutes from "./contract.route";
import healthRoutes from "./health.route";
import jobRoutes from "./job.route";
import messageRoutes from "./message.route";
import reviewRoutes from "./review.route";
import userRoutes from "./user.route";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/admin/users", adminUserRoutes);
router.use("/jobs", jobRoutes);
router.use("/contracts", contractRoutes);
router.use("/reviews", reviewRoutes);
router.use("/messages", messageRoutes);
router.use("/users", userRoutes);

export default router;
