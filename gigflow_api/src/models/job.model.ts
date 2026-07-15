import mongoose, { Document, Schema } from "mongoose";

export type JobStatus = "open" | "closed" | "draft";
export type BudgetType = "fixed" | "hourly";

export interface IJob {
  client: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  budgetType: BudgetType;
  budgetMin: number;
  budgetMax?: number;
  skills: string[];
  duration: string;
  status: JobStatus;
  proposalCount: number;
}

export interface IJobDocument extends IJob, Document {
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJobDocument>(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    budgetType: { type: String, enum: ["fixed", "hourly"], required: true },
    budgetMin: { type: Number, required: true, min: 0 },
    budgetMax: { type: Number, min: 0 },
    skills: [{ type: String, trim: true }],
    duration: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["open", "closed", "draft"],
      default: "open",
    },
    proposalCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for freelancer job feed (open jobs, newest first)
jobSchema.index({ status: 1, createdAt: -1 });

export const JobModel =
  (mongoose.models.Job as mongoose.Model<IJobDocument>) ||
  mongoose.model<IJobDocument>("Job", jobSchema);
