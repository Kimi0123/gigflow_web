import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { ErrorCodes } from "../errors/error-codes";
import { HttpError } from "../errors/http-error";
import { buildErrorResponse } from "../utils/api-response";

const isDuplicateKeyError = (
  error: unknown,
): error is { code: number; keyValue?: Record<string, unknown> } =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code: number }).code === 11000;

const mapDuplicateKeyError = (error: {
  keyValue?: Record<string, unknown>;
}): HttpError => {
  const field = Object.keys(error.keyValue ?? {})[0] ?? "field";
  const label = field === "phoneNumber" ? "Phone number" : field;

  return new HttpError(409, `${label} is already registered`, {
    code: ErrorCodes.CONFLICT,
    errors: [
      {
        field,
        message: `${label} is already registered`,
      },
    ],
  });
};

export const notFoundMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  next(
    new HttpError(404, `Route ${req.method} ${req.originalUrl} not found`, {
      code: ErrorCodes.NOT_FOUND,
    }),
  );
};

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof ZodError) {
    const errors = error.issues.map((issue) => ({
      field: issue.path.join(".") || "body",
      message: issue.message,
    }));

    return res.status(400).json(
      buildErrorResponse("Validation failed", ErrorCodes.VALIDATION_ERROR, errors),
    );
  }

  if (error instanceof HttpError) {
    return res.status(error.statusCode).json(
      buildErrorResponse(error.message, error.code, error.errors),
    );
  }

  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json(
      buildErrorResponse("Invalid resource identifier", ErrorCodes.BAD_REQUEST, [
        {
          field: error.path,
          message: `Invalid ${error.path}`,
        },
      ]),
    );
  }

  if (isDuplicateKeyError(error)) {
    const duplicateError = mapDuplicateKeyError(error);

    return res.status(duplicateError.statusCode).json(
      buildErrorResponse(
        duplicateError.message,
        duplicateError.code,
        duplicateError.errors,
      ),
    );
  }

  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json(
      buildErrorResponse("Invalid JSON payload", ErrorCodes.BAD_REQUEST),
    );
  }

  console.error(error);

  return res.status(500).json(
    buildErrorResponse(
      "Something went wrong. Please try again later",
      ErrorCodes.INTERNAL_ERROR,
    ),
  );
};
