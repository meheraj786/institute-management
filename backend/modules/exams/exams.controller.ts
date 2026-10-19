import type { RequestHandler } from "express";
import { AppError, parseId } from "../../utils/http";
import * as examsService from "./exams.service";
import type {
  BulkMarksInput,
  ExamInput,
  ExamSubjectInput,
  MarkInput,
} from "./exams.service";

type Service<CreateInput extends object, UpdateInput extends object> = {
  list: (
    page: number,
    limit: number,
  ) => Promise<{ data: unknown; pagination: unknown }>;
  get: (id: number) => Promise<unknown>;
  create: (data: CreateInput) => Promise<unknown>;
  update: (id: number, data: UpdateInput) => Promise<unknown>;
  remove: (id: number) => Promise<unknown>;
};
const page = (value: unknown, fallback: number, max: number) => {
  const parsed = Number(value ?? fallback);
  return Number.isInteger(parsed) && parsed > 0
    ? Math.min(parsed, max)
    : fallback;
};
const handlers = <CreateInput extends object, UpdateInput extends object>(
  service: Service<CreateInput, UpdateInput>,
  label: string,
) => ({
  list: (async (req, res) => {
    const result = await service.list(
      page(req.query.page, 1, Number.MAX_SAFE_INTEGER),
      page(req.query.limit, 20, 100),
    );
    res.json({ success: true, ...result });
  }) as RequestHandler,
  get: (async (req, res) =>
    res.json({
      success: true,
      data: await service.get(parseId(String(req.params.id))),
    })) as RequestHandler,
  create: (async (req, res) =>
    res
      .status(201)
      .json({
        success: true,
        data: await service.create(req.body as CreateInput),
      })) as RequestHandler,
  update: (async (req, res) =>
    res.json({
      success: true,
      data: await service.update(
        parseId(String(req.params.id)),
        req.body as UpdateInput,
      ),
    })) as RequestHandler,
  remove: (async (req, res) =>
    res.json({
      success: true,
      message: `${label} deleted`,
      data: await service.remove(parseId(String(req.params.id))),
    })) as RequestHandler,
});

export const examsController = handlers<ExamInput, Partial<ExamInput>>(
  {
    list: examsService.listExams,
    get: examsService.getExam,
    create: examsService.createExam,
    update: examsService.updateExam,
    remove: examsService.deleteExam,
  },
  "Exam",
);
export const examSubjectsController = handlers<
  ExamSubjectInput,
  Partial<ExamSubjectInput>
>(
  {
    list: examsService.listExamSubjects,
    get: examsService.getExamSubject,
    create: examsService.createExamSubject,
    update: examsService.updateExamSubject,
    remove: examsService.deleteExamSubject,
  },
  "Exam subject",
);
export const marksController = handlers<MarkInput, Partial<MarkInput>>(
  {
    list: examsService.listMarks,
    get: examsService.getMark,
    create: examsService.createMark,
    update: examsService.updateMark,
    remove: examsService.deleteMark,
  },
  "Mark",
);

export const bulkMarks: RequestHandler = async (req, res) => {
  const data = await examsService.saveBulkMarks(req.body as BulkMarksInput);
  res.status(201).json({ success: true, message: "Marks recorded", data });
};
export const results: RequestHandler = async (req, res) => {
  const academicYearId = parseId(String(req.query.academicYearId));
  const examId = parseId(String(req.query.examId));
  const classId = parseId(String(req.query.classId));
  const sectionId = parseId(String(req.query.sectionId));
  const result = await examsService.getResults(
    academicYearId,
    examId,
    classId,
    sectionId,
    req.user!.role === "STUDENT" ? req.user!.id : undefined,
  );
  res.json({ success: true, ...result });
};
