import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import { Gender, Status, StudentStatus } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/http";

export type CreateStudentInput = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  studentId?: string;
  admissionDate?: Date;
  dateOfBirth?: Date;
  gender?: Gender;
  bloodGroup?: string;
  presentAddress?: string;
  permanentAddress?: string;
  fatherName?: string;
  motherName?: string;
  guardianPhone?: string;
  photo?: string;
  status?: StudentStatus;
  academicYearId: number;
  classId: number;
  sectionId: number;
  rollNumber?: string;
};

export type StudentEnrollmentInput = {
  studentId: number;
  academicYearId: number;
  classId: number;
  sectionId: number;
  rollNumber?: string;
  status?: Status;
};

const studentInclude = {
  user: {
    select: { id: true, name: true, email: true, phone: true, status: true },
  },
  enrollments: { include: { academicYear: true, class: true, section: true } },
};

const ensureClassSection = async (
  academicYearId: number,
  classId: number,
  sectionId: number,
) => {
  const mapping = await prisma.classSection.findFirst({
    where: { academicYearId, classId, sectionId },
  });
  if (!mapping)
    throw new AppError(
      "Class and section are not configured for this academic year",
      400,
    );
};

export const generateStudentId = () =>
  `STU-${new Date().getFullYear()}-${randomUUID().slice(0, 12).toUpperCase()}`;

export const listStudents = async (page: number, limit: number) => {
  const [data, total] = await Promise.all([
    prisma.student.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "desc" },
      include: studentInclude,
    }),
    prisma.student.count(),
  ]);
  return {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const getStudent = async (id: number) => {
  const student = await prisma.student.findUnique({
    where: { id },
    include: studentInclude,
  });
  if (!student) throw new AppError("Student not found", 404);
  return student;
};

export const createStudent = async (input: CreateStudentInput) => {
  await ensureClassSection(
    input.academicYearId,
    input.classId,
    input.sectionId,
  );
  const duplicateEnrollment = await prisma.studentEnrollment.findFirst({
    where: {
      student: { user: { email: input.email } },
      academicYearId: input.academicYearId,
      status: "ACTIVE",
    },
  });
  if (duplicateEnrollment)
    throw new AppError(
      "Student already has an active enrollment in this academic year",
      409,
    );
  const {
    name,
    email,
    phone,
    password,
    academicYearId,
    classId,
    sectionId,
    rollNumber,
    ...profile
  } = input;
  return prisma.student.create({
    data: {
      ...profile,
      studentId: input.studentId || generateStudentId(),
      user: {
        create: {
          name,
          email,
          phone,
          password: await bcrypt.hash(password, 12),
          role: "STUDENT",
        },
      },
      enrollments: {
        create: { academicYearId, classId, sectionId, rollNumber },
      },
    },
    include: studentInclude,
  });
};

export const updateStudent = async (
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
  return prisma.student.update({
    where: { id },
    data: { ...profile, ...(userUpdate ? { user: userUpdate } : {}) },
    include: studentInclude,
  });
};

export const deleteStudent = async (id: number) =>
  prisma.$transaction(async (tx) => {
    const student = await tx.student.findUniqueOrThrow({
      where: { id },
      select: { userId: true },
    });
    const [attendanceCount, markCount, feeCount] = await Promise.all([
      tx.attendance.count({ where: { studentId: id } }),
      tx.mark.count({ where: { studentId: id } }),
      tx.feeCollection.count({ where: { studentId: id } }),
    ]);
    if (attendanceCount || markCount || feeCount) {
      throw new AppError(
        "Students with academic or payment history cannot be deleted; set the student inactive instead",
        409,
      );
    }
    await tx.studentEnrollment.deleteMany({ where: { studentId: id } });
    await tx.student.delete({ where: { id } });
    await tx.user.delete({ where: { id: student.userId } });
    return { id };
  });

export const listEnrollments = async (page: number, limit: number) => {
  const [data, total] = await Promise.all([
    prisma.studentEnrollment.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "desc" },
      include: {
        student: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        academicYear: true,
        class: true,
        section: true,
      },
    }),
    prisma.studentEnrollment.count(),
  ]);
  return {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const getEnrollment = async (id: number) => {
  const enrollment = await prisma.studentEnrollment.findUnique({
    where: { id },
    include: {
      student: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      academicYear: true,
      class: true,
      section: true,
    },
  });
  if (!enrollment) throw new AppError("Enrollment not found", 404);
  return enrollment;
};

export const createEnrollment = async (input: StudentEnrollmentInput) => {
  await ensureClassSection(
    input.academicYearId,
    input.classId,
    input.sectionId,
  );
  const duplicate = await prisma.studentEnrollment.findFirst({
    where: {
      studentId: input.studentId,
      academicYearId: input.academicYearId,
      status: "ACTIVE",
    },
  });
  if (duplicate)
    throw new AppError(
      "Student already has an active enrollment in this academic year",
      409,
    );
  return prisma.studentEnrollment.create({
    data: input,
    include: { student: true, academicYear: true, class: true, section: true },
  });
};

export const updateEnrollment = async (
  id: number,
  input: Record<string, unknown>,
) => {
  const current = await prisma.studentEnrollment.findUniqueOrThrow({
    where: { id },
  });
  const academicYearId = Number(input.academicYearId ?? current.academicYearId);
  const classId = Number(input.classId ?? current.classId);
  const sectionId = Number(input.sectionId ?? current.sectionId);
  await ensureClassSection(academicYearId, classId, sectionId);
  if (input.status === "ACTIVE") {
    const duplicate = await prisma.studentEnrollment.findFirst({
      where: {
        id: { not: id },
        studentId: current.studentId,
        academicYearId,
        status: "ACTIVE",
      },
    });
    if (duplicate)
      throw new AppError(
        "Student already has an active enrollment in this academic year",
        409,
      );
  }
  return prisma.studentEnrollment.update({
    where: { id },
    data: input,
    include: { student: true, academicYear: true, class: true, section: true },
  });
};
export const deleteEnrollment = (id: number) =>
  prisma.studentEnrollment.delete({ where: { id } });
