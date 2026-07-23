import mongoose from "mongoose";
import { createReviewDto } from "../dtos/review.dto";
import { ErrorCodes } from "../errors/error-codes";
import { HttpError } from "../errors/http-error";
import { ContractModel } from "../models/contract.model";
import { IReviewDocument, ReviewModel, ReviewerRole } from "../models/review.model";

const serializeReview = (review: IReviewDocument) => {
  const reviewerDoc = review.populated("reviewer")
    ? (review.reviewer as unknown as {
        _id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
      })
    : null;

  return {
    _id: review._id.toString(),
    id: review._id.toString(),
    contractId: review.contract.toString(),
    jobId: review.job.toString(),
    reviewerId: reviewerDoc?._id?.toString() ?? review.reviewer.toString(),
    reviewerName: reviewerDoc
      ? `${reviewerDoc.firstName} ${reviewerDoc.lastName}`
      : "User",
    reviewerInitials: reviewerDoc
      ? `${reviewerDoc.firstName[0]}${reviewerDoc.lastName[0]}`.toUpperCase()
      : "U",
    reviewerProfilePicture: reviewerDoc?.profilePicture,
    revieweeId: review.reviewee.toString(),
    rating: review.rating,
    comment: review.comment,
    reviewerRole: review.reviewerRole,
    createdAt: review.createdAt.toISOString(),
  };
};

export const createReview = async (
  userId: string,
  contractId: string,
  input: unknown
) => {
  const data = createReviewDto.parse(input);

  const contract = await ContractModel.findById(contractId);
  if (!contract) {
    throw new HttpError(404, "Contract not found", {
      code: ErrorCodes.NOT_FOUND,
    });
  }

  const isClient = contract.client.toString() === userId;
  const isFreelancer = contract.freelancer.toString() === userId;

  if (!isClient && !isFreelancer) {
    throw new HttpError(403, "You are not a party to this contract", {
      code: ErrorCodes.AUTH_FORBIDDEN,
    });
  }

  if (contract.status !== "completed") {
    throw new HttpError(400, "Reviews can only be left on completed contracts", {
      code: ErrorCodes.BAD_REQUEST,
    });
  }

  const existingReview = await ReviewModel.findOne({
    contract: contractId,
    reviewer: userId,
  });

  if (existingReview) {
    throw new HttpError(409, "You have already reviewed this contract", {
      code: ErrorCodes.CONFLICT,
    });
  }

  const reviewerRole: ReviewerRole = isClient ? "client" : "freelancer";
  const reviewee = isClient ? contract.freelancer : contract.client;

  const review = await ReviewModel.create({
    contract: contract._id,
    job: contract.job,
    reviewer: new mongoose.Types.ObjectId(userId),
    reviewee,
    rating: data.rating,
    comment: data.comment,
    reviewerRole,
  });

  const populated = await ReviewModel.findById(review._id).populate(
    "reviewer",
    "firstName lastName profilePicture"
  );

  return serializeReview(populated!);
};

export const getUserReviews = async (
  userId: string,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;

  const reviews = await ReviewModel.find({ reviewee: userId })
    .populate("reviewer", "firstName lastName profilePicture")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await ReviewModel.countDocuments({ reviewee: userId });

  return {
    reviews: reviews.map(serializeReview),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getUserRatingSummary = async (userId: string) => {
  const summary = await ReviewModel.aggregate([
    {
      $match: {
        reviewee: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (summary.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
    };
  }

  return {
    averageRating: Math.round(summary[0].averageRating * 10) / 10,
    totalReviews: summary[0].totalReviews,
  };
};

export const getContractReviews = async (contractId: string) => {
  const reviews = await ReviewModel.find({ contract: contractId })
    .populate("reviewer", "firstName lastName profilePicture")
    .sort({ createdAt: -1 });

  return reviews.map(serializeReview);
};
