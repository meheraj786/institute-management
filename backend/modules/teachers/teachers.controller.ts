import type { RequestHandler } from "express";
import { parseId } from "../../utils/http";
import * as teachersService from "./teachers.service";
import type { TeacherAssignmentInput, TeacherInput } from "./teachers.service";

type Service<CreateInput extends object, UpdateInput extends object> = {
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
const controller = <CreateInput extends object, UpdateInput extends object>(
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

export const teachersController = controller<
  TeacherInput,
  Record<string, unknown>
>(
  {
    list: teachersService.listTeachers,
    get: teachersService.getTeacher,
    create: teachersService.createTeacher,
    update: teachersService.updateTeacher,
    remove: teachersService.deleteTeacher,
  },
  "Teacher",
);

export const assignmentsController = controller<
  TeacherAssignmentInput,
  Record<string, unknown>
>(
  {
    list: teachersService.listTeacherAssignments,
    get: teachersService.getTeacherAssignment,
    create: teachersService.createTeacherAssignment,
    update: teachersService.updateTeacherAssignment,
    remove: teachersService.deleteTeacherAssignment,
  },
  "Teacher assignment",
);
