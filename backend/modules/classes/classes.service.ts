import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/http";

export type ClassInput = {
  name: string;
  numericValue?: number;
  status?: "ACTIVE" | "INACTIVE";
};
export type ClassSectionInput = {
  classId: number;
  sectionId: number;
  academicYearId: number;
};

const pageResult = (
  data: unknown[],
  total: number,
  page: number,
  limit: number,
) => ({
  data,
  pagination: { page, limit, total, pages: Math.ceil(total / limit) },
});

export const listClasses = async (page: number, limit: number) => {
  const [data, total] = await Promise.all([
    prisma.class.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "desc" },
    }),
    prisma.class.count(),
  ]);
  return pageResult(data, total, page, limit);
};
export const getClass = async (id: number) => {
  const item = await prisma.class.findUnique({ where: { id } });
  if (!item) throw new AppError("Class not found", 404);
  return item;
};
export const createClass = (data: ClassInput) => prisma.class.create({ data });
export const updateClass = (id: number, data: Partial<ClassInput>) =>
  prisma.class.update({ where: { id }, data });
export const deleteClass = (id: number) =>
  prisma.class.delete({ where: { id } });

export const listClassSections = async (page: number, limit: number) => {
  const [data, total] = await Promise.all([
    prisma.classSection.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "desc" },
      include: { class: true, section: true, academicYear: true },
    }),
    prisma.classSection.count(),
  ]);
  return pageResult(data, total, page, limit);
};
export const getClassSection = async (id: number) => {
  const item = await prisma.classSection.findUnique({
    where: { id },
    include: { class: true, section: true, academicYear: true },
  });
  if (!item) throw new AppError("Class-section mapping not found", 404);
  return item;
};
export const createClassSection = async (data: ClassSectionInput) => {
  const [classExists, sectionExists, yearExists] = await Promise.all([
    prisma.class.findUnique({
      where: { id: data.classId },
      select: { id: true },
    }),
    prisma.section.findUnique({
      where: { id: data.sectionId },
      select: { id: true },
    }),
    prisma.academicYear.findUnique({
      where: { id: data.academicYearId },
      select: { id: true },
    }),
  ]);
  if (!classExists || !sectionExists || !yearExists)
    throw new AppError("Class, section, or academic year not found", 400);
  return prisma.classSection.create({
    data,
    include: { class: true, section: true, academicYear: true },
  });
};
export const updateClassSection = (
  id: number,
  data: Partial<ClassSectionInput>,
) =>
  prisma.classSection.update({
    where: { id },
    data,
    include: { class: true, section: true, academicYear: true },
  });
export const deleteClassSection = (id: number) =>
  prisma.classSection.delete({ where: { id } });
