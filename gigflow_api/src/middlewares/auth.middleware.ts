import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/env";
import { ErrorCodes } from "../errors/error-codes";
import { HttpError } from "../errors/http-error";
import { UserModel } from "../models/user.model";
import { toAuthUserResponse } from "../utils/user.mapper";

type AccessTokenPayload = {
  sub: string;
  role: string;
};

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new HttpError(401, "Authentication required", {
        code: ErrorCodes.AUTH_UNAUTHORIZED,
      });
    }

    const token = authHeader.slice("Bearer ".length).trim();

    if (!token) {
      throw new HttpError(401, "Authentication required", {
        code: ErrorCodes.AUTH_UNAUTHORIZED,
      });
    }

    const payload = jwt.verify(token, getJwtSecret()) as AccessTokenPayload;
    const user = await UserModel.findById(payload.sub);

    if (!user) {
      throw new HttpError(401, "User account no longer exists", {
        code: ErrorCodes.AUTH_UNAUTHORIZED,
      });
    }

    req.userId = payload.sub;
    req.user = toAuthUserResponse(user);
    next();
  } catch (error) {
    if (error instanceof HttpError) {
      return next(error);
    }

    if (error instanceof jwt.TokenExpiredError) {
      return next(
        new HttpError(401, "Session expired. Please sign in again", {
          code: ErrorCodes.AUTH_TOKEN_EXPIRED,
        }),
      );
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return next(
        new HttpError(401, "Invalid authentication token", {
          code: ErrorCodes.AUTH_TOKEN_INVALID,
        }),
      );
    }

    next(error);
  }
};

export const authorized = authenticate;

export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== "admin") {
    return next(
      new HttpError(403, "Admin privileges are required", {
        code: ErrorCodes.AUTH_FORBIDDEN,
      }),
    );
  }

  next();
};
