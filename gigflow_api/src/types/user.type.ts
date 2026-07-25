export type UserRole = "freelancer" | "client" | "admin";

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phoneNumber: string;
  profilePicture?: string;
  bio?: string;
  title?: string;
  skills?: string[];
  cvUrl?: string;
  resetPasswordTokenHash?: string;
  resetPasswordExpires?: Date;
}