import { z } from "zod";

export const studentSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  studentId: z.string().min(1).optional(),
  admissionDate: z.coerce.date().optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  bloodGroup: z.string().optional(),
  presentAddress: z.string().optional(),
  permanentAddress: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  guardianPhone: z.string().optional(),
  photo: z.url().optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE", "ALUMNI"]).optional(),
  academicYearId: z.coerce.number().int().positive(),
  classId: z.coerce.number().int().positive(),
  sectionId: z.coerce.number().int().positive(),
  rollNumber: z.string().optional(),
});
export const updateStudentSchema = studentSchema.partial().omit({
  academicYearId: true,
  classId: true,
  sectionId: true,
  rollNumber: true,
});
export const studentEnrollmentSchema = z.object({
  studentId: z.coerce.number().int().positive(),
  academicYearId: z.coerce.number().int().positive(),
  classId: z.coerce.number().int().positive(),
  sectionId: z.coerce.number().int().positive(),
  rollNumber: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});
export const updateStudentEnrollmentSchema = studentEnrollmentSchema
  .partial()
  .omit({ studentId: true });
export type StudentInput = z.infer<typeof studentSchema>;
export type StudentEnrollmentInput = z.infer<typeof studentEnrollmentSchema>;
