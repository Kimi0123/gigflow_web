import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { getJwtExpiresIn, getJwtSecret } from "../config/env";
import {
  loginUserDto,
  registerUserDto,
  updatePasswordDto,
  updateProfileDto,
} from "../dtos/user.dto";
import { ErrorCodes } from "../errors/error-codes";
import { HttpError } from "../errors/http-error";
import { IUserDocument, UserModel } from "../models/user.model";
import { AuthUserResponse, toAuthUserResponse } from "../utils/user.mapper";

const SALT_ROUNDS = 10;

const signAccessToken = (user: IUserDocument): string => {
  const options: SignOptions = {
    expiresIn: getJwtExpiresIn() as SignOptions["expiresIn"],
  };

  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    getJwtSecret(),
    options,
  );
};

export const registerUser = async (
  input: unknown,
): Promise<AuthUserResponse> => {
  const data = registerUserDto.parse(input);

  const existingUser = await UserModel.findOne({
    $or: [{ email: data.email }, { phoneNumber: data.phoneNumber }],
  });

  if (existingUser) {
    if (existingUser.email === data.email) {
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
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await UserModel.create({
    ...data,
    password: hashedPassword,
  });

  return toAuthUserResponse(user);
};

export const loginUser = async (
  input: unknown,
): Promise<{ token: string; user: AuthUserResponse }> => {
  const data = loginUserDto.parse(input);

  const user = await UserModel.findOne({ email: data.email }).select(
    "+password",
  );

  if (!user) {
    throw new HttpError(401, "Invalid email or password", {
      code: ErrorCodes.AUTH_INVALID_CREDENTIALS,
    });
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) {
    throw new HttpError(401, "Invalid email or password", {
      code: ErrorCodes.AUTH_INVALID_CREDENTIALS,
    });
  }

  return {
    token: signAccessToken(user),
    user: toAuthUserResponse(user),
  };
};

export const getCurrentUser = async (
  userId: string,
): Promise<AuthUserResponse> => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new HttpError(404, "User not found", {
      code: ErrorCodes.NOT_FOUND,
    });
  }

  return toAuthUserResponse(user);
};

export const updateUserProfile = async (
  userId: string,
  input: unknown,
): Promise<AuthUserResponse> => {
  const data = updateProfileDto.parse(input);

  if (data.phoneNumber) {
    const existingPhone = await UserModel.findOne({
      _id: { $ne: userId },
      phoneNumber: data.phoneNumber,
    });

    if (existingPhone) {
      throw new HttpError(409, "Phone number is already registered", {
        code: ErrorCodes.CONFLICT,
        errors: [
          {
            field: "phoneNumber",
            message: "Phone number is already registered",
          },
        ],
      });
    }
  }

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $set: data },
    { new: true, runValidators: true },
  );

  if (!user) {
    throw new HttpError(404, "User not found", {
      code: ErrorCodes.NOT_FOUND,
    });
  }

  return toAuthUserResponse(user);
};

export const updateUserPassword = async (
  userId: string,
  input: unknown,
): Promise<AuthUserResponse> => {
  const data = updatePasswordDto.parse(input);

  const user = await UserModel.findById(userId).select("+password");

  if (!user) {
    throw new HttpError(404, "User not found", {
      code: ErrorCodes.NOT_FOUND,
    });
  }

  const isPasswordValid = await bcrypt.compare(
    data.currentPassword,
    user.password,
  );

  if (!isPasswordValid) {
    throw new HttpError(401, "Current password is incorrect", {
      code: ErrorCodes.AUTH_INVALID_CREDENTIALS,
    });
  }

  user.password = await bcrypt.hash(data.newPassword, SALT_ROUNDS);
  await user.save();

  return toAuthUserResponse(user);
};

export const deleteUserById = async (userId: string): Promise<boolean> => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new HttpError(404, "User not found", {
      code: ErrorCodes.NOT_FOUND,
    });
  }

  await UserModel.findByIdAndDelete(userId);
  return true;
};

export const refreshAccessToken = async (
  userId: string,
): Promise<{ token: string; user: AuthUserResponse }> => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new HttpError(401, "User account no longer exists", {
      code: ErrorCodes.AUTH_UNAUTHORIZED,
    });
  }

  return {
    token: signAccessToken(user),
    user: toAuthUserResponse(user),
  };
};
