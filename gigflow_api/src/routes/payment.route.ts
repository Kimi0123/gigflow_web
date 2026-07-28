import { Router } from "express";
import {
  fundContractHandler,
  getWalletHandler,
  initiateTopupHandler,
  mockTopupHandler,
  verifyTopupHandler,
  withdrawHandler,
} from "../controllers/payment.controller";
import { authorized } from "../middlewares/auth.middleware";

const router = Router();

// ─── IMPORTANT: static / more specific routes MUST come before parameterised routes ───

// Static routes
router.get("/wallet/me", authorized, getWalletHandler);
router.post("/topup", authorized, mockTopupHandler);
router.post("/topup/initiate", authorized, initiateTopupHandler);
router.get("/topup/verify", verifyTopupHandler);
router.post("/withdraw", authorized, withdrawHandler);

// Parameterised routes
router.post("/contracts/:id/fund", authorized, fundContractHandler);

export default router;
