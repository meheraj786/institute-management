import {
  apiClient,
  responseData,
  responsePage,
  type ApiEnvelope,
  type Paged,
} from "@/lib/api-client";
import type { SectionInput } from "./schemas";

export type SectionRecord = {
  id: number;
  name: string;
  status: "ACTIVE" | "INACTIVE";
};
const base = "/sections";
export const listSections = (page = 1, limit = 100) =>
  apiClient
    .get<ApiEnvelope<SectionRecord[]>>(base, { params: { page, limit } })
    .then(responsePage) as Promise<Paged<SectionRecord>>;
export const getSection = (id: number) =>
  apiClient.get<ApiEnvelope<SectionRecord>>(`${base}/${id}`).then(responseData);
export const createSection = (input: SectionInput) =>
  apiClient.post<ApiEnvelope<SectionRecord>>(base, input).then(responseData);
export const updateSection = (id: number, input: Partial<SectionInput>) =>
  apiClient
    .patch<ApiEnvelope<SectionRecord>>(`${base}/${id}`, input)
    .then(responseData);
export const deleteSection = (id: number) =>
  apiClient
    .delete<ApiEnvelope<SectionRecord>>(`${base}/${id}`)
    .then(responseData);
