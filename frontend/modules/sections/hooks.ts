"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import * as service from "./service";

export const useSections = (page = 1, limit = 100) =>
  useQuery({
    queryKey: [...queryKeys.sections, page, limit],
    queryFn: () => service.listSections(page, limit),
  });
export const useSection = (id: number) =>
  useQuery({
    queryKey: [...queryKeys.sections, id],
    queryFn: () => service.getSection(id),
    enabled: id > 0,
  });
export const useCreateSection = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.createSection,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.sections }),
  });
};
export const useUpdateSection = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Parameters<typeof service.updateSection>[1];
    }) => service.updateSection(id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.sections }),
  });
};
export const useDeleteSection = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.deleteSection,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.sections }),
  });
};
