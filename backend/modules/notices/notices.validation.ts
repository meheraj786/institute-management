import { z } from "zod";

export const createNoticeSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().min(5, "Description is required"),
  publishDate: z.coerce.date(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const updateNoticeSchema = createNoticeSchema.partial();
