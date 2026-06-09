"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const zod_1 = require("zod");
const http_error_1 = require("../errors/http-error");
const errorMiddleware = (error, _req, res, _next) => {
    if (error instanceof zod_1.ZodError) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
    }
    if (error instanceof http_error_1.HttpError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
    }
    console.error(error);
    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};
exports.errorMiddleware = errorMiddleware;
//# sourceMappingURL=error.middleware.js.map