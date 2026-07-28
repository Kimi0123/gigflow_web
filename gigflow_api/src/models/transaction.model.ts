import mongoose, { Document, Schema } from "mongoose";

export type TransactionType = "fund" | "release" | "refund" | "topup" | "withdraw";
export type TransactionStatus = "pending" | "completed" | "failed";

export interface ITransaction {
  contract?: mongoose.Types.ObjectId | null;
  from: mongoose.Types.ObjectId | null;
  to: mongoose.Types.ObjectId | null;
  amount: number;
  type: TransactionType;
  status?: TransactionStatus;
  esewaTransactionUuid?: string | null;
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
      required: false,
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
      enum: ["fund", "release", "refund", "topup", "withdraw"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
    esewaTransactionUuid: {
      type: String,
      index: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

transactionSchema.index({ to: 1, createdAt: -1 });
transactionSchema.index({ contract: 1 });

export const TransactionModel =
  (mongoose.models.Transaction as mongoose.Model<ITransactionDocument>) ||
  mongoose.model<ITransactionDocument>("Transaction", transactionSchema);
