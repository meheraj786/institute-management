import { z } from "zod";

export const createTeacherSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  employeeId: z.string().optional(),
  joiningDate: z.coerce.date().optional(),
  designation: z.string().optional(),
  qualification: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const updateTeacherSchema = createTeacherSchema.partial();

export const createTeacherAssignmentSchema = z.object({
  teacherId: z.number().int().positive(),
  classId: z.number().int().positive(),
  sectionId: z.number().int().positive(),
  subjectId: z.number().int().positive(),
  academicYearId: z.number().int().positive(),
});

export const updateTeacherAssignmentSchema =
  createTeacherAssignmentSchema.partial();
