import type { RequestHandler } from "express";
import { parseId } from "../../utils/http";
import * as classesService from "./classes.service";
import type { ClassInput, ClassSectionInput } from "./classes.service";

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

const crudHandlers = <CreateInput extends object, UpdateInput extends object>(
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
  get: (async (req, res) => {
    res.json({
      success: true,
      data: await service.get(parseId(String(req.params.id))),
    });
  }) as RequestHandler,
  create: (async (req, res) => {
    res
      .status(201)
      .json({
        success: true,
        data: await service.create(req.body as CreateInput),
      });
  }) as RequestHandler,
  update: (async (req, res) => {
    res.json({
      success: true,
      data: await service.update(
        parseId(String(req.params.id)),
        req.body as UpdateInput,
      ),
    });
  }) as RequestHandler,
  remove: (async (req, res) => {
    res.json({
      success: true,
      message: `${label} deleted`,
      data: await service.remove(parseId(String(req.params.id))),
    });
  }) as RequestHandler,
});

export const classesController = crudHandlers<ClassInput, Partial<ClassInput>>(
  {
    list: classesService.listClasses,
    get: classesService.getClass,
    create: classesService.createClass,
    update: classesService.updateClass,
    remove: classesService.deleteClass,
  },
  "Class",
);

export const classSectionsController = crudHandlers<
  ClassSectionInput,
  Partial<ClassSectionInput>
>(
  {
    list: classesService.listClassSections,
    get: classesService.getClassSection,
    create: classesService.createClassSection,
    update: classesService.updateClassSection,
    remove: classesService.deleteClassSection,
  },
  "Class-section mapping",
);
