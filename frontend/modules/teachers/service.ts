import {
  apiClient,
  responseData,
  responsePage,
  type ApiEnvelope,
  type Paged,
} from "@/lib/api-client";
import type { TeacherAssignmentInput, TeacherInput } from "./schemas";

export type TeacherRecord = {
  id: number;
  userId: number;
  employeeId?: string | null;
  designation?: string | null;
  status: "ACTIVE" | "INACTIVE";
  user?: { name: string; email: string; phone?: string | null };
};
export type TeacherAssignmentRecord = {
  id: number;
  teacherId: number;
  classId: number;
  sectionId: number;
  subjectId: number;
  academicYearId: number;
  teacher?: { user?: { name: string } };
  class?: { name: string };
  section?: { name: string };
  subject?: { name: string };
  academicYear?: { title: string };
};
const base = "/teachers";
export const listTeachers = (page = 1, limit = 50) =>
  apiClient
    .get<ApiEnvelope<TeacherRecord[]>>(base, { params: { page, limit } })
    .then(responsePage) as Promise<Paged<TeacherRecord>>;
export const getTeacher = (id: number) =>
  apiClient.get<ApiEnvelope<TeacherRecord>>(`${base}/${id}`).then(responseData);
export const createTeacher = (input: TeacherInput) =>
  apiClient.post<ApiEnvelope<TeacherRecord>>(base, input).then(responseData);
export const updateTeacher = (id: number, input: Partial<TeacherInput>) =>
  apiClient
    .patch<ApiEnvelope<TeacherRecord>>(`${base}/${id}`, input)
    .then(responseData);
export const deleteTeacher = (id: number) =>
  apiClient
    .delete<ApiEnvelope<TeacherRecord>>(`${base}/${id}`)
    .then(responseData);
export const listTeacherAssignments = (page = 1, limit = 100) =>
  apiClient
    .get<
      ApiEnvelope<TeacherAssignmentRecord[]>
    >(`${base}/assignments`, { params: { page, limit } })
    .then(responsePage) as Promise<Paged<TeacherAssignmentRecord>>;
export const getTeacherAssignment = (id: number) =>
  apiClient
    .get<ApiEnvelope<TeacherAssignmentRecord>>(`${base}/assignments/${id}`)
    .then(responseData);
export const createTeacherAssignment = (input: TeacherAssignmentInput) =>
  apiClient
    .post<ApiEnvelope<TeacherAssignmentRecord>>(`${base}/assignments`, input)
    .then(responseData);
export const updateTeacherAssignment = (
  id: number,
  input: Partial<TeacherAssignmentInput>,
) =>
  apiClient
    .patch<
      ApiEnvelope<TeacherAssignmentRecord>
    >(`${base}/assignments/${id}`, input)
    .then(responseData);
export const deleteTeacherAssignment = (id: number) =>
  apiClient
    .delete<ApiEnvelope<TeacherAssignmentRecord>>(`${base}/assignments/${id}`)
    .then(responseData);
