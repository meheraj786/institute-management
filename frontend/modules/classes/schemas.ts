import { z } from "zod";

export const classSchema = z.object({
  name: z.string().min(1, "Enter a class name"),
  numericValue: z.coerce.number().int().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});
export const updateClassSchema = classSchema.partial();
export const classSectionSchema = z.object({
  classId: z.coerce.number().int().positive(),
  sectionId: z.coerce.number().int().positive(),
  academicYearId: z.coerce.number().int().positive(),
});
export const updateClassSectionSchema = classSectionSchema.partial();
export type ClassInput = z.infer<typeof classSchema>;
export type ClassSectionInput = z.infer<typeof classSectionSchema>;
