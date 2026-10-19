import { apiClient, responseData, type ApiEnvelope } from "@/lib/api-client";
import type { LoginInput, RegisterInput } from "./schemas";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
  phone?: string | null;
  status: "ACTIVE" | "INACTIVE";
};
export const login = (input: LoginInput) =>
  apiClient
    .post<ApiEnvelope<AuthUser>>("/auth/login", input)
    .then(responseData);
export const register = (input: RegisterInput) =>
  apiClient
    .post<ApiEnvelope<AuthUser>>("/auth/register", input)
    .then(responseData);
export const logout = () =>
  apiClient.post<ApiEnvelope<null>>("/auth/logout").then(responseData);
export const getCurrentUser = () =>
  apiClient.get<ApiEnvelope<AuthUser>>("/auth/me").then(responseData);
