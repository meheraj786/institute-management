"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import * as service from "./service";

export const useSubjects = (page = 1, limit = 100) =>
  useQuery({
    queryKey: [...queryKeys.subjects, page, limit],
    queryFn: () => service.listSubjects(page, limit),
  });
export const useSubject = (id: number) =>
  useQuery({
    queryKey: [...queryKeys.subjects, id],
    queryFn: () => service.getSubject(id),
    enabled: id > 0,
  });
export const useClassSubjects = (page = 1, limit = 100) =>
  useQuery({
    queryKey: [...queryKeys.classSubjects, page, limit],
    queryFn: () => service.listClassSubjects(page, limit),
  });
export const useClassSubject = (id: number) =>
  useQuery({
    queryKey: [...queryKeys.classSubjects, id],
    queryFn: () => service.getClassSubject(id),
    enabled: id > 0,
  });
export const useCreateSubject = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.createSubject,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.subjects }),
  });
};
export const useUpdateSubject = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Parameters<typeof service.updateSubject>[1];
    }) => service.updateSubject(id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.subjects }),
  });
};
export const useDeleteSubject = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.deleteSubject,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.subjects }),
  });
};
export const useCreateClassSubject = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.createClassSubject,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.classSubjects }),
  });
};
export const useUpdateClassSubject = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Parameters<typeof service.updateClassSubject>[1];
    }) => service.updateClassSubject(id, input),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.classSubjects }),
  });
};
export const useDeleteClassSubject = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.deleteClassSubject,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.classSubjects }),
  });
};
