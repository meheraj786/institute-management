import { z } from "zod";

export const feeHeadSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});
export const updateFeeHeadSchema = feeHeadSchema.partial();
export const feeStructureSchema = z.object({
  academicYearId: z.coerce.number().int().positive(),
  classId: z.coerce.number().int().positive(),
  feeHeadId: z.coerce.number().int().positive(),
  amount: z.coerce.number().positive(),
  frequency: z.enum(["MONTHLY", "YEARLY", "ONE_TIME"]),
});
export const updateFeeStructureSchema = feeStructureSchema.partial();
export const feeCollectionSchema = z.object({
  studentId: z.coerce.number().int().positive(),
  academicYearId: z.coerce.number().int().positive(),
  feeHeadId: z.coerce.number().int().positive(),
  amount: z.coerce.number().positive(),
  paidAmount: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).optional(),
  fine: z.coerce.number().min(0).optional(),
  paymentDate: z.coerce.date(),
  paymentMethod: z.enum(["CASH", "BKASH", "NAGAD", "BANK"]),
  remarks: z.string().optional(),
});
export const updateFeeCollectionSchema = feeCollectionSchema.partial();
export type FeeHeadInput = z.infer<typeof feeHeadSchema>;
export type FeeStructureInput = z.infer<typeof feeStructureSchema>;
export type FeeCollectionInput = z.infer<typeof feeCollectionSchema>;
