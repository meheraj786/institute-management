import { z } from "zod";

const attendanceEntrySchema = z.object({
  studentId: z.coerce.number().int().positive(),
  status: z.enum(["PRESENT", "ABSENT", "LATE"]),
  remarks: z.string().optional(),
});
export const attendanceSchema = z.object({
  studentId: z.coerce.number().int().positive(),
  academicYearId: z.coerce.number().int().positive(),
  classId: z.coerce.number().int().positive(),
  sectionId: z.coerce.number().int().positive(),
  date: z.coerce.date(),
  status: z.enum(["PRESENT", "ABSENT", "LATE"]),
  remarks: z.string().optional(),
});
export const updateAttendanceSchema = attendanceSchema.partial();
export const bulkAttendanceSchema = z.object({
  academicYearId: z.coerce.number().int().positive(),
  classId: z.coerce.number().int().positive(),
  sectionId: z.coerce.number().int().positive(),
  date: z.coerce.date(),
  attendances: z
    .array(attendanceEntrySchema)
    .min(1)
    .refine(
      (items) =>
        new Set(items.map((item) => item.studentId)).size === items.length,
      "A student can only appear once",
    ),
});
export type AttendanceInput = z.infer<typeof attendanceSchema>;
export type BulkAttendanceInput = z.infer<typeof bulkAttendanceSchema>;
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";
