import {
  apiClient,
  responseData,
  responsePage,
  type ApiEnvelope,
  type Paged,
} from "@/lib/api-client";
import type { ClassSubjectInput, SubjectInput } from "./schemas";

export type SubjectRecord = {
  id: number;
  name: string;
  code?: string | null;
  status: "ACTIVE" | "INACTIVE";
};
export type ClassSubjectRecord = {
  id: number;
  classId: number;
  subjectId: number;
  academicYearId: number;
  class?: { name: string };
  subject?: SubjectRecord;
  academicYear?: { title: string };
};
const base = "/subjects";
export const listSubjects = (page = 1, limit = 100) =>
  apiClient
    .get<ApiEnvelope<SubjectRecord[]>>(base, { params: { page, limit } })
    .then(responsePage) as Promise<Paged<SubjectRecord>>;
export const getSubject = (id: number) =>
  apiClient.get<ApiEnvelope<SubjectRecord>>(`${base}/${id}`).then(responseData);
export const createSubject = (input: SubjectInput) =>
  apiClient.post<ApiEnvelope<SubjectRecord>>(base, input).then(responseData);
export const updateSubject = (id: number, input: Partial<SubjectInput>) =>
  apiClient
    .patch<ApiEnvelope<SubjectRecord>>(`${base}/${id}`, input)
    .then(responseData);
export const deleteSubject = (id: number) =>
  apiClient
    .delete<ApiEnvelope<SubjectRecord>>(`${base}/${id}`)
    .then(responseData);
export const listClassSubjects = (page = 1, limit = 100) =>
  apiClient
    .get<
      ApiEnvelope<ClassSubjectRecord[]>
    >(`${base}/assignments`, { params: { page, limit } })
    .then(responsePage) as Promise<Paged<ClassSubjectRecord>>;
export const getClassSubject = (id: number) =>
  apiClient
    .get<ApiEnvelope<ClassSubjectRecord>>(`${base}/assignments/${id}`)
    .then(responseData);
export const createClassSubject = (input: ClassSubjectInput) =>
  apiClient
    .post<ApiEnvelope<ClassSubjectRecord>>(`${base}/assignments`, input)
    .then(responseData);
export const updateClassSubject = (
  id: number,
  input: Partial<ClassSubjectInput>,
) =>
  apiClient
    .patch<ApiEnvelope<ClassSubjectRecord>>(`${base}/assignments/${id}`, input)
    .then(responseData);
export const deleteClassSubject = (id: number) =>
  apiClient
    .delete<ApiEnvelope<ClassSubjectRecord>>(`${base}/assignments/${id}`)
    .then(responseData);
