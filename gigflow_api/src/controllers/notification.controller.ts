import { NextFunction, Request, Response } from "express";
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from "../services/notification.service";
import { sendSuccess } from "../utils/api-response";

export const getNotificationsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const result = await getNotifications(req.userId!, limit);
    sendSuccess(res, 200, "Notifications fetched successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getUnreadCountHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getUnreadCount(req.userId!);
    sendSuccess(res, 200, "Unread count fetched successfully", result);
  } catch (error) {
    next(error);
  }
};

export const markAsReadHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await markAsRead(
      req.userId!,
      req.params.id as string
    );
    sendSuccess(res, 200, "Notification marked as read", result);
  } catch (error) {
    next(error);
  }
};

export const markAllAsReadHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await markAllAsRead(req.userId!);
    sendSuccess(res, 200, "All notifications marked as read", result);
  } catch (error) {
    next(error);
  }
};
