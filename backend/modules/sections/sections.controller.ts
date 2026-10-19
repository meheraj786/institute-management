import type { RequestHandler } from "express";
import { parseId } from "../../utils/http";
import * as sectionsService from "./sections.service";
import type { SectionInput } from "./sections.service";

const page = (value: unknown, fallback: number, maximum: number) => {
  const parsed = Number(value ?? fallback);
  return Number.isInteger(parsed) && parsed > 0
    ? Math.min(parsed, maximum)
    : fallback;
};

export const list: RequestHandler = async (req, res) => {
  const result = await sectionsService.listSections(
    page(req.query.page, 1, Number.MAX_SAFE_INTEGER),
    page(req.query.limit, 20, 100),
  );
  res.json({ success: true, ...result });
};
export const get: RequestHandler = async (req, res) => {
  res.json({
    success: true,
    data: await sectionsService.getSection(parseId(String(req.params.id))),
  });
};
export const create: RequestHandler = async (req, res) => {
  res
    .status(201)
    .json({
      success: true,
      data: await sectionsService.createSection(req.body as SectionInput),
    });
};
export const update: RequestHandler = async (req, res) => {
  res.json({
    success: true,
    data: await sectionsService.updateSection(
      parseId(String(req.params.id)),
      req.body as Partial<SectionInput>,
    ),
  });
};
export const remove: RequestHandler = async (req, res) => {
  res.json({
    success: true,
    message: "Section deleted",
    data: await sectionsService.deleteSection(parseId(String(req.params.id))),
  });
};
