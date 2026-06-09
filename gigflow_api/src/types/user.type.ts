export type UserRole = "freelancer" | "client";

export interface IUser {
  fullName: string;
  email: string;
  role: UserRole;
  password: string;
}
