import { NextFunction, Request, Response } from "express";
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUserById,
  listAdminUsers,
  updateAdminUser,
} from "../services/admin-user.service";
import { sendSuccess } from "../utils/api-response";

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await listAdminUsers(req.query);
    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getAdminUserById(req.params.id as string);
    sendSuccess(res, 200, "User fetched successfully", user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await createAdminUser(req.body);
    sendSuccess(res, 201, "User created successfully", user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await updateAdminUser(req.params.id as string, req.body);
    sendSuccess(res, 200, "User updated successfully", user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await deleteAdminUser(req.params.id as string);
    sendSuccess(res, 200, "User deleted successfully", result);
  } catch (error) {
    next(error);
  }
};

