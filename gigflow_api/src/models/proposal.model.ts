import mongoose, { Document, Schema } from "mongoose";

export type ProposalStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface IProposal {
  job: mongoose.Types.ObjectId;
  freelancer: mongoose.Types.ObjectId;
  coverLetter: string;
  bidAmount: number;
  deliveryTime: string;
  status: ProposalStatus;
}

export interface IProposalDocument extends IProposal, Document {
  createdAt: Date;
  updatedAt: Date;
}

const proposalSchema = new Schema<IProposalDocument>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    freelancer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    coverLetter: { type: String, required: true, trim: true },
    bidAmount: { type: Number, required: true, min: 0 },
    deliveryTime: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// One proposal per freelancer per job
proposalSchema.index({ job: 1, freelancer: 1 }, { unique: true });

export const ProposalModel =
  (mongoose.models.Proposal as mongoose.Model<IProposalDocument>) ||
  mongoose.model<IProposalDocument>("Proposal", proposalSchema);
