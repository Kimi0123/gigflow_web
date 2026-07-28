import { Router } from "express";
import {
  getNotificationsHandler,
  getUnreadCountHandler,
  markAllAsReadHandler,
  markAsReadHandler,
} from "../controllers/notification.controller";
import { authorized } from "../middlewares/auth.middleware";

const router = Router();

// ─── IMPORTANT: static / more specific routes MUST come before parameterised routes ───

// Static routes
router.get("/unread-count", authorized, getUnreadCountHandler);
router.get("/", authorized, getNotificationsHandler);
router.patch("/read-all", authorized, markAllAsReadHandler);

// Parameterised routes
router.patch("/:id/read", authorized, markAsReadHandler);

export default router;
