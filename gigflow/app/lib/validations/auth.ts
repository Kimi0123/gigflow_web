import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Password must include at least one letter")
  .regex(/[0-9]/, "Password must include at least one number");

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email address"),
    role: z.enum(["freelancer", "client"], {
      error: "Choose whether you want to find work or hire talent",
    }),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptedTerms: z
      .boolean()
      .refine((value) => value, "Please accept the terms before creating an account"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean(),
});

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters"),
  phoneNumber: z
    .string()
    .trim()
    .min(5, "Phone number must be at least 5 characters")
    .max(20, "Phone number must be 20 characters or fewer"),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;
