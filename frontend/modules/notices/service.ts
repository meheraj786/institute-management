import {
  apiClient,
  responseData,
  responsePage,
  type ApiEnvelope,
  type Paged,
} from "@/lib/api-client";
import type { NoticeInput } from "./schemas";

export type NoticeRecord = {
  id: number;
  title: string;
  description: string;
  publishDate: string;
  status: "ACTIVE" | "INACTIVE";
  publisher?: { name: string };
};
const base = "/notices";
export const listPublicNotices = (page = 1, limit = 20) =>
  apiClient
    .get<ApiEnvelope<NoticeRecord[]>>(base, { params: { page, limit } })
    .then(responsePage) as Promise<Paged<NoticeRecord>>;
export const getPublicNotice = (id: number) =>
  apiClient.get<ApiEnvelope<NoticeRecord>>(`${base}/${id}`).then(responseData);
export const listNotices = (page = 1, limit = 50) =>
  apiClient
    .get<
      ApiEnvelope<NoticeRecord[]>
    >(`${base}/manage`, { params: { page, limit } })
    .then(responsePage) as Promise<Paged<NoticeRecord>>;
export const getNotice = (id: number) =>
  apiClient
    .get<ApiEnvelope<NoticeRecord>>(`${base}/manage/${id}`)
    .then(responseData);
export const createNotice = (input: NoticeInput) =>
  apiClient
    .post<ApiEnvelope<NoticeRecord>>(`${base}/manage`, input)
    .then(responseData);
export const updateNotice = (id: number, input: Partial<NoticeInput>) =>
  apiClient
    .patch<ApiEnvelope<NoticeRecord>>(`${base}/manage/${id}`, input)
    .then(responseData);
export const publishNotice = (id: number) =>
  apiClient
    .post<ApiEnvelope<NoticeRecord>>(`${base}/${id}/publish`)
    .then(responseData);
export const deleteNotice = (id: number) =>
  apiClient
    .delete<ApiEnvelope<NoticeRecord>>(`${base}/manage/${id}`)
    .then(responseData);
