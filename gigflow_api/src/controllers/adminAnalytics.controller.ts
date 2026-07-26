import { NextFunction, Request, Response } from "express";
import {
  getPlatformOverview,
  getGrowthTrends,
  getRecentActivity,
} from "../services/adminAnalytics.service";
import { adminDeleteJob } from "../services/adminModeration.service";
import { sendSuccess } from "../utils/api-response";

export const platformOverview = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getPlatformOverview();
    sendSuccess(res, 200, "Platform overview fetched successfully", data);
  } catch (error) {
    next(error);
  }
};

export const growthTrends = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getGrowthTrends();
    sendSuccess(res, 200, "Growth trends fetched successfully", data);
  } catch (error) {
    next(error);
  }
};

export const recentActivity = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getRecentActivity();
    sendSuccess(res, 200, "Recent activity fetched successfully", data);
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await adminDeleteJob(String(req.params.jobId));
    sendSuccess(res, 200, "Job deleted successfully", {});
  } catch (error) {
    next(error);
  }
};
