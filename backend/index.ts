import dotenv from "dotenv";
dotenv.config();
import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.route";
import academicYearRoutes from "./modules/academic-years/academic-years.route";
import attendanceRoutes from "./modules/attendances/attendances.route";
import classRoutes from "./modules/classes/classes.route";
import examRoutes from "./modules/exams/exams.route";
import feeRoutes from "./modules/fees/fees.route";
import noticeRoutes from "./modules/notices/notices.route";
import sectionRoutes from "./modules/sections/sections.route";
import studentRoutes from "./modules/students/students.route";
import subjectRoutes from "./modules/subjects/subjects.route";
import teacherRoutes from "./modules/teachers/teachers.route";
import userRoutes from "./modules/users/users.route";
import errorHandler from "./middleware/errorHandler";
import { AppError } from "./utils/http";

const app: Application = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (
  process.env.FRONTEND_URL ?? "http://localhost:5173,http://localhost:3000"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin))
        return callback(null, true);
      callback(new AppError("Origin is not allowed by CORS", 403));
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) =>
  res.json({ success: true, message: "API is healthy" }),
);
app.use("/api/auth", authRoutes);
app.use("/api/academic-years", academicYearRoutes);
app.use("/api/attendances", attendanceRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/users", userRoutes);

app.use((_req, res) =>
  res.status(404).json({ success: false, message: "Route not found" }),
);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
