import { z } from "zod";

export const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  numericValue: z.number().int().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const updateClassSchema = createClassSchema.partial();

export const createClassSectionSchema = z.object({
  classId: z.number().int().positive(),
  sectionId: z.number().int().positive(),
  academicYearId: z.number().int().positive(),
});

export const updateClassSectionSchema = createClassSectionSchema.partial();
