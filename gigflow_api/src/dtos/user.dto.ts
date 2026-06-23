import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Password must include at least one letter")
  .regex(/[0-9]/, "Password must include at least one number");

export const registerUserDto = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(80, "First name must be 80 characters or fewer"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(80, "Last name must be 80 characters or fewer"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),
  role: z.enum(["freelancer", "client"], {
    error: "Choose whether you want to find work or hire talent",
  }),
  phoneNumber: z
    .string()
    .trim()
    .min(5, "Phone number must be at least 5 characters")
    .max(20, "Phone number must be 20 characters or fewer"),
  profilePicture: z
    .string()
    .trim()
    .max(255, "Profile picture URL must be 255 characters or fewer")
    .optional(),
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

export const updateProfileDto = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters")
      .max(80, "First name must be 80 characters or fewer")
      .optional(),
    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters")
      .max(80, "Last name must be 80 characters or fewer")
      .optional(),
    phoneNumber: z
      .string()
      .trim()
      .min(5, "Phone number must be at least 5 characters")
      .max(20, "Phone number must be 20 characters or fewer")
      .optional(),
    profilePicture: z
      .string()
      .trim()
      .max(255, "Profile picture URL must be 255 characters or fewer")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update your profile",
  });

export type UpdateProfileDto = z.infer<typeof updateProfileDto>;

export const updatePasswordDto = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type UpdatePasswordDto = z.infer<typeof updatePasswordDto>;
