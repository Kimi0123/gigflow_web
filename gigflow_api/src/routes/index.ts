import { Router } from "express";
import adminUserRoutes from "./admin-user.route";
import authRoutes from "./auth.route";
import healthRoutes from "./health.route";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/admin/users", adminUserRoutes);

export default router;
