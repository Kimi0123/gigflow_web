import { Response } from "express";
import { ErrorCode } from "../errors/error-codes";
import { FieldError } from "../errors/http-error";

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export type ErrorResponseBody = {
  success: false;
  message: string;
  code: ErrorCode;
  errors?: FieldError[];
};

export const buildErrorResponse = (
  message: string,
  code: ErrorCode,
  errors?: FieldError[],
): ErrorResponseBody => ({
  success: false,
  message,
  code,
  ...(errors?.length ? { errors } : {}),
});
