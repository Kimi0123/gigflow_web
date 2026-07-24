import { Router } from "express";
import {
  completeContractHandler,
  getClientContractsHandler,
  getContractByIdHandler,
  getFreelancerContractsHandler,
} from "../controllers/contract.controller";
import { authorized } from "../middlewares/auth.middleware";

const router = Router();

// ─── IMPORTANT: static routes before parameterised (/:id) routes ──────────────

router.get("/client/my-contracts", authorized, getClientContractsHandler);
router.get("/freelancer/my-contracts", authorized, getFreelancerContractsHandler);

// ─── Parameterised routes ─────────────────────────────────────────────────────
router.get("/:id", authorized, getContractByIdHandler);
router.patch("/:id/complete", authorized, completeContractHandler);

export default router;
