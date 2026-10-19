import type { RequestHandler } from "express";
import * as authService from "./auth.service";

const cookieOptions = {
  httpOnly: true,
  secure:
    process.env.NODE_ENV === "production" ||
    process.env.COOKIE_SAME_SITE === "none",
  sameSite: (process.env.COOKIE_SAME_SITE === "none" ||
  process.env.COOKIE_SAME_SITE === "strict"
    ? process.env.COOKIE_SAME_SITE
    : "lax") as "lax" | "strict" | "none",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register: RequestHandler = async (req, res) => {
  const result = await authService.register(req.body);
  res.cookie("token", result.token, cookieOptions);
  res.status(201).json({
    success: true,
    message: "Registration successful",
    data: result.user,
  });
};

export const login: RequestHandler = async (req, res) => {
  const result = await authService.login(req.body);
  res.cookie("token", result.token, cookieOptions);
  res.json({ success: true, message: "Login successful", data: result.user });
};

export const logout: RequestHandler = (_req, res) => {
  res.clearCookie("token", { ...cookieOptions, maxAge: undefined });
  res.json({ success: true, message: "Logout successful" });
};

export const me: RequestHandler = async (req, res) => {
  const user = await authService.getCurrentUser(req.user!.id);
  res.json({ success: true, data: user });
};
