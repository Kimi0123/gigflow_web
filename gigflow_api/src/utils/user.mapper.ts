import { IUserDocument } from "../models/user.model";
import { UserRole } from "../types/user.type";

export type AuthUserResponse = {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  profilePicture?: string;
  averageRating: number;
  totalReviews: number;
};

export const toAuthUserResponse = (
  user: IUserDocument,
  ratingSummary: { averageRating: number; totalReviews: number } = {
    averageRating: 0,
    totalReviews: 0,
  }
): AuthUserResponse => {
  const id = user._id.toString();

  return {
    _id: id,
    id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    averageRating: ratingSummary.averageRating,
    totalReviews: ratingSummary.totalReviews,
    ...(user.profilePicture ? { profilePicture: user.profilePicture } : {}),
  };
};
