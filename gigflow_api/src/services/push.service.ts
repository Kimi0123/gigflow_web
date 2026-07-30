import fs from "fs";
import path from "path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { getFirebaseConfig } from "../config/env";
import { UserModel } from "../models/user.model";

// Initialize Firebase Admin once (guarded against hot-reload re-initialization)
export const initFirebase = () => {
  if (getApps().length > 0) {
    return;
  }

  try {
    const { serviceAccountPath } = getFirebaseConfig();
    if (!serviceAccountPath) {
      console.warn("[PushService] FIREBASE_SERVICE_ACCOUNT_PATH not set. Push notifications will be skipped.");
      return;
    }

    const resolvedPath = path.isAbsolute(serviceAccountPath)
      ? serviceAccountPath
      : path.resolve(process.cwd(), serviceAccountPath);

    if (!fs.existsSync(resolvedPath)) {
      console.warn(`[PushService] Service account file not found at ${resolvedPath}. Push notifications disabled.`);
      return;
    }

    const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
    initializeApp({
      credential: cert(serviceAccount),
    });
    console.log("[PushService] Firebase Admin SDK initialized successfully.");
  } catch (error: any) {
    console.error("[PushService] Failed to initialize Firebase Admin SDK:", error?.message || error);
  }
};

initFirebase();

export const sendPushNotification = async (
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> => {
  try {
    if (getApps().length === 0) {
      initFirebase();
    }

    const user = await UserModel.findById(userId);
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      // User has no FCM tokens registered, skip silently
      return;
    }

    if (getApps().length === 0) {
      console.warn("[PushService] Firebase Admin not initialized. Skipping push notification.");
      return;
    }

    const cleanData = data
      ? Object.entries(data).reduce<Record<string, string>>((acc, [k, v]) => {
          if (v !== undefined && v !== null) acc[k] = String(v);
          return acc;
        }, {})
      : undefined;

    const response = await getMessaging().sendEachForMulticast({
      tokens: user.fcmTokens,
      notification: {
        title,
        body,
      },
      data: cleanData,
    });

    console.log(
      `[PushService] Push notification sent to user ${userId}. Success count: ${response.successCount}, failure count: ${response.failureCount}`
    );
  } catch (error: any) {
    // Never throw — log and swallow error so notification flow is never interrupted
    console.error(`[PushService] Error sending push notification to user ${userId}:`, error?.message || error);
  }
};
