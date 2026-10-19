import { z } from "zod";

export const subjectSchema = z.object({
  name: z.string().min(1, "Enter a subject name"),
  code: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});
export const updateSubjectSchema = subjectSchema.partial();
export const classSubjectSchema = z.object({
  classId: z.coerce.number().int().positive(),
  subjectId: z.coerce.number().int().positive(),
  academicYearId: z.coerce.number().int().positive(),
});
export const updateClassSubjectSchema = classSubjectSchema.partial();
export type SubjectInput = z.infer<typeof subjectSchema>;
export type ClassSubjectInput = z.infer<typeof classSubjectSchema>;
