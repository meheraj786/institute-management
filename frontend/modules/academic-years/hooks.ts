"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import * as service from "./service";

export const useAcademicYears = (page = 1, limit = 50) =>
  useQuery({
    queryKey: [...queryKeys.academicYears, page, limit],
    queryFn: () => service.listAcademicYears(page, limit),
  });
export const useAcademicYear = (id: number) =>
  useQuery({
    queryKey: [...queryKeys.academicYears, id],
    queryFn: () => service.getAcademicYear(id),
    enabled: id > 0,
  });
export const useCreateAcademicYear = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.createAcademicYear,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.academicYears }),
  });
};
export const useUpdateAcademicYear = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Parameters<typeof service.updateAcademicYear>[1];
    }) => service.updateAcademicYear(id, input),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.academicYears }),
  });
};
export const useDeleteAcademicYear = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.deleteAcademicYear,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.academicYears }),
  });
};
