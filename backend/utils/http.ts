export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

export const parseId = (value: string): number => {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw new AppError("Invalid ID", 400);
  return id;
};
