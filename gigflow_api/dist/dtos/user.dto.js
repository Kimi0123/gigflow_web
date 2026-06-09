"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUserDto = exports.registerUserDto = void 0;
const zod_1 = require("zod");
const passwordSchema = zod_1.z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must include at least one letter")
    .regex(/[0-9]/, "Password must include at least one number");
exports.registerUserDto = zod_1.z.object({
    fullName: zod_1.z
        .string()
        .trim()
        .min(2, "Full name must be at least 2 characters")
        .max(80, "Full name must be 80 characters or fewer"),
    email: zod_1.z
        .string()
        .trim()
        .toLowerCase()
        .email("Please enter a valid email address"),
    role: zod_1.z.enum(["freelancer", "client"], {
        error: "Choose whether you want to find work or hire talent",
    }),
    password: passwordSchema,
});
exports.loginUserDto = zod_1.z.object({
    email: zod_1.z
        .string()
        .trim()
        .toLowerCase()
        .email("Please enter a valid email address"),
    password: zod_1.z.string().min(1, "Password is required"),
});
//# sourceMappingURL=user.dto.js.map