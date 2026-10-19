import { z } from "zod";

export const createAttendanceSchema = z.object({
  studentId: z.number().int(),
  academicYearId: z.number().int(),
  classId: z.number().int(),
  sectionId: z.number().int(),
  date: z.coerce.date(),
  status: z.enum(["PRESENT", "ABSENT", "LATE"]),
  remarks: z.string().optional(),
});

export const bulkAttendanceSchema = z.object({
  academicYearId: z.number().int(),
  classId: z.number().int(),
  sectionId: z.number().int(),
  date: z.coerce.date(),
  attendances: z
    .array(
      z.object({
        studentId: z.number().int(),
        status: z.enum(["PRESENT", "ABSENT", "LATE"]),
        remarks: z.string().optional(),
      }),
    )
    .min(1)
    .refine(
      (attendances) =>
        new Set(attendances.map(({ studentId }) => studentId)).size ===
        attendances.length,
      "A student can only appear once per attendance submission",
    ),
});

export const updateAttendanceSchema = createAttendanceSchema.partial();
