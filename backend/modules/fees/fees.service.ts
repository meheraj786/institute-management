import { randomUUID } from "node:crypto";
import { FeeFrequency, PaymentMethod } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/http";

export type FeeHeadInput = { name: string; description?: string };
export type FeeStructureInput = {
  academicYearId: number;
  classId: number;
  feeHeadId: number;
  amount: number;
  frequency: FeeFrequency;
};
export type FeeCollectionInput = {
  studentId: number;
  academicYearId: number;
  feeHeadId: number;
  amount: number;
  paidAmount: number;
  discount?: number;
  fine?: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  remarks?: string;
};

const collectionInclude = {
  student: { include: { user: { select: { id: true, name: true } } } },
  academicYear: true,
  feeHead: true,
  collectedByUser: { select: { id: true, name: true } },
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

export const listFeeHeads = async (page: number, limit: number) => {
  const [data, total] = await Promise.all([
    prisma.feeHead.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "desc" },
    }),
    prisma.feeHead.count(),
  ]);
  return pageResponse(data, total, page, limit);
};
export const getFeeHead = async (id: number) => {
  const item = await prisma.feeHead.findUnique({ where: { id } });
  if (!item) throw new AppError("Fee head not found", 404);
  return item;
};
export const createFeeHead = (data: FeeHeadInput) =>
  prisma.feeHead.create({ data });
export const updateFeeHead = (id: number, data: Partial<FeeHeadInput>) =>
  prisma.feeHead.update({ where: { id }, data });
export const deleteFeeHead = (id: number) =>
  prisma.feeHead.delete({ where: { id } });

export const listFeeStructures = async (page: number, limit: number) => {
  const [data, total] = await Promise.all([
    prisma.feeStructure.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "desc" },
      include: { academicYear: true, class: true, feeHead: true },
    }),
    prisma.feeStructure.count(),
  ]);
  return pageResponse(data, total, page, limit);
};
export const getFeeStructure = async (id: number) => {
  const item = await prisma.feeStructure.findUnique({
    where: { id },
    include: { academicYear: true, class: true, feeHead: true },
  });
  if (!item) throw new AppError("Fee structure not found", 404);
  return item;
};
export const createFeeStructure = async (data: FeeStructureInput) => {
  const duplicate = await prisma.feeStructure.findFirst({
    where: {
      academicYearId: data.academicYearId,
      classId: data.classId,
      feeHeadId: data.feeHeadId,
      frequency: data.frequency,
    },
  });
  if (duplicate)
    throw new AppError(
      "Fee structure already exists for this class, year, head, and frequency",
      409,
    );
  return prisma.feeStructure.create({
    data,
    include: { academicYear: true, class: true, feeHead: true },
  });
};
export const updateFeeStructure = async (
  id: number,
  data: Partial<FeeStructureInput>,
) => {
  const current = await prisma.feeStructure.findUniqueOrThrow({
    where: { id },
  });
  const next = { ...current, ...data };
  const duplicate = await prisma.feeStructure.findFirst({
    where: {
      id: { not: id },
      academicYearId: next.academicYearId,
      classId: next.classId,
      feeHeadId: next.feeHeadId,
      frequency: next.frequency,
    },
  });
  if (duplicate)
    throw new AppError(
      "Fee structure already exists for this class, year, head, and frequency",
      409,
    );
  return prisma.feeStructure.update({
    where: { id },
    data,
    include: { academicYear: true, class: true, feeHead: true },
  });
};
export const deleteFeeStructure = (id: number) =>
  prisma.feeStructure.delete({ where: { id } });

export const searchStudentsForFees = async (query: string) => {
  const search = query.trim();
  if (!search) throw new AppError("Search text is required", 400);
  return prisma.student.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { studentId: { contains: search, mode: "insensitive" } },
        {
          user: {
            is: {
              status: "ACTIVE",
              name: { contains: search, mode: "insensitive" },
            },
          },
        },
        {
          user: {
            is: {
              status: "ACTIVE",
              email: { contains: search, mode: "insensitive" },
            },
          },
        },
      ],
    },
    take: 20,
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      enrollments: {
        where: { status: "ACTIVE" },
        include: { academicYear: true, class: true, section: true },
      },
    },
  });
};

