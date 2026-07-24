import mongoose, { Document, Schema } from "mongoose";

export type ReviewerRole = "client" | "freelancer";

export interface IReview {
  contract: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  reviewer: mongoose.Types.ObjectId;
  reviewee: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  reviewerRole: ReviewerRole;
}

export interface IReviewDocument extends IReview, Document {
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReviewDocument>(
  {
    contract: {
      type: Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    reviewerRole: {
      type: String,
      enum: ["client", "freelancer"],
      required: true,
    },
  },
  { timestamps: true }
);

// One review per person per contract (both client and freelancer can each leave one)
reviewSchema.index({ contract: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ reviewee: 1, createdAt: -1 });

export const ReviewModel =
  (mongoose.models.Review as mongoose.Model<IReviewDocument>) ||
  mongoose.model<IReviewDocument>("Review", reviewSchema);
