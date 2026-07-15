import { z } from "zod";

// ─── Job DTOs ──────────────────────────────────────────────────────────────────
export const createJobDto = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().trim().min(50, "Description must be at least 50 characters"),
  category: z.string().trim().min(1, "Category is required"),
  budgetType: z.enum(["fixed", "hourly"]),
  budgetMin: z.coerce.number().min(1, "Budget minimum must be greater than 0"),
  budgetMax: z.coerce.number().optional(),
  skills: z.array(z.string().trim()).optional().default([]),
  duration: z.string().trim().min(1, "Duration is required"),
  status: z.enum(["open", "draft"]).default("open"),
});

export const updateJobDto = createJobDto.partial().extend({
  status: z.enum(["open", "closed", "draft"]).optional(),
});

// ─── Proposal DTOs ────────────────────────────────────────────────────────────
export const createProposalDto = z.object({
  coverLetter: z.string().trim().min(50, "Cover letter must be at least 50 characters"),
  bidAmount: z.coerce.number().min(1, "Bid amount must be greater than 0"),
  deliveryTime: z.string().trim().min(1, "Delivery time is required"),
});

export const updateProposalStatusDto = z.object({
  status: z.enum(["accepted", "rejected", "withdrawn"]),
});

export type CreateJobInput = z.infer<typeof createJobDto>;
export type UpdateJobInput = z.infer<typeof updateJobDto>;
export type CreateProposalInput = z.infer<typeof createProposalDto>;
export type UpdateProposalStatusInput = z.infer<typeof updateProposalStatusDto>;
