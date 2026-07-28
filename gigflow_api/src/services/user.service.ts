import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import { getClientUrl, getJwtExpiresIn, getJwtSecret } from "../config/env";
import {
  forgotPasswordDto,
  loginUserDto,
  registerUserDto,
  resetPasswordDto,
  updatePasswordDto,
  updateProfileDto,
  verifyResetCodeDto,
} from "../dtos/user.dto";
import { ErrorCodes } from "../errors/error-codes";
import { HttpError } from "../errors/http-error";
import { IUserDocument, UserModel } from "../models/user.model";
import { getUserRatingSummary } from "./review.service";
import { AuthUserResponse, toAuthUserResponse } from "../utils/user.mapper";
import { sendPasswordResetEmail } from "../utils/mailer";
import { WalletModel } from "../models/wallet.model";

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

  // Create a matching wallet with the default starting balance
  await WalletModel.create({ user: user._id });

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

  const ratingSummary = await getUserRatingSummary(user._id.toString());

  return {
    token: signAccessToken(user),
    user: toAuthUserResponse(user, ratingSummary),
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

  const ratingSummary = await getUserRatingSummary(userId);
  return toAuthUserResponse(user, ratingSummary);
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

  const ratingSummary = await getUserRatingSummary(userId);
  return toAuthUserResponse(user, ratingSummary);
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

  const ratingSummary = await getUserRatingSummary(userId);
  return toAuthUserResponse(user, ratingSummary);
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

  const ratingSummary = await getUserRatingSummary(userId);

  return {
    token: signAccessToken(user),
    user: toAuthUserResponse(user, ratingSummary),
  };
};

export const requestPasswordReset = async (input: unknown): Promise<void> => {
  const data = forgotPasswordDto.parse(input);

  const user = await UserModel.findOne({ email: data.email.toLowerCase() });

  if (user) {
    const rawCode = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = crypto
      .createHash("sha256")
      .update(rawCode)
      .digest("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordTokenHash = codeHash;
    user.resetPasswordExpires = expires;
    await user.save();

    const clientUrl = getClientUrl();
    const resetLink = `${clientUrl}/reset-password?email=${encodeURIComponent(user.email)}&code=${rawCode}`;

    await sendPasswordResetEmail(user.email, rawCode, resetLink);
  }
};

export const verifyResetCode = async (input: unknown): Promise<void> => {
  const data = verifyResetCodeDto.parse(input);

  const codeHash = crypto
    .createHash("sha256")
    .update(data.code)
    .digest("hex");

  const user = await UserModel.findOne({
    email: data.email,
    resetPasswordTokenHash: codeHash,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordTokenHash +resetPasswordExpires");

  if (!user) {
    throw new HttpError(400, "Invalid or expired reset link", {
      code: ErrorCodes.BAD_REQUEST,
    });
  }
};

export const resetPassword = async (input: unknown): Promise<void> => {
  const data = resetPasswordDto.parse(input);

  const codeHash = crypto
    .createHash("sha256")
    .update(data.code)
    .digest("hex");

  const user = await UserModel.findOne({
    email: data.email,
    resetPasswordTokenHash: codeHash,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+password +resetPasswordTokenHash +resetPasswordExpires");

  if (!user) {
    throw new HttpError(400, "Invalid or expired reset link", {
      code: ErrorCodes.BAD_REQUEST,
    });
  }

  user.password = await bcrypt.hash(data.newPassword, SALT_ROUNDS);
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
};
