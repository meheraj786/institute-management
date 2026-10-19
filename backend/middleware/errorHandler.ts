import { Request, Response, NextFunction } from "express";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Request failed";

  if (err.code === "P2025") {
    statusCode = 404;
    message = "Record not found";
  } else if (err.code === "P2002") {
    statusCode = 409;
    message = "A record with this value already exists";
  } else if (err.code === "P2003") {
    statusCode = 400;
    message = "The operation conflicts with related records";
  }
  if (statusCode >= 500) message = "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || null,
  });
};

export default errorHandler;
