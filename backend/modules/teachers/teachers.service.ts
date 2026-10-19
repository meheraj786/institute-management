import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/http";

export type TeacherInput = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  employeeId?: string;
  joiningDate?: Date;
  designation?: string;
  qualification?: string;
  status?: "ACTIVE" | "INACTIVE";
};
export type TeacherAssignmentInput = {
  teacherId: number;
  classId: number;
  sectionId: number;
  subjectId: number;
  academicYearId: number;
};

const teacherInclude = {
  user: {
    select: { id: true, name: true, email: true, phone: true, status: true },
  },
  assignments: {
    include: { class: true, section: true, subject: true, academicYear: true },
  },
};
const assignmentInclude = {
  teacher: { include: { user: { select: { id: true, name: true } } } },
  class: true,
  section: true,
  subject: true,
  academicYear: true,
};
const pageResponse = (
  data: unknown[],
  total: number,
  page: number,
  limit: number,
) => ({
  data,
  pagination: { page, limit, total, pages: Math.ceil(total / limit) },
});

export const listTeachers = async (page: number, limit: number) => {
  const [data, total] = await Promise.all([
    prisma.teacher.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "desc" },
      include: teacherInclude,
    }),
    prisma.teacher.count(),
  ]);
  return pageResponse(data, total, page, limit);
};
export const getTeacher = async (id: number) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: teacherInclude,
  });
  if (!teacher) throw new AppError("Teacher not found", 404);
  return teacher;
};
export const createTeacher = async (input: TeacherInput) => {
  const { name, email, phone, password, ...profile } = input;
  return prisma.teacher.create({
    data: {
      ...profile,
      user: {
        create: {
          name,
          email,
          phone,
          password: await bcrypt.hash(password, 12),
          role: "TEACHER",
        },
      },
    },
    include: teacherInclude,
  });
};
export const updateTeacher = async (
  id: number,
  input: Record<string, unknown>,
) => {
  const { name, email, phone, password, ...profile } = input;
  const userUpdate =
    name !== undefined ||
    email !== undefined ||
    phone !== undefined ||
    password !== undefined
      ? {
          update: {
            ...(name !== undefined ? { name: String(name) } : {}),
            ...(email !== undefined ? { email: String(email) } : {}),
            ...(phone !== undefined ? { phone: String(phone) } : {}),
            ...(password !== undefined
              ? { password: await bcrypt.hash(String(password), 12) }
              : {}),
          },
        }
      : undefined;
  return prisma.teacher.update({
    where: { id },
    data: { ...profile, ...(userUpdate ? { user: userUpdate } : {}) },
    include: teacherInclude,
  });
};
export const deleteTeacher = async (id: number) =>
  prisma.$transaction(async (tx) => {
    const teacher = await tx.teacher.findUniqueOrThrow({
      where: { id },
      select: { userId: true },
    });
    await tx.teacherAssignment.deleteMany({ where: { teacherId: id } });
    await tx.teacher.delete({ where: { id } });
    await tx.user.delete({ where: { id: teacher.userId } });
    return { id };
  });

const validateAssignment = async (input: TeacherAssignmentInput) => {
  const [teacher, classSection, classSubject] = await Promise.all([
    prisma.teacher.findUnique({
      where: { id: input.teacherId },
      select: { id: true },
    }),
    prisma.classSection.findFirst({
      where: {
        classId: input.classId,
        sectionId: input.sectionId,
        academicYearId: input.academicYearId,
      },
      select: { id: true },
    }),
    prisma.classSubject.findFirst({
      where: {
        classId: input.classId,
        subjectId: input.subjectId,
        academicYearId: input.academicYearId,
      },
      select: { id: true },
    }),
  ]);
  if (!teacher || !classSection || !classSubject) {
    throw new AppError(
      "Teacher, class-section, or class-subject mapping is invalid",
      400,
    );
  }
};

export const listTeacherAssignments = async (page: number, limit: number) => {
  const [data, total] = await Promise.all([
    prisma.teacherAssignment.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "desc" },
      include: assignmentInclude,
    }),
    prisma.teacherAssignment.count(),
  ]);
  return pageResponse(data, total, page, limit);
};
export const getTeacherAssignment = async (id: number) => {
  const item = await prisma.teacherAssignment.findUnique({
    where: { id },
    include: assignmentInclude,
  });
  if (!item) throw new AppError("Teacher assignment not found", 404);
  return item;
};
export const createTeacherAssignment = async (
  input: TeacherAssignmentInput,
) => {
  await validateAssignment(input);
  const duplicate = await prisma.teacherAssignment.findFirst({ where: input });
  if (duplicate)
    throw new AppError("This teacher assignment already exists", 409);
  return prisma.teacherAssignment.create({
    data: input,
    include: assignmentInclude,
  });
};
export const updateTeacherAssignment = async (
  id: number,
  input: Record<string, unknown>,
) => {
  const current = await prisma.teacherAssignment.findUniqueOrThrow({
    where: { id },
  });
  const next = { ...current, ...input } as TeacherAssignmentInput;
  await validateAssignment(next);
  const duplicate = await prisma.teacherAssignment.findFirst({
    where: { ...next, id: { not: id } },
  });
  if (duplicate)
    throw new AppError("This teacher assignment already exists", 409);
  return prisma.teacherAssignment.update({
    where: { id },
    data: input,
    include: assignmentInclude,
  });
};
export const deleteTeacherAssignment = (id: number) =>
  prisma.teacherAssignment.delete({ where: { id } });
