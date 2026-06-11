export type UserRole = "freelancer" | "client";

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  password: string;
}
