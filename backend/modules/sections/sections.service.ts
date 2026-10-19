import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/http";

export type SectionInput = { name: string; status?: "ACTIVE" | "INACTIVE" };

export const listSections = async (page: number, limit: number) => {
  const [data, total] = await Promise.all([
    prisma.section.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "desc" },
    }),
    prisma.section.count(),
  ]);
  return {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};
export const getSection = async (id: number) => {
  const section = await prisma.section.findUnique({ where: { id } });
  if (!section) throw new AppError("Section not found", 404);
  return section;
};
export const createSection = (data: SectionInput) =>
  prisma.section.create({ data });
export const updateSection = (id: number, data: Partial<SectionInput>) =>
  prisma.section.update({ where: { id }, data });
export const deleteSection = (id: number) =>
  prisma.section.delete({ where: { id } });
