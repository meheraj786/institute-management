import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT", "PARENT"]),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});
export const updateUserSchema = userSchema.partial();
export type UserInput = z.infer<typeof userSchema>;
