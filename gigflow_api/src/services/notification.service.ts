import mongoose from "mongoose";
import { ErrorCodes } from "../errors/error-codes";
import { HttpError } from "../errors/http-error";
import {
  INotificationDocument,
  NotificationModel,
  NotificationType,
} from "../models/notification.model";
import { getIO } from "../socket";

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
  recipient: string,
  type: NotificationType,
  message: string,
  relatedId?: string
) => {
  const notification = await NotificationModel.create({
    recipient: new mongoose.Types.ObjectId(recipient),
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
