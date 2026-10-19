import type { RequestHandler } from "express";
import { parseId } from "../../utils/http";
import * as noticesService from "./notices.service";
import type { NoticeInput } from "./notices.service";

const page = (value: unknown, fallback: number, max: number) => {
  const parsed = Number(value ?? fallback);
  return Number.isInteger(parsed) && parsed > 0
    ? Math.min(parsed, max)
    : fallback;
};

export const publicList: RequestHandler = async (req, res) => {
  const result = await noticesService.listPublishedNotices(
    page(req.query.page, 1, Number.MAX_SAFE_INTEGER),
    page(req.query.limit, 20, 100),
  );
  res.json({ success: true, ...result });
};
export const publicGet: RequestHandler = async (req, res) => {
  res.json({
    success: true,
    data: await noticesService.getPublishedNotice(
      parseId(String(req.params.id)),
    ),
  });
};
export const list: RequestHandler = async (req, res) => {
  const result = await noticesService.listNotices(
    page(req.query.page, 1, Number.MAX_SAFE_INTEGER),
    page(req.query.limit, 20, 100),
  );
  res.json({ success: true, ...result });
};
export const get: RequestHandler = async (req, res) => {
  res.json({
    success: true,
    data: await noticesService.getNotice(parseId(String(req.params.id))),
  });
};
export const create: RequestHandler = async (req, res) => {
  const data = await noticesService.createNotice(
    req.body as NoticeInput,
    req.user!.id,
  );
  res.status(201).json({ success: true, data });
};
export const update: RequestHandler = async (req, res) => {
  const data = await noticesService.updateNotice(
    parseId(String(req.params.id)),
    req.body,
  );
  res.json({ success: true, data });
};
export const publish: RequestHandler = async (req, res) => {
  const data = await noticesService.publishNotice(
    parseId(String(req.params.id)),
  );
  res.json({ success: true, data });
};
export const remove: RequestHandler = async (req, res) => {
  const data = await noticesService.deleteNotice(
    parseId(String(req.params.id)),
  );
  res.json({ success: true, message: "Notice deleted", data });
};
