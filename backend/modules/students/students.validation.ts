import { z } from "zod";

export const createStudentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  studentId: z.string().min(1, "Student ID cannot be empty").optional(),
  admissionDate: z.coerce.date().optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  bloodGroup: z.string().optional(),
  presentAddress: z.string().optional(),
  permanentAddress: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  guardianPhone: z.string().optional(),
  photo: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ALUMNI"]).optional(),

  // Enrollment info
  academicYearId: z.number().int(),
  classId: z.number().int(),
  sectionId: z.number().int(),
  rollNumber: z.string().optional(),
});

export const updateStudentSchema = createStudentSchema.partial().omit({
  academicYearId: true,
  classId: true,
  sectionId: true,
  rollNumber: true,
});

export const createStudentEnrollmentSchema = z.object({
  studentId: z.number().int().positive(),
  academicYearId: z.number().int().positive(),
  classId: z.number().int().positive(),
  sectionId: z.number().int().positive(),
  rollNumber: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const updateStudentEnrollmentSchema = createStudentEnrollmentSchema
  .partial()
  .omit({ studentId: true });
