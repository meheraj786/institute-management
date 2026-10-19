import { z } from "zod";

export const createSectionSchema = z.object({
  name: z.string().min(1, "Section name is required"),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const updateSectionSchema = createSectionSchema.partial();