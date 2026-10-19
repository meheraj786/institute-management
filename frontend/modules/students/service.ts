import {
  apiClient,
  responseData,
  responsePage,
  type ApiEnvelope,
  type Paged,
} from "@/lib/api-client";
import type { StudentEnrollmentInput, StudentInput } from "./schemas";

export type StudentRecord = {
  id: number;
  userId: number;
  studentId: string;
  status: "ACTIVE" | "INACTIVE" | "ALUMNI";
  user?: { name: string; email: string; phone?: string | null };
  enrollments?: EnrollmentRecord[];
};
export type EnrollmentRecord = {
  id: number;
  studentId: number;
  academicYearId: number;
  classId: number;
  sectionId: number;
  rollNumber?: string | null;
  status: "ACTIVE" | "INACTIVE";
  student?: { user?: { name: string } };
  class?: { name: string };
  section?: { name: string };
  academicYear?: { title: string };
};
const base = "/students";
export const listStudents = (page = 1, limit = 50) =>
  apiClient
    .get<ApiEnvelope<StudentRecord[]>>(base, { params: { page, limit } })
    .then(responsePage) as Promise<Paged<StudentRecord>>;
export const getStudent = (id: number) =>
  apiClient.get<ApiEnvelope<StudentRecord>>(`${base}/${id}`).then(responseData);
export const generateStudentId = () =>
  apiClient
    .get<ApiEnvelope<{ studentId: string }>>(`${base}/generate-id`)
    .then(responseData);
export const createStudent = (input: StudentInput) =>
  apiClient.post<ApiEnvelope<StudentRecord>>(base, input).then(responseData);
export const updateStudent = (id: number, input: Partial<StudentInput>) =>
  apiClient
    .patch<ApiEnvelope<StudentRecord>>(`${base}/${id}`, input)
    .then(responseData);
export const deleteStudent = (id: number) =>
  apiClient
    .delete<ApiEnvelope<StudentRecord>>(`${base}/${id}`)
    .then(responseData);
export const listEnrollments = (page = 1, limit = 100) =>
  apiClient
    .get<
      ApiEnvelope<EnrollmentRecord[]>
    >(`${base}/enrollments`, { params: { page, limit } })
    .then(responsePage) as Promise<Paged<EnrollmentRecord>>;
export const getEnrollment = (id: number) =>
  apiClient
    .get<ApiEnvelope<EnrollmentRecord>>(`${base}/enrollments/${id}`)
    .then(responseData);
export const createEnrollment = (input: StudentEnrollmentInput) =>
  apiClient
    .post<ApiEnvelope<EnrollmentRecord>>(`${base}/enrollments`, input)
    .then(responseData);
export const updateEnrollment = (
  id: number,
  input: Partial<StudentEnrollmentInput>,
) =>
  apiClient
    .patch<ApiEnvelope<EnrollmentRecord>>(`${base}/enrollments/${id}`, input)
    .then(responseData);
export const deleteEnrollment = (id: number) =>
  apiClient
    .delete<ApiEnvelope<EnrollmentRecord>>(`${base}/enrollments/${id}`)
    .then(responseData);
