import { z } from "zod";

export const noticeSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(5),
  publishDate: z.coerce.date(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});
export const updateNoticeSchema = noticeSchema.partial();
export type NoticeInput = z.infer<typeof noticeSchema>;
