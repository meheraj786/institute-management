"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import * as service from "./service";

export const usePublicNotices = (page = 1, limit = 20) =>
  useQuery({
    queryKey: [...queryKeys.notices, "public", page, limit],
    queryFn: () => service.listPublicNotices(page, limit),
  });
export const usePublicNotice = (id: number) =>
  useQuery({
    queryKey: [...queryKeys.notices, "public", id],
    queryFn: () => service.getPublicNotice(id),
    enabled: id > 0,
  });
export const useNotices = (page = 1, limit = 50) =>
  useQuery({
    queryKey: [...queryKeys.notices, "manage", page, limit],
    queryFn: () => service.listNotices(page, limit),
  });
export const useNotice = (id: number) =>
  useQuery({
    queryKey: [...queryKeys.notices, "manage", id],
    queryFn: () => service.getNotice(id),
    enabled: id > 0,
  });
export const useCreateNotice = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.createNotice,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.notices }),
  });
};
export const useUpdateNotice = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Parameters<typeof service.updateNotice>[1];
    }) => service.updateNotice(id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.notices }),
  });
};
export const usePublishNotice = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.publishNotice,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.notices }),
  });
};
export const useDeleteNotice = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.deleteNotice,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.notices }),
  });
};
