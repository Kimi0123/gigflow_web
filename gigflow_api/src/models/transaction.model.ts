import mongoose, { Document, Schema } from "mongoose";

export type TransactionType = "fund" | "release" | "refund";

export interface ITransaction {
  contract: mongoose.Types.ObjectId;
  from: mongoose.Types.ObjectId | null;
  to: mongoose.Types.ObjectId | null;
  amount: number;
  type: TransactionType;
}

export interface ITransactionDocument extends ITransaction, Document {
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransactionDocument>(
  {
    contract: {
      type: Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
    },
    from: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ["fund", "release", "refund"],
      required: true,
    },
  },
  { timestamps: true }
);

transactionSchema.index({ to: 1, createdAt: -1 });
transactionSchema.index({ contract: 1 });

export const TransactionModel =
  (mongoose.models.Transaction as mongoose.Model<ITransactionDocument>) ||
  mongoose.model<ITransactionDocument>("Transaction", transactionSchema);
