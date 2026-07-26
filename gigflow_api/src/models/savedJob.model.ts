import mongoose, { Document, Schema } from "mongoose";

export interface ISavedJob {
  freelancer: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
}

export interface ISavedJobDocument extends ISavedJob, Document {
  createdAt: Date;
  updatedAt: Date;
}

const savedJobSchema = new Schema<ISavedJobDocument>(
  {
    freelancer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// One save per freelancer per job
savedJobSchema.index({ freelancer: 1, job: 1 }, { unique: true });

export const SavedJobModel =
  (mongoose.models.SavedJob as mongoose.Model<ISavedJobDocument>) ||
  mongoose.model<ISavedJobDocument>("SavedJob", savedJobSchema);
