"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import * as authService from "./service";

export const useCurrentUser = () =>
  useQuery({
    queryKey: queryKeys.auth,
    queryFn: authService.getCurrentUser,
    retry: false,
  });
export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (user) => queryClient.setQueryData(queryKeys.auth, user),
  });
};
export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.register,
    onSuccess: (user) => queryClient.setQueryData(queryKeys.auth, user),
  });
};
export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => queryClient.clear(),
  });
};
