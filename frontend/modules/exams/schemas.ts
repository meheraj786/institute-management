import { z } from "zod";

export const examSchema = z.object({
  name: z.string().min(1),
  academicYearId: z.coerce.number().int().positive(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED"]).optional(),
});
export const updateExamSchema = examSchema.partial();
const examSubjectFields = z.object({
  examId: z.coerce.number().int().positive(),
  subjectId: z.coerce.number().int().positive(),
  classId: z.coerce.number().int().positive(),
  fullMarks: z.coerce.number().positive(),
  passMarks: z.coerce.number().positive(),
});
export const examSubjectSchema = examSubjectFields.refine(
  (item) => item.passMarks <= item.fullMarks,
  {
    path: ["passMarks"],
    message: "Pass marks cannot exceed full marks",
  },
);
export const updateExamSubjectSchema = examSubjectFields
  .partial()
  .refine(
    (item) =>
      item.passMarks === undefined ||
      item.fullMarks === undefined ||
      item.passMarks <= item.fullMarks,
    { path: ["passMarks"], message: "Pass marks cannot exceed full marks" },
  );
export const markSchema = z.object({
  examId: z.coerce.number().int().positive(),
  studentId: z.coerce.number().int().positive(),
  subjectId: z.coerce.number().int().positive(),
  obtainedMarks: z.coerce.number().min(0),
  grade: z.string().optional(),
  remarks: z.string().optional(),
});
export const updateMarkSchema = markSchema.partial();
export const bulkMarksSchema = z.object({
  examId: z.coerce.number().int().positive(),
  subjectId: z.coerce.number().int().positive(),
  classId: z.coerce.number().int().positive(),
  marks: z
    .array(
      z.object({
        studentId: z.coerce.number().int().positive(),
        obtainedMarks: z.coerce.number().min(0),
        grade: z.string().optional(),
        remarks: z.string().optional(),
      }),
    )
    .min(1)
    .refine(
      (items) =>
        new Set(items.map((item) => item.studentId)).size === items.length,
      "A student can only appear once",
    ),
});
export const resultCriteriaSchema = z.object({
  academicYearId: z.coerce.number().int().positive(),
  examId: z.coerce.number().int().positive(),
  classId: z.coerce.number().int().positive(),
  sectionId: z.coerce.number().int().positive(),
});
export type ExamInput = z.infer<typeof examSchema>;
export type ExamSubjectInput = z.infer<typeof examSubjectSchema>;
export type MarkInput = z.infer<typeof markSchema>;
export type BulkMarksInput = z.infer<typeof bulkMarksSchema>;
