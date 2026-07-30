import mongoose from "mongoose";
import { ErrorCodes } from "../errors/error-codes";
import { HttpError } from "../errors/http-error";
import {
  INotificationDocument,
  NotificationModel,
  NotificationType,
} from "../models/notification.model";
import { getIO } from "../socket";
import { sendPushNotification } from "./push.service";

const getPushTitle = (type: NotificationType): string => {
  switch (type) {
    case "proposal_received":
      return "New Proposal";
    case "proposal_accepted":
      return "Proposal Accepted";
    case "proposal_rejected":
      return "Proposal Rejected";
    case "new_message":
      return "New Message";
    case "contract_completed":
      return "Contract Completed";
    case "review_received":
      return "New Review";
    default:
      return "GigFlow Notification";
  }
};

export const serializeNotification = (doc: INotificationDocument) => ({
  _id: doc._id.toString(),
  id: doc._id.toString(),
  recipient: doc.recipient.toString(),
  type: doc.type,
  message: doc.message,
  relatedId: doc.relatedId ? doc.relatedId.toString() : null,
  read: doc.read,
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString(),
});

export const createNotification = async (
  recipient: string | any,
  type: NotificationType,
  message: string,
  relatedId?: string
) => {
  const recipientStr =
    typeof recipient === "object" && recipient !== null
      ? (recipient._id?.toString() ?? recipient.toString())
      : String(recipient);

  const notification = await NotificationModel.create({
    recipient: new mongoose.Types.ObjectId(recipientStr),
    type,
    message,
    relatedId: relatedId ? new mongoose.Types.ObjectId(relatedId) : null,
    read: false,
  });

  const serialized = serializeNotification(notification);

  // Safely emit to the recipient's personal socket room if Socket.IO is initialized
  try {
    const io = getIO();
    if (io) {
      io.to(`user:${recipient}`).emit("notification", serialized);
    }
  } catch (err) {
    // Socket.IO may not be initialized (e.g. during standalone unit tests)
  }

  // Safely trigger push notification via FCM
  try {
    const title = getPushTitle(type);
    sendPushNotification(recipientStr, title, message, {
      type,
      relatedId: relatedId ? String(relatedId) : "",
    }).catch(() => {});
  } catch (err) {
    // Push notification failure should never break notification creation
  }

  return serialized;
};

export const getNotifications = async (userId: string, limit: number = 20) => {
  const notifications = await NotificationModel.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(limit);

  return notifications.map(serializeNotification);
};

export const getUnreadCount = async (userId: string) => {
  const count = await NotificationModel.countDocuments({
    recipient: userId,
    read: false,
  });

  return { unreadCount: count };
};

export const markAsRead = async (userId: string, notificationId: string) => {
  if (!mongoose.isValidObjectId(notificationId)) {
    throw new HttpError(404, "Notification not found", {
      code: ErrorCodes.NOT_FOUND,
    });
  }

  const notification = await NotificationModel.findById(notificationId);
  if (!notification) {
    throw new HttpError(404, "Notification not found", {
      code: ErrorCodes.NOT_FOUND,
    });
  }

  if (notification.recipient.toString() !== userId) {
    throw new HttpError(403, "You cannot access this notification", {
      code: ErrorCodes.AUTH_FORBIDDEN,
    });
  }

  notification.read = true;
  await notification.save();

  return serializeNotification(notification);
};

export const markAllAsRead = async (userId: string) => {
  await NotificationModel.updateMany(
    { recipient: userId, read: false },
    { $set: { read: true } }
  );

  return { message: "All notifications marked as read" };
};
