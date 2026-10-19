"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import * as service from "./service";

export const useAttendances = (page = 1, limit = 50) =>
  useQuery({
    queryKey: [...queryKeys.attendance, page, limit],
    queryFn: () => service.listAttendances(page, limit),
  });
export const useAttendance = (id: number) =>
  useQuery({
    queryKey: [...queryKeys.attendance, id],
    queryFn: () => service.getAttendance(id),
    enabled: id > 0,
  });
export const useAttendanceRoster = (
  criteria: {
    academicYearId: number;
    classId: number;
    sectionId: number;
    date: string;
  } | null,
) =>
  useQuery({
    queryKey: [...queryKeys.attendance, "roster", criteria],
    queryFn: () => service.getAttendanceRoster(criteria!),
    enabled: Boolean(criteria),
  });
export const useCreateAttendance = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.createAttendance,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.attendance }),
  });
};
export const useUpdateAttendance = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Parameters<typeof service.updateAttendance>[1];
    }) => service.updateAttendance(id, input),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.attendance }),
  });
};
export const useDeleteAttendance = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.deleteAttendance,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.attendance }),
  });
};
export const useSaveBulkAttendance = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.saveBulkAttendance,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.attendance }),
  });
};
