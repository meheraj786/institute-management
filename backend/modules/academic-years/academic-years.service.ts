import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/http";

type AcademicYearInput = {
  title: string;
  startDate: Date;
  endDate: Date;
  isCurrent?: boolean;
};

export const listAcademicYears = async (page: number, limit: number) => {
  const [data, total] = await Promise.all([
    prisma.academicYear.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { startDate: "desc" },
    }),
    prisma.academicYear.count(),
  ]);
  return {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const getAcademicYear = async (id: number) => {
  const year = await prisma.academicYear.findUnique({ where: { id } });
  if (!year) throw new AppError("Academic year not found", 404);
  return year;
};

export const createAcademicYear = async (data: AcademicYearInput) => {
  if (data.endDate < data.startDate)
    throw new AppError("End date must be after start date", 400);
  return prisma.$transaction(async (tx) => {
    if (data.isCurrent)
      await tx.academicYear.updateMany({ data: { isCurrent: false } });
    return tx.academicYear.create({ data });
  });
};

export const updateAcademicYear = async (
  id: number,
  data: Partial<AcademicYearInput>,
) => {
  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    throw new AppError("End date must be after start date", 400);
  }
  return prisma.$transaction(async (tx) => {
    if (data.isCurrent)
      await tx.academicYear.updateMany({
        where: { id: { not: id } },
        data: { isCurrent: false },
      });
    return tx.academicYear.update({ where: { id }, data });
  });
};

export const deleteAcademicYear = async (id: number) =>
  prisma.academicYear.delete({ where: { id } });
