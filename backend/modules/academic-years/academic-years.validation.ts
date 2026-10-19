import { z } from "zod";

export const createAcademicYearSchema = z.object({
  title: z.string().min(2, "Title is required"),
  startDate: z.coerce.date({ message: "Invalid start date" }),
  endDate: z.coerce.date({ message: "Invalid end date" }),
  isCurrent: z.boolean().optional(),
});

export const updateAcademicYearSchema = createAcademicYearSchema.partial();
