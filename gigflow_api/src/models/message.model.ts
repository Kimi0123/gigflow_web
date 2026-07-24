import mongoose, { Document, Schema } from "mongoose";

export interface IMessage {
  contract: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  readAt?: Date | null;
}

export interface IMessageDocument extends IMessage, Document {
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessageDocument>(
  {
    contract: {
      type: Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Fast chronological fetch per contract
messageSchema.index({ contract: 1, createdAt: 1 });

export const MessageModel =
  (mongoose.models.Message as mongoose.Model<IMessageDocument>) ||
  mongoose.model<IMessageDocument>("Message", messageSchema);
