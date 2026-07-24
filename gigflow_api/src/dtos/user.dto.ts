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
    bio: z
      .string()
      .trim()
      .max(500, "Bio must be 500 characters or fewer")
      .optional(),
    title: z
      .string()
      .trim()
      .max(100, "Title must be 100 characters or fewer")
      .optional(),
    skills: z
      .union([
        z.array(z.string().trim()),
        z.string().transform((val) => {
          try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim());
          } catch {
            // ignore
          }
          return val.split(",").map((s) => s.trim()).filter(Boolean);
        }),
      ])
      .pipe(z.array(z.string().trim()).max(20, "Cannot specify more than 20 skills"))
      .optional(),
    cvUrl: z.string().trim().optional(),
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
export const adminUserCreateDto = registerUserDto.extend({
  role: z.enum(["freelancer", "client", "admin"]),
});

export const adminUserUpdateDto = z
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
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email address")
      .optional(),
    role: z.enum(["freelancer", "client", "admin"]).optional(),
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
    password: passwordSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update a user",
  });

export const adminUserListQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().default(""),
});

export type AdminUserCreateDto = z.infer<typeof adminUserCreateDto>;
export type AdminUserUpdateDto = z.infer<typeof adminUserUpdateDto>;
export type AdminUserListQueryDto = z.infer<typeof adminUserListQueryDto>;

