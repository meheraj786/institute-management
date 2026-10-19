import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT", "PARENT"]),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const updateUserSchema = createUserSchema.partial();