import { NextFunction, Request, Response } from "express";
import {
  deleteUserById,
  getCurrentUser,
  loginUser,
  refreshAccessToken,
  registerFcmToken,
  registerUser,
  requestPasswordReset,
  resetPassword,
  updateUserPassword,
  updateUserProfile,
  verifyResetCode,
} from "../services/user.service";
import { sendSuccess } from "../utils/api-response";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await registerUser(req.body);
    sendSuccess(res, 201, "User registered successfully", user);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await loginUser(req.body);
    sendSuccess(res, 200, "Login successful", result);
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getCurrentUser(req.userId!);
    sendSuccess(res, 200, "Profile fetched successfully", user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const profilePicFile = files?.profilePicture?.[0] || req.file;
    const cvFile = files?.cv?.[0];

    const profilePicture = profilePicFile
      ? `/uploads/profiles/${profilePicFile.filename}`
      : undefined;
    const cvUrl = cvFile ? `/uploads/cvs/${cvFile.filename}` : undefined;

    const user = await updateUserProfile(req.userId!, {
      ...req.body,
      ...(profilePicture ? { profilePicture } : {}),
      ...(cvUrl ? { cvUrl } : {}),
    });
    sendSuccess(res, 200, "Profile updated successfully", user);
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await updateUserPassword(req.userId!, req.body);
    sendSuccess(res, 200, "Password updated successfully", user);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await refreshAccessToken(req.userId!);
    sendSuccess(res, 200, "Token refreshed successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.params.id as string;
    const user = await getCurrentUser(userId);
    sendSuccess(res, 200, "User fetched successfully", user);
  } catch (error) {
    next(error);
  }
};

export const updateUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.params.id as string;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const profilePicFile = files?.profilePicture?.[0] || req.file;
    const cvFile = files?.cv?.[0];

    const profilePicture = profilePicFile
      ? `/uploads/profiles/${profilePicFile.filename}`
      : undefined;
    const cvUrl = cvFile ? `/uploads/cvs/${cvFile.filename}` : undefined;

    const user = await updateUserProfile(userId, {
      ...req.body,
      ...(profilePicture ? { profilePicture } : {}),
      ...(cvUrl ? { cvUrl } : {}),
    });
    sendSuccess(res, 200, "User updated successfully", user);
  } catch (error) {
    next(error);
  }
};

export const deleteUserByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.params.id as string;
    await deleteUserById(userId);

    sendSuccess(res, 200, "User deleted successfully", {
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await requestPasswordReset(req.body);
    sendSuccess(
      res,
      200,
      "If an account with that email exists, a reset link has been sent",
      {},
    );
  } catch (error) {
    next(error);
  }
};

export const verifyResetCodeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await verifyResetCode(req.body);
    sendSuccess(res, 200, "Reset code is valid", {});
  } catch (error) {
    next(error);
  }
};

export const resetPasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await resetPassword(req.body);
    sendSuccess(res, 200, "Password reset successfully", {});
  } catch (error) {
    next(error);
  }
};

export const registerFcmTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = req.body || {};
    const result = await registerFcmToken(req.userId!, token);
    sendSuccess(res, 200, "FCM token registered successfully", result);
  } catch (error) {
    next(error);
  }
};


