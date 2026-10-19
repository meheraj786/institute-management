import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/http";

export type AuthUser = { id: number; role: string };

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticate: RequestHandler = async (req, _res, next) => {
  const token = req.cookies?.token;
  if (!token) return next(new AppError("Authentication required", 401));

  const secret = process.env.JWT_SECRET;
  if (!secret) return next(new AppError("JWT_SECRET is not configured", 500));

  let payload: JwtPayload;
  try {
    const verified = jwt.verify(token, secret);
    if (typeof verified === "string") throw new Error("Invalid token payload");
    payload = verified as JwtPayload;
  } catch {
    return next(new AppError("Invalid or expired token", 401));
  }

  const id = Number(payload.sub);
  if (!Number.isInteger(id))
    return next(new AppError("Invalid token payload", 401));

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, status: true },
    });
    if (!user || user.status !== "ACTIVE")
      return next(new AppError("Account is inactive", 401));
    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize =
  (...roles: string[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("Insufficient permissions", 403));
    }
    next();
  };
