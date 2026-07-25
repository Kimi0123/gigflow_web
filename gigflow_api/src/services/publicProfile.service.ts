import mongoose from "mongoose";
import { ErrorCodes } from "../errors/error-codes";
import { HttpError } from "../errors/http-error";
import { ContractModel } from "../models/contract.model";
import { UserModel } from "../models/user.model";
import { getUserRatingSummary } from "./review.service";

export const getPublicProfile = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new HttpError(404, "User not found", {
      code: ErrorCodes.NOT_FOUND,
    });
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new HttpError(404, "User not found", {
      code: ErrorCodes.NOT_FOUND,
    });
  }

  const ratingSummary = await getUserRatingSummary(userId);

  const userObjId = new mongoose.Types.ObjectId(userId);
  const completedContractsCount = await ContractModel.countDocuments({
    $or: [{ client: userObjId }, { freelancer: userObjId }],
    status: "completed",
  });

  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "U";
  const id = user._id.toString();

  return {
    _id: id,
    id,
    firstName,
    lastName,
    initials,
    profilePicture: user.profilePicture,
    bio: user.bio ?? "",
    title: user.title ?? "",
    skills: user.skills ?? [],
    cvUrl: user.cvUrl ?? "",
    role: user.role,
    createdAt: user.createdAt
      ? new Date(user.createdAt).toISOString()
      : new Date().toISOString(),
    completedContractsCount,
    averageRating: ratingSummary.averageRating,
    totalReviews: ratingSummary.totalReviews,
  };
};

export const listFreelancers = async (
  search?: string,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;

  const matchStage: any = { role: "freelancer" };

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    matchStage.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { title: searchRegex },
      { skills: searchRegex },
    ];
  }

  const pipeline: any[] = [
    { $match: matchStage },
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "reviewee",
        as: "reviewDocs",
      },
    },
    {
      $addFields: {
        totalReviews: { $size: "$reviewDocs" },
        averageRating: {
          $cond: {
            if: { $gt: [{ $size: "$reviewDocs" }, 0] },
            then: { $round: [{ $avg: "$reviewDocs.rating" }, 1] },
            else: 0,
          },
        },
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    },
  ];

  const aggregateResult = await UserModel.aggregate(pipeline);

  const metadata = aggregateResult[0]?.metadata[0] || { total: 0 };
  const rawData = aggregateResult[0]?.data || [];

  const freelancers = rawData.map((user: any) => {
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "U";
    const id = user._id.toString();

    return {
      _id: id,
      id,
      firstName,
      lastName,
      initials,
      profilePicture: user.profilePicture,
      bio: user.bio ?? "",
      title: user.title ?? "",
      skills: user.skills ?? [],
      cvUrl: user.cvUrl ?? "",
      role: user.role,
      createdAt: user.createdAt
        ? new Date(user.createdAt).toISOString()
        : new Date().toISOString(),
      averageRating: user.averageRating ?? 0,
      totalReviews: user.totalReviews ?? 0,
    };
  });

  const total = metadata.total;

  return {
    freelancers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};
