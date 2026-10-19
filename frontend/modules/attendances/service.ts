import {
  apiClient,
  responseData,
  responsePage,
  type ApiEnvelope,
  type Paged,
} from "@/lib/api-client";
import type { AttendanceInput, BulkAttendanceInput } from "./schemas";

export type AttendanceRecord = {
  id: number;
  studentId: number;
  academicYearId: number;
  classId: number;
  sectionId: number;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  remarks?: string | null;
  student?: { user?: { name: string } };
};
export type AttendanceRosterRow = {
  id: number;
  studentId: number;
  rollNumber?: string | null;
  student: { studentId: string; user: { name: string; email: string } };
  attendance: Pick<AttendanceRecord, "status" | "remarks"> | null;
};
const base = "/attendances";
export const listAttendances = (page = 1, limit = 50) =>
  apiClient
    .get<ApiEnvelope<AttendanceRecord[]>>(base, { params: { page, limit } })
    .then(responsePage) as Promise<Paged<AttendanceRecord>>;
export const getAttendance = (id: number) =>
  apiClient
    .get<ApiEnvelope<AttendanceRecord>>(`${base}/${id}`)
    .then(responseData);
export const getAttendanceRoster = (criteria: {
  academicYearId: number;
  classId: number;
  sectionId: number;
  date: string;
}) =>
  apiClient
    .get<
      ApiEnvelope<AttendanceRosterRow[]>
    >(`${base}/roster`, { params: criteria })
    .then(responseData);
export const createAttendance = (input: AttendanceInput) =>
  apiClient.post<ApiEnvelope<AttendanceRecord>>(base, input).then(responseData);
export const updateAttendance = (id: number, input: Partial<AttendanceInput>) =>
  apiClient
    .patch<ApiEnvelope<AttendanceRecord>>(`${base}/${id}`, input)
    .then(responseData);
export const deleteAttendance = (id: number) =>
  apiClient
    .delete<ApiEnvelope<AttendanceRecord>>(`${base}/${id}`)
    .then(responseData);
export const saveBulkAttendance = (input: BulkAttendanceInput) =>
  apiClient
    .post<ApiEnvelope<AttendanceRecord[]>>(`${base}/bulk`, input)
    .then(responseData);
