import { NextFunction, Request, Response } from "express";
import {
  getContractMessages,
  getUnreadCount,
  markMessagesRead,
  sendMessage,
} from "../services/message.service";
import { sendSuccess } from "../utils/api-response";

export const sendMessageHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const message = await sendMessage(
      req.userId!,
      req.params.contractId as string,
      req.body
    );
    sendSuccess(res, 201, "Message sent successfully", message);
  } catch (error) {
    next(error);
  }
};

export const getContractMessagesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const result = await getContractMessages(
      req.userId!,
      req.params.contractId as string,
      page,
      limit
    );
    sendSuccess(res, 200, "Contract messages fetched successfully", result);
  } catch (error) {
    next(error);
  }
};

export const markMessagesReadHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await markMessagesRead(
      req.userId!,
      req.params.contractId as string
    );
    sendSuccess(res, 200, "Messages marked as read successfully", result);
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
