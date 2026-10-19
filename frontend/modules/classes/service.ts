import {
  apiClient,
  responseData,
  responsePage,
  type ApiEnvelope,
  type Paged,
} from "@/lib/api-client";
import type { ClassInput, ClassSectionInput } from "./schemas";

export type ClassRecord = {
  id: number;
  name: string;
  numericValue?: number | null;
  status: "ACTIVE" | "INACTIVE";
};
export type ClassSectionRecord = {
  id: number;
  classId: number;
  sectionId: number;
  academicYearId: number;
  class?: ClassRecord;
  section?: { id: number; name: string };
  academicYear?: { id: number; title: string };
};
const base = "/classes";
export const listClasses = (page = 1, limit = 100) =>
  apiClient
    .get<ApiEnvelope<ClassRecord[]>>(base, { params: { page, limit } })
    .then(responsePage) as Promise<Paged<ClassRecord>>;
export const getClass = (id: number) =>
  apiClient.get<ApiEnvelope<ClassRecord>>(`${base}/${id}`).then(responseData);
export const createClass = (input: ClassInput) =>
  apiClient.post<ApiEnvelope<ClassRecord>>(base, input).then(responseData);
export const updateClass = (id: number, input: Partial<ClassInput>) =>
  apiClient
    .patch<ApiEnvelope<ClassRecord>>(`${base}/${id}`, input)
    .then(responseData);
export const deleteClass = (id: number) =>
  apiClient
    .delete<ApiEnvelope<ClassRecord>>(`${base}/${id}`)
    .then(responseData);
export const listClassSections = (page = 1, limit = 100) =>
  apiClient
    .get<
      ApiEnvelope<ClassSectionRecord[]>
    >(`${base}/sections`, { params: { page, limit } })
    .then(responsePage) as Promise<Paged<ClassSectionRecord>>;
export const getClassSection = (id: number) =>
  apiClient
    .get<ApiEnvelope<ClassSectionRecord>>(`${base}/sections/${id}`)
    .then(responseData);
export const createClassSection = (input: ClassSectionInput) =>
  apiClient
    .post<ApiEnvelope<ClassSectionRecord>>(`${base}/sections`, input)
    .then(responseData);
export const updateClassSection = (
  id: number,
  input: Partial<ClassSectionInput>,
) =>
  apiClient
    .patch<ApiEnvelope<ClassSectionRecord>>(`${base}/sections/${id}`, input)
    .then(responseData);
export const deleteClassSection = (id: number) =>
  apiClient
    .delete<ApiEnvelope<ClassSectionRecord>>(`${base}/sections/${id}`)
    .then(responseData);
