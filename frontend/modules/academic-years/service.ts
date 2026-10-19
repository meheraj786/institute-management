import {
  apiClient,
  responseData,
  responsePage,
  type ApiEnvelope,
  type Paged,
} from "@/lib/api-client";
import type { AcademicYearInput, UpdateAcademicYearInput } from "./schemas";

export type AcademicYear = {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};
const base = "/academic-years";
export const listAcademicYears = (page = 1, limit = 50) =>
  apiClient
    .get<ApiEnvelope<AcademicYear[]>>(base, { params: { page, limit } })
    .then(responsePage) as Promise<Paged<AcademicYear>>;
export const getAcademicYear = (id: number) =>
  apiClient.get<ApiEnvelope<AcademicYear>>(`${base}/${id}`).then(responseData);
export const createAcademicYear = (input: AcademicYearInput) =>
  apiClient.post<ApiEnvelope<AcademicYear>>(base, input).then(responseData);
export const updateAcademicYear = (
  id: number,
  input: UpdateAcademicYearInput,
) =>
  apiClient
    .patch<ApiEnvelope<AcademicYear>>(`${base}/${id}`, input)
    .then(responseData);
export const deleteAcademicYear = (id: number) =>
  apiClient
    .delete<ApiEnvelope<AcademicYear>>(`${base}/${id}`)
    .then(responseData);
