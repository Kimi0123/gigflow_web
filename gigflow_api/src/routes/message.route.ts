import { Router } from "express";
import {
  getContractMessagesHandler,
  getUnreadCountHandler,
  markMessagesReadHandler,
  sendMessageHandler,
} from "../controllers/message.controller";
import { authorized } from "../middlewares/auth.middleware";

const router = Router();

// ─── IMPORTANT: static / more specific routes MUST come before parameterised routes ───

// Static routes
router.get("/unread-count", authorized, getUnreadCountHandler);

// Contract message routes
router.post("/contract/:contractId", authorized, sendMessageHandler);
router.get("/contract/:contractId", authorized, getContractMessagesHandler);
router.patch("/contract/:contractId/read", authorized, markMessagesReadHandler);

export default router;
