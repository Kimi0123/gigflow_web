import mongoose, { Document, Schema } from "mongoose";
import { IUser, UserRole } from "../types/user.type";

export interface IUserDocument extends IUser, Document {
  role: UserRole;
  fcmTokens: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["freelancer", "client", "admin"],
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    profilePicture: {
      type: String,
      required: false,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    skills: [{ type: String, trim: true }],
    cvUrl: {
      type: String,
      trim: true,
    },
    resetPasswordTokenHash: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    fcmTokens: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel =
  (mongoose.models.User as mongoose.Model<IUserDocument>) ||
  mongoose.model<IUserDocument>("User", userSchema);
