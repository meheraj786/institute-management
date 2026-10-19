import type { RequestHandler } from "express";
import { parseId } from "../../utils/http";
import * as academicYearsService from "./academic-years.service";

const page = (value: unknown, fallback: number, max: number) => {
  const parsed = Number(value ?? fallback);
  return Number.isInteger(parsed) && parsed > 0
    ? Math.min(parsed, max)
    : fallback;
};

export const list: RequestHandler = async (req, res) => {
  const result = await academicYearsService.listAcademicYears(
    page(req.query.page, 1, Number.MAX_SAFE_INTEGER),
    page(req.query.limit, 20, 100),
  );
  res.json({ success: true, ...result });
};
export const get: RequestHandler = async (req, res) => {
  res.json({
    success: true,
    data: await academicYearsService.getAcademicYear(
      parseId(String(req.params.id)),
    ),
  });
};
export const create: RequestHandler = async (req, res) => {
  res
    .status(201)
    .json({
      success: true,
      data: await academicYearsService.createAcademicYear(req.body),
    });
};
export const update: RequestHandler = async (req, res) => {
  res.json({
    success: true,
    data: await academicYearsService.updateAcademicYear(
      parseId(String(req.params.id)),
      req.body,
    ),
  });
};
export const remove: RequestHandler = async (req, res) => {
  res.json({
    success: true,
    message: "Academic year deleted",
    data: await academicYearsService.deleteAcademicYear(
      parseId(String(req.params.id)),
    ),
  });
};
