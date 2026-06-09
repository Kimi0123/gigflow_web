import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { loginUserDto, registerUserDto } from "../dtos/user.dto";
import { HttpError } from "../errors/http-error";
import { UserModel } from "../models/user.model";

const createSafeUser = (user: {
  _id: unknown;
  fullName: string;
  email: string;
  role: string;
}) => ({
  id: String(user._id),
  fullName: user.fullName,
  email: user.email,
  role: user.role,
});

export const registerUser = async (payload: unknown) => {
  const validated = registerUserDto.parse(payload);

  const existingUser = await UserModel.findOne({ email: validated.email });

  if (existingUser) {
    throw new HttpError(409, "An account with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(validated.password, 12);

  const user = await UserModel.create({
    ...validated,
    password: hashedPassword,
  });

  return createSafeUser(user);
};

export const loginUser = async (payload: unknown) => {
  const validated = loginUserDto.parse(payload);

  const user = await UserModel.findOne({ email: validated.email }).select(
    "+password"
  );

  if (!user) {
    throw new HttpError(401, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(
    validated.password,
    user.password
  );

  if (!passwordMatches) {
    throw new HttpError(401, "Invalid email or password");
  }

  const tokenOptions: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"],
  };

  const token = jwt.sign(
    {
      id: String(user._id),
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || "gigflow_dev_secret",
    tokenOptions
  );

  return {
    token,
    user: createSafeUser(user),
  };
};
