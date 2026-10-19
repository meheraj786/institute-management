import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/http";

export type NoticeInput = {
  title: string;
  description: string;
  publishDate: Date;
  status?: "ACTIVE" | "INACTIVE";
};
const noticeInclude = { publisher: { select: { id: true, name: true } } };

export const listPublishedNotices = async (page: number, limit: number) => {
  const where = { status: "ACTIVE" as const, publishDate: { lte: new Date() } };
  const [data, total] = await Promise.all([
    prisma.notice.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { publishDate: "desc" },
      where,
      include: noticeInclude,
    }),
    prisma.notice.count({ where }),
  ]);
  return {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};
export const getPublishedNotice = async (id: number) => {
  const notice = await prisma.notice.findFirst({
    where: { id, status: "ACTIVE", publishDate: { lte: new Date() } },
    include: noticeInclude,
  });
  if (!notice) throw new AppError("Notice not found", 404);
  return notice;
};
export const listNotices = async (page: number, limit: number) => {
  const [data, total] = await Promise.all([
    prisma.notice.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { publishDate: "desc" },
      include: noticeInclude,
    }),
    prisma.notice.count(),
  ]);
  return {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};
export const getNotice = async (id: number) => {
  const notice = await prisma.notice.findUnique({
    where: { id },
    include: noticeInclude,
  });
  if (!notice) throw new AppError("Notice not found", 404);
  return notice;
};
export const createNotice = (input: NoticeInput, publishedBy: number) =>
  prisma.notice.create({
    data: { ...input, publishedBy },
    include: noticeInclude,
  });
export const updateNotice = (id: number, input: Partial<NoticeInput>) =>
  prisma.notice.update({ where: { id }, data: input, include: noticeInclude });
export const publishNotice = (id: number) =>
  prisma.notice.update({
    where: { id },
    data: { status: "ACTIVE" },
    include: noticeInclude,
  });
export const deleteNotice = (id: number) =>
  prisma.notice.delete({ where: { id } });
