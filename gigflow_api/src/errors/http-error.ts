import { ErrorCode, ErrorCodes } from "./error-codes";

export type FieldError = {
  field: string;
  message: string;
};

type HttpErrorOptions = {
  code?: ErrorCode;
  errors?: FieldError[];
};

export class HttpError extends Error {
  statusCode: number;
  code: ErrorCode;
  errors?: FieldError[];

  constructor(
    statusCode: number,
    message: string,
    options: HttpErrorOptions = {},
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = options.code ?? HttpError.defaultCode(statusCode);
    this.errors = options.errors;
  }

  private static defaultCode(statusCode: number): ErrorCode {
    switch (statusCode) {
      case 400:
        return ErrorCodes.BAD_REQUEST;
      case 401:
        return ErrorCodes.AUTH_UNAUTHORIZED;
      case 404:
        return ErrorCodes.NOT_FOUND;
      case 409:
        return ErrorCodes.CONFLICT;
      default:
        return ErrorCodes.INTERNAL_ERROR;
    }
  }
}
