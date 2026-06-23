import { NextFunction, Request, Response } from "express";
import {
  deleteUserById,
  getCurrentUser,
  loginUser,
  refreshAccessToken,
  registerUser,
  updateUserPassword,
  updateUserProfile,
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
    const file = req.file;
    const profilePicture = file ? `/uploads/profiles/${file.filename}` : undefined;
    const user = await updateUserProfile(req.userId!, {
      ...req.body,
      ...(profilePicture ? { profilePicture } : {}),
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
    const user = await updateUserProfile(userId, req.body);
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
