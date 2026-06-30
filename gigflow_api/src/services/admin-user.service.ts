import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import {
  adminUserCreateDto,
  adminUserListQueryDto,
  adminUserUpdateDto,
} from "../dtos/user.dto";
import { ErrorCodes } from "../errors/error-codes";
import { HttpError } from "../errors/http-error";
import { IUserDocument, UserModel } from "../models/user.model";
import { UserRole } from "../types/user.type";

const SALT_ROUNDS = 10;

type AdminUserResponse = {
  id: string;
  _id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
};

type PaginatedAdminUsers = {
  data: AdminUserResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const toAdminUserResponse = (user: IUserDocument): AdminUserResponse => {
  const id = user._id.toString();

  return {
    id,
    _id: id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    ...(user.profilePicture ? { profilePicture: user.profilePicture } : {}),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
};

const assertValidUserId = (userId: string) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new HttpError(400, "Invalid user identifier", {
      code: ErrorCodes.BAD_REQUEST,
      errors: [{ field: "id", message: "Invalid user identifier" }],
    });
  }
};

const buildDuplicateQuery = (data: { email?: string; phoneNumber?: string }, excludeId?: string) => {
  const conditions = [];

  if (data.email) conditions.push({ email: data.email });
  if (data.phoneNumber) conditions.push({ phoneNumber: data.phoneNumber });

  if (!conditions.length) return null;

  return {
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    $or: conditions,
  };
};

const assertUniqueUserFields = async (
  data: { email?: string; phoneNumber?: string },
  excludeId?: string,
) => {
  const query = buildDuplicateQuery(data, excludeId);
  if (!query) return;

  const existingUser = await UserModel.findOne(query);
  if (!existingUser) return;

  if (data.email && existingUser.email === data.email) {
    throw new HttpError(409, "Email is already registered", {
      code: ErrorCodes.CONFLICT,
      errors: [{ field: "email", message: "Email is already registered" }],
    });
  }

  throw new HttpError(409, "Phone number is already registered", {
    code: ErrorCodes.CONFLICT,
    errors: [
      {
        field: "phoneNumber",
        message: "Phone number is already registered",
      },
    ],
  });
};

export const listAdminUsers = async (input: unknown): Promise<PaginatedAdminUsers> => {
  const { page, limit, search } = adminUserListQueryDto.parse(input);
  const skip = (page - 1) * limit;
  const trimmedSearch = search.trim();
  const filter = trimmedSearch
    ? {
        $or: [
          { firstName: { $regex: trimmedSearch, $options: "i" } },
          { lastName: { $regex: trimmedSearch, $options: "i" } },
          { email: { $regex: trimmedSearch, $options: "i" } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    UserModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    UserModel.countDocuments(filter),
  ]);

  return {
    data: users.map(toAdminUserResponse),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getAdminUserById = async (userId: string): Promise<AdminUserResponse> => {
  assertValidUserId(userId);

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new HttpError(404, "User not found", { code: ErrorCodes.NOT_FOUND });
  }

  return toAdminUserResponse(user);
};

export const createAdminUser = async (input: unknown): Promise<AdminUserResponse> => {
  const data = adminUserCreateDto.parse(input);
  await assertUniqueUserFields(data);

  const user = await UserModel.create({
    ...data,
    password: await bcrypt.hash(data.password, SALT_ROUNDS),
  });

  return toAdminUserResponse(user);
};

export const updateAdminUser = async (
  userId: string,
  input: unknown,
): Promise<AdminUserResponse> => {
  assertValidUserId(userId);
  const data = adminUserUpdateDto.parse(input);
  await assertUniqueUserFields(data, userId);

  const updateData = {
    ...data,
    ...(data.password ? { password: await bcrypt.hash(data.password, SALT_ROUNDS) } : {}),
  };

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true },
  );

  if (!user) {
    throw new HttpError(404, "User not found", { code: ErrorCodes.NOT_FOUND });
  }

  return toAdminUserResponse(user);
};

export const deleteAdminUser = async (userId: string): Promise<{ id: string }> => {
  assertValidUserId(userId);

  const user = await UserModel.findByIdAndDelete(userId);
  if (!user) {
    throw new HttpError(404, "User not found", { code: ErrorCodes.NOT_FOUND });
  }

  return { id: userId };
};
