import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/http";

export type SubjectInput = {
  name: string;
  code?: string;
  status?: "ACTIVE" | "INACTIVE";
};
export type ClassSubjectInput = {
  classId: number;
  subjectId: number;
  academicYearId: number;
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

export const listSubjects = async (page: number, limit: number) => {
  const [data, total] = await Promise.all([
    prisma.subject.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "desc" },
    }),
    prisma.subject.count(),
  ]);
  return pageResponse(data, total, page, limit);
};
export const getSubject = async (id: number) => {
  const subject = await prisma.subject.findUnique({ where: { id } });
  if (!subject) throw new AppError("Subject not found", 404);
  return subject;
};
export const createSubject = (data: SubjectInput) =>
  prisma.subject.create({ data });
export const updateSubject = (id: number, data: Partial<SubjectInput>) =>
  prisma.subject.update({ where: { id }, data });
export const deleteSubject = (id: number) =>
  prisma.subject.delete({ where: { id } });

export const listClassSubjects = async (page: number, limit: number) => {
  const [data, total] = await Promise.all([
    prisma.classSubject.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "desc" },
      include: { class: true, subject: true, academicYear: true },
    }),
    prisma.classSubject.count(),
  ]);
  return pageResponse(data, total, page, limit);
};
export const getClassSubject = async (id: number) => {
  const item = await prisma.classSubject.findUnique({
    where: { id },
    include: { class: true, subject: true, academicYear: true },
  });
  if (!item) throw new AppError("Class-subject assignment not found", 404);
  return item;
};
export const createClassSubject = async (data: ClassSubjectInput) => {
  const existing = await prisma.classSubject.findFirst({ where: data });
  if (existing)
    throw new AppError(
      "Subject is already assigned to this class and academic year",
      409,
    );
  return prisma.classSubject.create({
    data,
    include: { class: true, subject: true, academicYear: true },
  });
};
export const updateClassSubject = async (
  id: number,
  data: Partial<ClassSubjectInput>,
) => {
  const existing = await prisma.classSubject.findUniqueOrThrow({
    where: { id },
  });
  const next = { ...existing, ...data };
  const duplicate = await prisma.classSubject.findFirst({
    where: {
      id: { not: id },
      classId: next.classId,
      subjectId: next.subjectId,
      academicYearId: next.academicYearId,
    },
  });
  if (duplicate)
    throw new AppError(
      "Subject is already assigned to this class and academic year",
      409,
    );
  return prisma.classSubject.update({
    where: { id },
    data,
    include: { class: true, subject: true, academicYear: true },
  });
};
export const deleteClassSubject = (id: number) =>
  prisma.classSubject.delete({ where: { id } });
