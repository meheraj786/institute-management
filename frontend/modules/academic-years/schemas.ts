import { z } from "zod";

const academicYearFields = z.object({
  title: z.string().min(2, "Enter an academic year title"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isCurrent: z.boolean().optional(),
});
export const academicYearSchema = academicYearFields.refine(
  ({ startDate, endDate }) => endDate >= startDate,
  {
    path: ["endDate"],
    message: "End date must be after start date",
  },
);
export const updateAcademicYearSchema = academicYearFields
  .partial()
  .refine(
    ({ startDate, endDate }) => !startDate || !endDate || endDate >= startDate,
    { path: ["endDate"], message: "End date must be after start date" },
  );
export type AcademicYearInput = z.infer<typeof academicYearSchema>;
export type UpdateAcademicYearInput = z.infer<typeof updateAcademicYearSchema>;
