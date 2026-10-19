"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import * as service from "./service";

export const useClasses = (page = 1, limit = 100) =>
  useQuery({
    queryKey: [...queryKeys.classes, page, limit],
    queryFn: () => service.listClasses(page, limit),
  });
export const useClass = (id: number) =>
  useQuery({
    queryKey: [...queryKeys.classes, id],
    queryFn: () => service.getClass(id),
    enabled: id > 0,
  });
export const useClassSections = (page = 1, limit = 100) =>
  useQuery({
    queryKey: [...queryKeys.classSections, page, limit],
    queryFn: () => service.listClassSections(page, limit),
  });
export const useClassSection = (id: number) =>
  useQuery({
    queryKey: [...queryKeys.classSections, id],
    queryFn: () => service.getClassSection(id),
    enabled: id > 0,
  });
const useInvalidateClasses = () => useQueryClient();
export const useCreateClass = () => {
  const client = useInvalidateClasses();
  return useMutation({
    mutationFn: service.createClass,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.classes }),
  });
};
export const useUpdateClass = () => {
  const client = useInvalidateClasses();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Parameters<typeof service.updateClass>[1];
    }) => service.updateClass(id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.classes }),
  });
};
export const useDeleteClass = () => {
  const client = useInvalidateClasses();
  return useMutation({
    mutationFn: service.deleteClass,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.classes }),
  });
};
export const useCreateClassSection = () => {
  const client = useInvalidateClasses();
  return useMutation({
    mutationFn: service.createClassSection,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.classSections }),
  });
};
export const useUpdateClassSection = () => {
  const client = useInvalidateClasses();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Parameters<typeof service.updateClassSection>[1];
    }) => service.updateClassSection(id, input),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.classSections }),
  });
};
export const useDeleteClassSection = () => {
  const client = useInvalidateClasses();
  return useMutation({
    mutationFn: service.deleteClassSection,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.classSections }),
  });
};
