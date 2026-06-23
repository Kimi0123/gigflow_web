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
};

export const toAuthUserResponse = (user: IUserDocument): AuthUserResponse => {
  const id = user._id.toString();

  return {
    _id: id,
    id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    ...(user.profilePicture ? { profilePicture: user.profilePicture } : {}),
  };
};
