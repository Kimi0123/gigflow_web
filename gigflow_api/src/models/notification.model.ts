import mongoose, { Document, Schema } from "mongoose";

export type NotificationType =
  | "proposal_received"
  | "proposal_accepted"
  | "proposal_rejected"
  | "new_message"
  | "contract_completed"
  | "review_received";

export interface INotification {
  recipient: mongoose.Types.ObjectId;
  type: NotificationType;
  message: string;
  relatedId?: mongoose.Types.ObjectId | null;
  read: boolean;
}

export interface INotificationDocument extends INotification, Document {
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "proposal_received",
        "proposal_accepted",
        "proposal_rejected",
        "new_message",
        "contract_completed",
        "review_received",
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

export const NotificationModel =
  (mongoose.models.Notification as mongoose.Model<INotificationDocument>) ||
  mongoose.model<INotificationDocument>("Notification", notificationSchema);