export const getStudentFeeDue = async (
  studentId: number,
  academicYearId: number,
) => {
  const enrollments = await prisma.studentEnrollment.findMany({
    where: { studentId, academicYearId, status: "ACTIVE" },
    select: { classId: true },
  });
  if (!enrollments.length)
    throw new AppError(
      "Student has no active enrollment in this academic year",
      404,
    );
  const structures = await prisma.feeStructure.findMany({
    where: {
      academicYearId,
      classId: { in: enrollments.map(({ classId }) => classId) },
    },
    include: { class: true, feeHead: true },
  });
  const collections = await prisma.feeCollection.findMany({
    where: {
      studentId,
      academicYearId,
      feeHeadId: { in: structures.map(({ feeHeadId }) => feeHeadId) },
    },
    select: { feeHeadId: true, paidAmount: true, discount: true, fine: true },
  });
  const totals = new Map<
    number,
    { paid: number; discount: number; fine: number }
  >();
  for (const collection of collections) {
    const total = totals.get(collection.feeHeadId) ?? {
      paid: 0,
      discount: 0,
      fine: 0,
    };
    total.paid += Number(collection.paidAmount);
    total.discount += Number(collection.discount);
    total.fine += Number(collection.fine);
    totals.set(collection.feeHeadId, total);
  }
  return structures.map((structure) => {
    const total = totals.get(structure.feeHeadId) ?? {
      paid: 0,
      discount: 0,
      fine: 0,
    };
    const amount = Number(structure.amount);
    return {
      ...structure,
      paidAmount: total.paid,
      discount: total.discount,
      fine: total.fine,
      balanceDue: Math.max(
        0,
        amount + total.fine - total.discount - total.paid,
      ),
    };
  });
};

const getApplicableFeeStructure = async (
  studentId: number,
  academicYearId: number,
  feeHeadId: number,
) => {
  const enrollment = await prisma.studentEnrollment.findFirst({
    where: { studentId, academicYearId, status: "ACTIVE" },
    select: { classId: true },
  });
  if (!enrollment)
    throw new AppError(
      "Student has no active enrollment in this academic year",
      400,
    );
  const structure = await prisma.feeStructure.findFirst({
    where: { academicYearId, classId: enrollment.classId, feeHeadId },
  });
  if (!structure)
    throw new AppError(
      "No fee structure exists for this student and fee head",
      400,
    );
  return structure;
};

export const listFeeCollections = async (page: number, limit: number) => {
  const [data, total] = await Promise.all([
    prisma.feeCollection.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { paymentDate: "desc" },
      include: collectionInclude,
    }),
    prisma.feeCollection.count(),
  ]);
  return pageResponse(data, total, page, limit);
};
export const getFeeCollection = async (id: number) => {
  const item = await prisma.feeCollection.findUnique({
    where: { id },
    include: collectionInclude,
  });
  if (!item) throw new AppError("Fee collection not found", 404);
  return item;
};
export const createFeeCollection = async (
  input: FeeCollectionInput,
  collectedBy: number,
) => {
  const structure = await getApplicableFeeStructure(
    input.studentId,
    input.academicYearId,
    input.feeHeadId,
  );
  const amount = Number(structure.amount);
  const discount = input.discount ?? 0;
  const fine = input.fine ?? 0;
  if (discount + input.paidAmount > amount + fine)
    throw new AppError("Discount and payment exceed the fee amount", 400);
  return prisma.feeCollection.create({
    data: { ...input, amount, collectedBy, receiptNo: randomUUID() },
    include: collectionInclude,
  });
};
export const updateFeeCollection = async (
  id: number,
  input: Record<string, unknown>,
) => {
  const current = await prisma.feeCollection.findUniqueOrThrow({
    where: { id },
  });
  const studentId = Number(input.studentId ?? current.studentId);
  const academicYearId = Number(input.academicYearId ?? current.academicYearId);
  const feeHeadId = Number(input.feeHeadId ?? current.feeHeadId);
  const structure = await getApplicableFeeStructure(
    studentId,
    academicYearId,
    feeHeadId,
  );
  const amount = Number(structure.amount);
  const paidAmount = Number(input.paidAmount ?? current.paidAmount);
  const discount = Number(input.discount ?? current.discount);
  const fine = Number(input.fine ?? current.fine);
  if (discount + paidAmount > amount + fine)
    throw new AppError("Discount and payment exceed the fee amount", 400);
  return prisma.feeCollection.update({
    where: { id },
    data: { ...input, amount },
    include: collectionInclude,
  });
};
export const deleteFeeCollection = (id: number) =>
  prisma.feeCollection.delete({ where: { id } });
