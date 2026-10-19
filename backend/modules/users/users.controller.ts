import type { RequestHandler } from "express";
import { parseId } from "../../utils/http";
import * as usersService from "./users.service";

const pageNumber = (value: unknown, fallback: number, max: number) => {
  const number = Number(value ?? fallback);
  return Number.isInteger(number) && number > 0
    ? Math.min(number, max)
    : fallback;
};

export const list: RequestHandler = async (req, res) => {
  const result = await usersService.listUsers(
    pageNumber(req.query.page, 1, Number.MAX_SAFE_INTEGER),
    pageNumber(req.query.limit, 20, 100),
  );
  res.json({ success: true, ...result });
};

export const get: RequestHandler = async (req, res) => {
  const data = await usersService.getUser(parseId(String(req.params.id)));
  res.json({ success: true, data });
};

export const create: RequestHandler = async (req, res) => {
  const data = await usersService.createUser(req.body);
  res.status(201).json({ success: true, data });
};

export const update: RequestHandler = async (req, res) => {
  const data = await usersService.updateUser(
    parseId(String(req.params.id)),
    req.body,
  );
  res.json({ success: true, data });
};

export const remove: RequestHandler = async (req, res) => {
  const data = await usersService.deleteUser(parseId(String(req.params.id)));
  res.json({ success: true, message: "User deleted", data });
};
