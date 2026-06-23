import { AuthUserResponse } from "../utils/user.mapper";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserResponse;
      userId?: string;
    }
  }
}

export {};
