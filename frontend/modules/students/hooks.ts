"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import * as service from "./service";

export const useStudents = (page = 1, limit = 50) =>
  useQuery({
    queryKey: [...queryKeys.students, page, limit],
    queryFn: () => service.listStudents(page, limit),
  });
export const useStudent = (id: number) =>
  useQuery({
    queryKey: [...queryKeys.students, id],
    queryFn: () => service.getStudent(id),
    enabled: id > 0,
  });
export const useGenerateStudentId = () =>
  useMutation({ mutationFn: service.generateStudentId });
export const useCreateStudent = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.createStudent,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.students });
      client.invalidateQueries({ queryKey: queryKeys.studentEnrollments });
    },
  });
};
export const useUpdateStudent = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Parameters<typeof service.updateStudent>[1];
    }) => service.updateStudent(id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.students }),
  });
};
export const useDeleteStudent = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.deleteStudent,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.students });
      client.invalidateQueries({ queryKey: queryKeys.studentEnrollments });
    },
  });
};
export const useEnrollments = (page = 1, limit = 100) =>
  useQuery({
    queryKey: [...queryKeys.studentEnrollments, page, limit],
    queryFn: () => service.listEnrollments(page, limit),
  });
export const useEnrollment = (id: number) =>
  useQuery({
    queryKey: [...queryKeys.studentEnrollments, id],
    queryFn: () => service.getEnrollment(id),
    enabled: id > 0,
  });
export const useCreateEnrollment = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.createEnrollment,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.studentEnrollments });
      client.invalidateQueries({ queryKey: queryKeys.students });
    },
  });
};
export const useUpdateEnrollment = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Parameters<typeof service.updateEnrollment>[1];
    }) => service.updateEnrollment(id, input),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.studentEnrollments }),
  });
};
export const useDeleteEnrollment = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.deleteEnrollment,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.studentEnrollments }),
  });
};
