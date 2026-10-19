import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  code: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export const createClassSubjectSchema = z.object({
  classId: z.number().int().positive(),
  subjectId: z.number().int().positive(),
  academicYearId: z.number().int().positive(),
});

export const updateClassSubjectSchema = createClassSubjectSchema.partial();
