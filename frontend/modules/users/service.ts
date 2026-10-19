import {
  apiClient,
  responseData,
  responsePage,
  type ApiEnvelope,
  type Paged,
} from "@/lib/api-client";
import type { UserInput } from "./schemas";

export type UserRecord = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
  status: "ACTIVE" | "INACTIVE";
};
const base = "/users";
export const listUsers = (page = 1, limit = 50) =>
  apiClient
    .get<ApiEnvelope<UserRecord[]>>(base, { params: { page, limit } })
    .then(responsePage) as Promise<Paged<UserRecord>>;
export const getUser = (id: number) =>
  apiClient.get<ApiEnvelope<UserRecord>>(`${base}/${id}`).then(responseData);
export const createUser = (input: UserInput) =>
  apiClient.post<ApiEnvelope<UserRecord>>(base, input).then(responseData);
export const updateUser = (id: number, input: Partial<UserInput>) =>
  apiClient
    .patch<ApiEnvelope<UserRecord>>(`${base}/${id}`, input)
    .then(responseData);
export const deleteUser = (id: number) =>
  apiClient.delete<ApiEnvelope<UserRecord>>(`${base}/${id}`).then(responseData);
