import mongoose, { Document, Schema } from "mongoose";

export type ContractStatus = "active" | "completed" | "cancelled";

export interface IContract {
  job: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  freelancer: mongoose.Types.ObjectId;
  proposal: mongoose.Types.ObjectId;
  agreedAmount: number;
  status: ContractStatus;
  isFunded: boolean;
  startedAt: Date;
  completedAt?: Date;
}

export interface IContractDocument extends IContract, Document {
  createdAt: Date;
  updatedAt: Date;
}

const contractSchema = new Schema<IContractDocument>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    freelancer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    proposal: {
      type: Schema.Types.ObjectId,
      ref: "Proposal",
      required: true,
    },
    agreedAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    isFunded: {
      type: Boolean,
      default: false,
    },
    startedAt: {
      type: Date,
      default: () => new Date(),
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// One contract per job (a job can only have one active contract at a time)
contractSchema.index({ job: 1 }, { unique: true });

export const ContractModel =
  (mongoose.models.Contract as mongoose.Model<IContractDocument>) ||
  mongoose.model<IContractDocument>("Contract", contractSchema);
