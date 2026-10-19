"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import * as service from "./service";

export const useUsers = (page = 1, limit = 50) =>
  useQuery({
    queryKey: [...queryKeys.users, page, limit],
    queryFn: () => service.listUsers(page, limit),
  });
export const useUser = (id: number) =>
  useQuery({
    queryKey: [...queryKeys.users, id],
    queryFn: () => service.getUser(id),
    enabled: id > 0,
  });
export const useCreateUser = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.createUser,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.users }),
  });
};
export const useUpdateUser = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Parameters<typeof service.updateUser>[1];
    }) => service.updateUser(id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.users }),
  });
};
export const useDeleteUser = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.deleteUser,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.users }),
  });
};
