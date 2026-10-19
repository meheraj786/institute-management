import { z } from "zod";

export const createFeeHeadSchema = z.object({
  name: z.string().min(1, "Fee head name is required"),
  description: z.string().optional(),
});

export const updateFeeHeadSchema = createFeeHeadSchema.partial();

export const createFeeStructureSchema = z.object({
  academicYearId: z.number().int(),
  classId: z.number().int(),
  feeHeadId: z.number().int(),
  amount: z.number().positive(),
  frequency: z.enum(["MONTHLY", "YEARLY", "ONE_TIME"]),
});

export const updateFeeStructureSchema = createFeeStructureSchema.partial();

export const createFeeCollectionSchema = z.object({
  studentId: z.number().int(),
  academicYearId: z.number().int(),
  feeHeadId: z.number().int(),
  amount: z.number().positive(),
  paidAmount: z.number().min(0),
  discount: z.number().min(0).optional(),
  fine: z.number().min(0).optional(),
  paymentDate: z.coerce.date(),
  paymentMethod: z.enum(["CASH", "BKASH", "NAGAD", "BANK"]),
  remarks: z.string().optional(),
});

export const updateFeeCollectionSchema = createFeeCollectionSchema.partial();
