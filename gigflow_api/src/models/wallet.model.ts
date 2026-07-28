import mongoose, { Document, Schema } from "mongoose";

export interface IWallet {
  user: mongoose.Types.ObjectId;
  balance: number;
}

export interface IWalletDocument extends IWallet, Document {
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<IWalletDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 50000,
      min: 0,
    },
  },
  { timestamps: true }
);

export const WalletModel =
  (mongoose.models.Wallet as mongoose.Model<IWalletDocument>) ||
  mongoose.model<IWalletDocument>("Wallet", walletSchema);
