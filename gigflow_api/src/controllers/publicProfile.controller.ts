import { NextFunction, Request, Response } from "express";
import {
  getPublicProfile,
  listFreelancers,
} from "../services/publicProfile.service";
import { sendSuccess } from "../utils/api-response";

export const listFreelancersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const search = (req.query.search as string) || "";
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const result = await listFreelancers(search, page, limit);
    sendSuccess(res, 200, "Freelancers fetched successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getPublicProfileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.userId as string;
    const profile = await getPublicProfile(userId);
    sendSuccess(res, 200, "Public profile fetched successfully", profile);
  } catch (error) {
    next(error);
  }
};
