import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/http";

export type AttendanceStatusInput = "PRESENT" | "ABSENT" | "LATE";
export type CreateAttendanceInput = {
  studentId: number;
  academicYearId: number;
  classId: number;
  sectionId: number;
  date: Date;
  status: AttendanceStatusInput;
  remarks?: string;
};
export type BulkAttendanceInput = Omit<
  CreateAttendanceInput,
  "studentId" | "status" | "remarks"
> & {
  attendances: {
    studentId: number;
    status: AttendanceStatusInput;
    remarks?: string;
  }[];
};

const attendanceInclude = {
  student: {
    include: { user: { select: { id: true, name: true, email: true } } },
  },
  class: true,
  section: true,
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
const ensureEnrollment = async (
  studentId: number,
  academicYearId: number,
  classId: number,
  sectionId: number,
) => {
  const record = await prisma.studentEnrollment.findFirst({
    where: {
      studentId,
      academicYearId,
      classId,
      sectionId,
      status: "ACTIVE",
      student: { status: "ACTIVE" },
    },
    select: { id: true },
  });
  if (!record)
    throw new AppError(
      "Student is not actively enrolled in this class and section",
      400,
    );
};

export const getClassRoster = async (
  academicYearId: number,
  classId: number,
  sectionId: number,
  date: Date,
) => {
  const enrollments = await prisma.studentEnrollment.findMany({
    where: {
      academicYearId,
      classId,
      sectionId,
      status: "ACTIVE",
      student: { status: "ACTIVE" },
    },
    include: {
      student: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
    orderBy: { rollNumber: "asc" },
  });
  const records = await prisma.attendance.findMany({
    where: {
      academicYearId,
      classId,
      sectionId,
      date,
      studentId: { in: enrollments.map(({ studentId }) => studentId) },
    },
    select: { studentId: true, status: true, remarks: true },
  });
  const byStudentId = new Map(
    records.map((record) => [record.studentId, record]),
  );
  return enrollments.map((enrollment) => ({
    ...enrollment,
    attendance: byStudentId.get(enrollment.studentId) ?? null,
  }));
};

export const listAttendances = async (page: number, limit: number) => {
  const [data, total] = await Promise.all([
    prisma.attendance.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { date: "desc" },
      include: attendanceInclude,
    }),
    prisma.attendance.count(),
  ]);
  return pageResponse(data, total, page, limit);
};
export const getAttendance = async (id: number) => {
  const item = await prisma.attendance.findUnique({
    where: { id },
    include: attendanceInclude,
  });
  if (!item) throw new AppError("Attendance record not found", 404);
  return item;
};
export const createAttendance = async (
  input: CreateAttendanceInput,
  takenBy: number,
) => {
  await ensureEnrollment(
    input.studentId,
    input.academicYearId,
    input.classId,
    input.sectionId,
  );
  return prisma.attendance.create({
    data: { ...input, takenBy },
    include: attendanceInclude,
  });
};
export const updateAttendance = async (
  id: number,
  input: Partial<CreateAttendanceInput>,
) => {
  const current = await prisma.attendance.findUniqueOrThrow({ where: { id } });
  await ensureEnrollment(
    input.studentId ?? current.studentId,
    input.academicYearId ?? current.academicYearId,
    input.classId ?? current.classId,
    input.sectionId ?? current.sectionId,
  );
  return prisma.attendance.update({
    where: { id },
    data: input,
    include: attendanceInclude,
  });
};
export const deleteAttendance = (id: number) =>
  prisma.attendance.delete({ where: { id } });

export const saveBulkAttendance = async (
  input: BulkAttendanceInput,
  takenBy: number,
) => {
  const studentIds = input.attendances.map(({ studentId }) => studentId);
  const enrollments = await prisma.studentEnrollment.findMany({
    where: {
      studentId: { in: studentIds },
      academicYearId: input.academicYearId,
      classId: input.classId,
      sectionId: input.sectionId,
      status: "ACTIVE",
      student: { status: "ACTIVE" },
    },
    select: { studentId: true },
  });
  if (enrollments.length !== studentIds.length) {
    throw new AppError(
      "Every student must be actively enrolled in this class and section",
      400,
    );
  }
  return prisma.$transaction(async (tx) => {
    const saved = [];
    for (const attendance of input.attendances) {
      const where = {
        studentId: attendance.studentId,
        academicYearId: input.academicYearId,
        classId: input.classId,
        sectionId: input.sectionId,
        date: input.date,
      };
      const existing = await tx.attendance.findFirst({
        where,
        select: { id: true },
      });
      const data = { ...where, ...attendance, takenBy };
      saved.push(
        existing
          ? await tx.attendance.update({ where: { id: existing.id }, data })
          : await tx.attendance.create({ data }),
      );
    }
    return saved;
  });
};
