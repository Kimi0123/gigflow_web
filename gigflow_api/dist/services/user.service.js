"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_dto_1 = require("../dtos/user.dto");
const http_error_1 = require("../errors/http-error");
const user_model_1 = require("../models/user.model");
const createSafeUser = (user) => ({
    id: String(user._id),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
});
const registerUser = async (payload) => {
    const validated = user_dto_1.registerUserDto.parse(payload);
    const existingUser = await user_model_1.UserModel.findOne({ email: validated.email });
    if (existingUser) {
        throw new http_error_1.HttpError(409, "An account with this email already exists");
    }
    const hashedPassword = await bcryptjs_1.default.hash(validated.password, 12);
    const user = await user_model_1.UserModel.create({
        ...validated,
        password: hashedPassword,
    });
    return createSafeUser(user);
};
exports.registerUser = registerUser;
const loginUser = async (payload) => {
    const validated = user_dto_1.loginUserDto.parse(payload);
    const user = await user_model_1.UserModel.findOne({ email: validated.email }).select("+password");
    if (!user) {
        throw new http_error_1.HttpError(401, "Invalid email or password");
    }
    const passwordMatches = await bcryptjs_1.default.compare(validated.password, user.password);
    if (!passwordMatches) {
        throw new http_error_1.HttpError(401, "Invalid email or password");
    }
    const tokenOptions = {
        expiresIn: (process.env.JWT_EXPIRES_IN || "7d"),
    };
    const token = jsonwebtoken_1.default.sign({
        id: String(user._id),
        email: user.email,
        role: user.role,
    }, process.env.JWT_SECRET || "gigflow_dev_secret", tokenOptions);
    return {
        token,
        user: createSafeUser(user),
    };
};
exports.loginUser = loginUser;
//# sourceMappingURL=user.service.js.map