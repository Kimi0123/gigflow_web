import { Router } from "express";
import {
  fundContractHandler,
  getWalletHandler,
} from "../controllers/payment.controller";
import { authorized } from "../middlewares/auth.middleware";

const router = Router();

// ─── IMPORTANT: static / more specific routes MUST come before parameterised routes ───

// Static routes
router.get("/wallet/me", authorized, getWalletHandler);

// Parameterised routes
router.post("/contracts/:id/fund", authorized, fundContractHandler);

export default router;
