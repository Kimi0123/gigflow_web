import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Password must include at least one letter")
  .regex(/[0-9]/, "Password must include at least one number");

export const registerUserDto = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Full name must be 80 characters or fewer"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),
  role: z.enum(["freelancer", "client"], {
    error: "Choose whether you want to find work or hire talent",
  }),
  password: passwordSchema,
});

export const loginUserDto = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterUserDto = z.infer<typeof registerUserDto>;
export type LoginUserDto = z.infer<typeof loginUserDto>;
