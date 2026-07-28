import { Router } from "express";
import adminAnalyticsRoutes from "./admin-analytics.route";
import adminUserRoutes from "./admin-user.route";
import authRoutes from "./auth.route";
import contractRoutes from "./contract.route";
import healthRoutes from "./health.route";
import jobRoutes from "./job.route";
import messageRoutes from "./message.route";
import notificationRoutes from "./notification.route";
import paymentRoutes from "./payment.route";
import reviewRoutes from "./review.route";
import userRoutes from "./user.route";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/admin/users", adminUserRoutes);
router.use("/admin", adminAnalyticsRoutes);
router.use("/jobs", jobRoutes);
router.use("/contracts", contractRoutes);
router.use("/reviews", reviewRoutes);
router.use("/messages", messageRoutes);
router.use("/notifications", notificationRoutes);
router.use("/payments", paymentRoutes);
router.use("/users", userRoutes);

export default router;
