"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import * as service from "./service";

export const useTeachers = (page = 1, limit = 50) =>
  useQuery({
    queryKey: [...queryKeys.teachers, page, limit],
    queryFn: () => service.listTeachers(page, limit),
  });
export const useTeacher = (id: number) =>
  useQuery({
    queryKey: [...queryKeys.teachers, id],
    queryFn: () => service.getTeacher(id),
    enabled: id > 0,
  });
export const useCreateTeacher = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.createTeacher,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.teachers }),
  });
};
export const useUpdateTeacher = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Parameters<typeof service.updateTeacher>[1];
    }) => service.updateTeacher(id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.teachers }),
  });
};
export const useDeleteTeacher = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.deleteTeacher,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.teachers });
      client.invalidateQueries({ queryKey: queryKeys.teacherAssignments });
    },
  });
};
export const useTeacherAssignments = (page = 1, limit = 100) =>
  useQuery({
    queryKey: [...queryKeys.teacherAssignments, page, limit],
    queryFn: () => service.listTeacherAssignments(page, limit),
  });
export const useTeacherAssignment = (id: number) =>
  useQuery({
    queryKey: [...queryKeys.teacherAssignments, id],
    queryFn: () => service.getTeacherAssignment(id),
    enabled: id > 0,
  });
export const useCreateTeacherAssignment = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.createTeacherAssignment,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.teacherAssignments }),
  });
};
export const useUpdateTeacherAssignment = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Parameters<typeof service.updateTeacherAssignment>[1];
    }) => service.updateTeacherAssignment(id, input),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.teacherAssignments }),
  });
};
export const useDeleteTeacherAssignment = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.deleteTeacherAssignment,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.teacherAssignments }),
  });
};
