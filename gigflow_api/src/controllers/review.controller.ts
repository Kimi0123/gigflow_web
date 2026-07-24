import { NextFunction, Request, Response } from "express";
import {
  createReview,
  getContractReviews,
  getUserRatingSummary,
  getUserReviews,
} from "../services/review.service";
import { sendSuccess } from "../utils/api-response";

export const createReviewHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const review = await createReview(
      req.userId!,
      req.params.contractId as string,
      req.body
    );
    sendSuccess(res, 201, "Review submitted successfully", review);
  } catch (error) {
    next(error);
  }
};

export const getUserReviewsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const result = await getUserReviews(
      req.params.userId as string,
      page,
      limit
    );
    sendSuccess(res, 200, "User reviews fetched successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getUserRatingSummaryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const summary = await getUserRatingSummary(req.params.userId as string);
    sendSuccess(res, 200, "User rating summary fetched successfully", summary);
  } catch (error) {
    next(error);
  }
};

export const getContractReviewsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reviews = await getContractReviews(req.params.contractId as string);
    sendSuccess(res, 200, "Contract reviews fetched successfully", reviews);
  } catch (error) {
    next(error);
  }
};
