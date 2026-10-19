import axios from "axios";

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  pagination?: { page: number; limit: number; total: number; pages: number };
  meta?: Record<string, unknown>;
  message?: string;
};

export type Paged<T> = {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const responseData = <T>(response: { data: ApiEnvelope<T> }) =>
  response.data.data;

export const responsePage = <T>(response: { data: ApiEnvelope<T[]> }) => ({
  data: response.data.data,
  pagination: response.data.pagination!,
});

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong";
};
