import { z } from "zod";

export const sendMessageDto = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Message content cannot be empty")
    .max(2000, "Message content cannot exceed 2000 characters"),
});

export type SendMessageDto = z.infer<typeof sendMessageDto>;
