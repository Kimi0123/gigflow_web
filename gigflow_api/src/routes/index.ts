import { Router } from "express";
import authRoutes from "./auth.route";
import healthRoutes from "./health.route";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);

export default router;
