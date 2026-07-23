import { z } from "zod";

export const createReviewDto = z.object({
  rating: z.coerce
    .number()
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  comment: z
    .string()
    .trim()
    .min(1, "Comment is required")
    .max(1000, "Comment cannot exceed 1000 characters"),
});

export type CreateReviewInput = z.infer<typeof createReviewDto>;
