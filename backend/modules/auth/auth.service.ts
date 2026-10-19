import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRole } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/http";

type Credentials = { email: string; password: string };
type Registration = Credentials & {
  name: string;
  phone?: string;
  role: UserRole;
};

const publicUser = <T extends { password: string }>(user: T) => {
  const { password: _password, ...safeUser } = user;
  return safeUser;
};

const createToken = (id: number, role: UserRole) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError("JWT_SECRET is not configured", 500);
  return jwt.sign({ role }, secret, { subject: String(id), expiresIn: "7d" });
};

export const register = async (data: Registration) => {
  if (data.role === UserRole.ADMIN || data.role === UserRole.TEACHER) {
    throw new AppError("Only students and parents can self-register", 403);
  }
  const user = await prisma.user.create({
    data: { ...data, password: await bcrypt.hash(data.password, 12) },
  });
  return { user: publicUser(user), token: createToken(user.id, user.role) };
};

export const login = async (data: Credentials) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !(await bcrypt.compare(data.password, user.password))) {
    throw new AppError("Invalid email or password", 401);
  }
  if (user.status !== "ACTIVE") throw new AppError("Account is inactive", 403);
  return { user: publicUser(user), token: createToken(user.id, user.role) };
};

export const getCurrentUser = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
    },
  });
  if (!user || user.status !== "ACTIVE")
    throw new AppError("User not found", 404);
  return user;
};
