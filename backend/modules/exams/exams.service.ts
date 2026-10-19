import { ExamStatus } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/http";

export type ExamInput = {
  name: string;
  academicYearId: number;
  startDate?: Date;
  endDate?: Date;
  status?: ExamStatus;
};
export type ExamSubjectInput = {
  examId: number;
  subjectId: number;
  classId: number;
  fullMarks: number;
  passMarks: number;
};
export type MarkInput = {
  examId: number;
  studentId: number;
  subjectId: number;
  obtainedMarks: number;
  grade?: string;
  remarks?: string;
};
export type BulkMarksInput = {
  examId: number;
  subjectId: number;
  classId: number;
  marks: Omit<MarkInput, "examId" | "subjectId">[];
};

const examInclude = {
  academicYear: true,
  examSubjects: { include: { subject: true, class: true } },
};
const examSubjectInclude = { exam: true, subject: true, class: true };
const markInclude = {
  exam: true,
  student: { include: { user: { select: { id: true, name: true } } } },
  subject: true,
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

export const listExams = async (page: number, limit: number) => {
  const [data, total] = await Promise.all([
    prisma.exam.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "desc" },
      include: examInclude,
    }),
    prisma.exam.count(),
  ]);
  return pageResponse(data, total, page, limit);
};
export const getExam = async (id: number) => {
  const item = await prisma.exam.findUnique({
    where: { id },
    include: examInclude,
  });
  if (!item) throw new AppError("Exam not found", 404);
  return item;
};
export const createExam = (data: ExamInput) =>
  prisma.exam.create({ data, include: examInclude });
export const updateExam = (id: number, data: Partial<ExamInput>) =>
  prisma.exam.update({ where: { id }, data, include: examInclude });
export const deleteExam = (id: number) => prisma.exam.delete({ where: { id } });

export const listExamSubjects = async (page: number, limit: number) => {
  const [data, total] = await Promise.all([
    prisma.examSubject.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "desc" },
      include: examSubjectInclude,
    }),
    prisma.examSubject.count(),
  ]);
  return pageResponse(data, total, page, limit);
};
export const getExamSubject = async (id: number) => {
  const item = await prisma.examSubject.findUnique({
    where: { id },
    include: examSubjectInclude,
  });
  if (!item) throw new AppError("Exam subject not found", 404);
  return item;
};
export const createExamSubject = async (data: ExamSubjectInput) => {
  if (data.passMarks > data.fullMarks)
    throw new AppError("Pass marks cannot exceed full marks", 400);
  const exam = await prisma.exam.findUniqueOrThrow({
    where: { id: data.examId },
    select: { academicYearId: true },
  });
  const mapping = await prisma.classSubject.findFirst({
    where: {
      classId: data.classId,
      subjectId: data.subjectId,
      academicYearId: exam.academicYearId,
    },
  });
  if (!mapping)
    throw new AppError(
      "Subject is not assigned to this class and academic year",
      400,
    );
  const duplicate = await prisma.examSubject.findFirst({
    where: {
      examId: data.examId,
      subjectId: data.subjectId,
      classId: data.classId,
    },
  });
  if (duplicate)
    throw new AppError(
      "Subject is already configured for this exam and class",
      409,
    );
  return prisma.examSubject.create({ data, include: examSubjectInclude });
};
export const updateExamSubject = async (
  id: number,
  data: Partial<ExamSubjectInput>,
) => {
  const current = await prisma.examSubject.findUniqueOrThrow({ where: { id } });
  const next = { ...current, ...data };
  if (Number(next.passMarks) > Number(next.fullMarks))
    throw new AppError("Pass marks cannot exceed full marks", 400);
  return prisma.examSubject.update({
    where: { id },
    data,
    include: examSubjectInclude,
  });
};
export const deleteExamSubject = (id: number) =>
  prisma.examSubject.delete({ where: { id } });

const validateMark = async (
  examId: number,
  subjectId: number,
  studentId: number,
  obtainedMarks: number,
  classId?: number,
) => {
  const exam = await prisma.exam.findUniqueOrThrow({
    where: { id: examId },
    select: { academicYearId: true },
  });
  const enrollments = await prisma.studentEnrollment.findMany({
    where: {
      studentId,
      academicYearId: exam.academicYearId,
      ...(classId ? { classId } : {}),
      status: "ACTIVE",
    },
    select: { classId: true },
  });
  if (!enrollments.length)
    throw new AppError(
      "Student has no active enrollment in this class and academic year",
      400,
    );
  const examSubject = await prisma.examSubject.findFirst({
    where: {
      examId,
      subjectId,
      classId: {
        in: enrollments.map(({ classId: enrolledClassId }) => enrolledClassId),
      },
    },
  });
  if (!examSubject)
    throw new AppError(
      "Subject is not configured for this student's class",
      400,
    );
  if (obtainedMarks > Number(examSubject.fullMarks))
    throw new AppError("Obtained marks cannot exceed full marks", 400);
  return exam;
};

export const listMarks = async (page: number, limit: number) => {
  const [data, total] = await Promise.all([
    prisma.mark.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "desc" },
      include: markInclude,
    }),
    prisma.mark.count(),
  ]);
  return pageResponse(data, total, page, limit);
};
export const getMark = async (id: number) => {
  const item = await prisma.mark.findUnique({
    where: { id },
    include: markInclude,
  });
  if (!item) throw new AppError("Mark not found", 404);
  return item;
};
export const createMark = async (data: MarkInput) => {
  await validateMark(
    data.examId,
    data.subjectId,
    data.studentId,
    data.obtainedMarks,
  );
  return prisma.mark.create({ data, include: markInclude });
};
export const updateMark = async (id: number, data: Partial<MarkInput>) => {
  const current = await prisma.mark.findUniqueOrThrow({ where: { id } });
  await validateMark(
    data.examId ?? current.examId,
    data.subjectId ?? current.subjectId,
    data.studentId ?? current.studentId,
    data.obtainedMarks ?? Number(current.obtainedMarks),
  );
  return prisma.mark.update({ where: { id }, data, include: markInclude });
};
export const deleteMark = (id: number) => prisma.mark.delete({ where: { id } });

