import type { RequestHandler } from "express";
import { parseId } from "../../utils/http";
import * as studentsService from "./students.service";
import type {
  CreateStudentInput,
  StudentEnrollmentInput,
} from "./students.service";

type CrudService<CreateInput extends object, UpdateInput extends object> = {
  list: (
    page: number,
    limit: number,
  ) => Promise<{ data: unknown; pagination: unknown }>;
  get: (id: number) => Promise<unknown>;
  create: (input: CreateInput) => Promise<unknown>;
  update: (id: number, input: UpdateInput) => Promise<unknown>;
  remove: (id: number) => Promise<unknown>;
};

const page = (value: unknown, fallback: number, max: number) => {
  const parsed = Number(value ?? fallback);
  return Number.isInteger(parsed) && parsed > 0
    ? Math.min(parsed, max)
    : fallback;
};

const crudController = <CreateInput extends object, UpdateInput extends object>(
  service: CrudService<CreateInput, UpdateInput>,
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

export const studentsController = crudController<
  CreateStudentInput,
  Record<string, unknown>
>(
  {
    list: studentsService.listStudents,
    get: studentsService.getStudent,
    create: studentsService.createStudent,
    update: studentsService.updateStudent,
    remove: studentsService.deleteStudent,
  },
  "Student",
);

export const enrollmentsController = crudController<
  StudentEnrollmentInput,
  Record<string, unknown>
>(
  {
    list: studentsService.listEnrollments,
    get: studentsService.getEnrollment,
    create: studentsService.createEnrollment,
    update: studentsService.updateEnrollment,
    remove: studentsService.deleteEnrollment,
  },
  "Enrollment",
);

export const generateId: RequestHandler = (_req, res) => {
  res.json({
    success: true,
    data: { studentId: studentsService.generateStudentId() },
  });
};
