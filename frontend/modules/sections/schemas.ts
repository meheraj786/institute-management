import { z } from "zod";

export const sectionSchema = z.object({
  name: z.string().min(1, "Enter a section name"),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});
export const updateSectionSchema = sectionSchema.partial();
export type SectionInput = z.infer<typeof sectionSchema>;
