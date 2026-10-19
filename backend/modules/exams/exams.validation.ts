import { z } from "zod";

export const createExamSchema = z.object({
  name: z.string().min(1, "Exam name is required"),
  academicYearId: z.number().int(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED"]).optional(),
});

export const updateExamSchema = createExamSchema.partial();

export const createExamSubjectSchema = z.object({
  examId: z.number().int(),
  subjectId: z.number().int(),
  classId: z.number().int(),
  fullMarks: z.number().positive(),
  passMarks: z.number().positive(),
});

export const updateExamSubjectSchema = createExamSubjectSchema.partial();

export const createMarkSchema = z.object({
  examId: z.number().int(),
  studentId: z.number().int(),
  subjectId: z.number().int(),
  obtainedMarks: z.number().min(0),
  grade: z.string().optional(),
  remarks: z.string().optional(),
});

export const updateMarkSchema = createMarkSchema.partial();

export const bulkMarksSchema = z.object({
  examId: z.number().int(),
  subjectId: z.number().int(),
  classId: z.number().int(),
  marks: z
    .array(
      z.object({
        studentId: z.number().int(),
        obtainedMarks: z.number().min(0),
        grade: z.string().optional(),
        remarks: z.string().optional(),
      }),
    )
    .min(1)
    .refine(
      (marks) =>
        new Set(marks.map(({ studentId }) => studentId)).size === marks.length,
      "A student can only appear once per marks submission",
    ),
});
