import bcrypt from "bcrypt";
import { Status, UserRole } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/http";

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

export const listUsers = async (page: number, limit: number) => {
  const [data, total] = await Promise.all([
    prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "desc" },
      select: userSelect,
    }),
    prisma.user.count(),
  ]);
  return {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const getUser = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });
  if (!user) throw new AppError("User not found", 404);
  return user;
};

export const createUser = async (input: Record<string, unknown>) => {
  const password = await bcrypt.hash(String(input.password), 12);
  return prisma.user.create({
    data: {
      name: String(input.name),
      email: String(input.email),
      ...(input.phone !== undefined ? { phone: String(input.phone) } : {}),
      password,
      role: input.role as UserRole,
      ...(input.status !== undefined ? { status: input.status as Status } : {}),
    },
    select: userSelect,
  });
};

export const updateUser = async (
  id: number,
  input: Record<string, unknown>,
) => {
  const data = {
    ...input,
    ...(input.password
      ? { password: await bcrypt.hash(String(input.password), 12) }
      : {}),
  };
  return prisma.user.update({ where: { id }, data, select: userSelect });
};

export const deleteUser = async (id: number) =>
  prisma.user.delete({
    where: { id },
    select: userSelect,
  });
