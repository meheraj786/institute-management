import type { RequestHandler } from "express";
import { parseId } from "../../utils/http";
import * as subjectsService from "./subjects.service";
import type { ClassSubjectInput, SubjectInput } from "./subjects.service";

type CrudService<CreateInput extends object, UpdateInput extends object> = {
  list: (
    page: number,
    limit: number,
  ) => Promise<{ data: unknown; pagination: unknown }>;
  get: (id: number) => Promise<unknown>;
  create: (data: CreateInput) => Promise<unknown>;
  update: (id: number, data: UpdateInput) => Promise<unknown>;
  remove: (id: number) => Promise<unknown>;
};

const pageValue = (value: unknown, fallback: number, max: number) => {
  const parsed = Number(value ?? fallback);
  return Number.isInteger(parsed) && parsed > 0
    ? Math.min(parsed, max)
    : fallback;
};

const handlers = <CreateInput extends object, UpdateInput extends object>(
  service: CrudService<CreateInput, UpdateInput>,
  label: string,
) => ({
  list: (async (req, res) => {
    const result = await service.list(
      pageValue(req.query.page, 1, Number.MAX_SAFE_INTEGER),
      pageValue(req.query.limit, 20, 100),
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

export const subjectsController = handlers<SubjectInput, Partial<SubjectInput>>(
  {
    list: subjectsService.listSubjects,
    get: subjectsService.getSubject,
    create: subjectsService.createSubject,
    update: subjectsService.updateSubject,
    remove: subjectsService.deleteSubject,
  },
  "Subject",
);

export const classSubjectsController = handlers<
  ClassSubjectInput,
  Partial<ClassSubjectInput>
>(
  {
    list: subjectsService.listClassSubjects,
    get: subjectsService.getClassSubject,
    create: subjectsService.createClassSubject,
    update: subjectsService.updateClassSubject,
    remove: subjectsService.deleteClassSubject,
  },
  "Class-subject assignment",
);