export const saveBulkMarks = async (input: BulkMarksInput) => {
  const exam = await prisma.exam.findUniqueOrThrow({
    where: { id: input.examId },
    select: { academicYearId: true },
  });
  const examSubject = await prisma.examSubject.findFirst({
    where: {
      examId: input.examId,
      subjectId: input.subjectId,
      classId: input.classId,
    },
  });
  if (!examSubject)
    throw new AppError(
      "Subject is not configured for this exam and class",
      400,
    );
  if (
    input.marks.some(
      ({ obtainedMarks }) => obtainedMarks > Number(examSubject.fullMarks),
    )
  ) {
    throw new AppError("Obtained marks cannot exceed full marks", 400);
  }
  const studentIds = input.marks.map(({ studentId }) => studentId);
  const enrollments = await prisma.studentEnrollment.findMany({
    where: {
      studentId: { in: studentIds },
      classId: input.classId,
      academicYearId: exam.academicYearId,
      status: "ACTIVE",
    },
    select: { studentId: true },
  });
  if (
    new Set(enrollments.map(({ studentId }) => studentId)).size !==
    studentIds.length
  ) {
    throw new AppError(
      "Every student must be actively enrolled in this class and academic year",
      400,
    );
  }
  return prisma.$transaction(async (tx) => {
    const saved = [];
    for (const mark of input.marks) {
      const existing = await tx.mark.findFirst({
        where: {
          examId: input.examId,
          subjectId: input.subjectId,
          studentId: mark.studentId,
        },
        select: { id: true },
      });
      const data = {
        ...mark,
        examId: input.examId,
        subjectId: input.subjectId,
      };
      saved.push(
        existing
          ? await tx.mark.update({ where: { id: existing.id }, data })
          : await tx.mark.create({ data }),
      );
    }
    return saved;
  });
};

export const getResults = async (
  academicYearId: number,
  examId: number,
  classId: number,
  sectionId: number,
  studentUserId?: number,
) => {
  const exam = await prisma.exam.findUniqueOrThrow({
    where: { id: examId },
    select: { academicYearId: true },
  });
  if (exam.academicYearId !== academicYearId)
    throw new AppError("Exam does not belong to this academic year", 400);
  const enrollments = await prisma.studentEnrollment.findMany({
    where: {
      academicYearId,
      classId,
      sectionId,
      status: "ACTIVE",
      ...(studentUserId ? { student: { userId: studentUserId } } : {}),
    },
    include: {
      student: { include: { user: { select: { id: true, name: true } } } },
    },
  });
  const examSubjects = await prisma.examSubject.findMany({
    where: { examId, classId },
    include: { subject: true },
    orderBy: { id: "asc" },
  });
  if (!examSubjects.length)
    throw new AppError(
      "No subjects are configured for this exam and class",
      404,
    );
  const marks = await prisma.mark.findMany({
    where: {
      examId,
      studentId: { in: enrollments.map(({ studentId }) => studentId) },
    },
  });
  const marksByStudent = new Map<number, Map<number, number>>();
  for (const mark of marks) {
    const scores =
      marksByStudent.get(mark.studentId) ?? new Map<number, number>();
    scores.set(mark.subjectId, Number(mark.obtainedMarks));
    marksByStudent.set(mark.studentId, scores);
  }
  const totalFullMarks = examSubjects.reduce(
    (total, subject) => total + Number(subject.fullMarks),
    0,
  );
  const results = enrollments.map((enrollment) => {
    const scores =
      marksByStudent.get(enrollment.studentId) ?? new Map<number, number>();
    const subjects = examSubjects.map((subject) => ({
      subject: subject.subject,
      fullMarks: Number(subject.fullMarks),
      passMarks: Number(subject.passMarks),
      obtainedMarks: scores.get(subject.subjectId) ?? 0,
    }));
    const totalObtained = subjects.reduce(
      (total, subject) => total + subject.obtainedMarks,
      0,
    );
    const percentage = totalFullMarks
      ? (totalObtained / totalFullMarks) * 100
      : 0;
    const failed = subjects.some(
      (subject) => subject.obtainedMarks < subject.passMarks,
    );
    const grade = failed
      ? "F"
      : percentage >= 80
        ? "A+"
        : percentage >= 70
          ? "A"
          : percentage >= 60
            ? "A-"
            : percentage >= 50
              ? "B"
              : percentage >= 40
                ? "C"
                : percentage >= 33
                  ? "D"
                  : "F";
    return {
      studentId: enrollment.studentId,
      studentCode: enrollment.student.studentId,
      name: enrollment.student.user.name,
      rollNumber: enrollment.rollNumber,
      subjects,
      totalObtained,
      totalFullMarks,
      percentage: Number(percentage.toFixed(2)),
      grade,
    };
  });
  const ranked = [...results].sort(
    (left, right) => right.totalObtained - left.totalObtained,
  );
  const ranks = new Map<number, number>();
  let previousScore = Number.NaN;
  let rank = 0;
  ranked.forEach((result, index) => {
    if (result.totalObtained !== previousScore) rank = index + 1;
    ranks.set(result.studentId, rank);
    previousScore = result.totalObtained;
  });
  return {
    data: results.map((result) => ({
      ...result,
      rank: ranks.get(result.studentId),
    })),
    meta: { totalFullMarks, students: results.length },
  };
};
