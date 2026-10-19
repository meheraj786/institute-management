import type { RequestHandler } from "express";
import { AppError, parseId } from "../../utils/http";
import * as attendanceService from "./attendances.service";
import type {
  BulkAttendanceInput,
  CreateAttendanceInput,
} from "./attendances.service";

const page = (value: unknown, fallback: number, max: number) => {
  const parsed = Number(value ?? fallback);
  return Number.isInteger(parsed) && parsed > 0
    ? Math.min(parsed, max)
    : fallback;
};

export const list: RequestHandler = async (req, res) => {
  const result = await attendanceService.listAttendances(
    page(req.query.page, 1, Number.MAX_SAFE_INTEGER),
    page(req.query.limit, 20, 100),
  );
  res.json({ success: true, ...result });
};
export const get: RequestHandler = async (req, res) => {
  res.json({
    success: true,
    data: await attendanceService.getAttendance(parseId(String(req.params.id))),
  });
};
export const create: RequestHandler = async (req, res) => {
  const data = await attendanceService.createAttendance(
    req.body as CreateAttendanceInput,
    req.user!.id,
  );
  res.status(201).json({ success: true, data });
};
export const update: RequestHandler = async (req, res) => {
  const data = await attendanceService.updateAttendance(
    parseId(String(req.params.id)),
    req.body,
  );
  res.json({ success: true, data });
};
export const remove: RequestHandler = async (req, res) => {
  const data = await attendanceService.deleteAttendance(
    parseId(String(req.params.id)),
  );
  res.json({ success: true, message: "Attendance deleted", data });
};
export const roster: RequestHandler = async (req, res) => {
  const academicYearId = parseId(String(req.query.academicYearId));
  const classId = parseId(String(req.query.classId));
  const sectionId = parseId(String(req.query.sectionId));
  const date = new Date(String(req.query.date));
  if (Number.isNaN(date.getTime()))
    throw new AppError("A valid attendance date is required", 400);
  date.setUTCHours(0, 0, 0, 0);
  const data = await attendanceService.getClassRoster(
    academicYearId,
    classId,
    sectionId,
    date,
  );
  res.json({ success: true, data });
};
export const bulk: RequestHandler = async (req, res) => {
  const data = await attendanceService.saveBulkAttendance(
    req.body as BulkAttendanceInput,
    req.user!.id,
  );
  res.status(201).json({ success: true, message: "Attendance recorded", data });
};
