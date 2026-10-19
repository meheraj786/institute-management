import { z } from "zod";

export const teacherSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  employeeId: z.string().optional(),
  joiningDate: z.coerce.date().optional(),
  designation: z.string().optional(),
  qualification: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});
export const updateTeacherSchema = teacherSchema.partial();
export const teacherAssignmentSchema = z.object({
  teacherId: z.coerce.number().int().positive(),
  classId: z.coerce.number().int().positive(),
  sectionId: z.coerce.number().int().positive(),
  subjectId: z.coerce.number().int().positive(),
  academicYearId: z.coerce.number().int().positive(),
});
export const updateTeacherAssignmentSchema = teacherAssignmentSchema.partial();
export type TeacherInput = z.infer<typeof teacherSchema>;
export type TeacherAssignmentInput = z.infer<typeof teacherAssignmentSchema>;
