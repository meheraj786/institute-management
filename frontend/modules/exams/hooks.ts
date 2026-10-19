"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import * as service from "./service";

export const useExams = (page = 1, limit = 100) =>
  useQuery({
    queryKey: [...queryKeys.exams, page, limit],
    queryFn: () => service.listExams(page, limit),
  });
export const useExam = (id: number) =>
  useQuery({
    queryKey: [...queryKeys.exams, id],
    queryFn: () => service.getExam(id),
    enabled: id > 0,
  });
export const useExamSubjects = (page = 1, limit = 100) =>
  useQuery({
    queryKey: [...queryKeys.examSubjects, page, limit],
    queryFn: () => service.listExamSubjects(page, limit),
  });
export const useExamSubject = (id: number) =>
  useQuery({
    queryKey: [...queryKeys.examSubjects, id],
    queryFn: () => service.getExamSubject(id),
    enabled: id > 0,
  });
export const useMarks = (page = 1, limit = 100) =>
  useQuery({
    queryKey: [...queryKeys.marks, page, limit],
    queryFn: () => service.listMarks(page, limit),
  });
export const useMark = (id: number) =>
  useQuery({
    queryKey: [...queryKeys.marks, id],
    queryFn: () => service.getMark(id),
    enabled: id > 0,
  });
export const useResults = (
  criteria: {
    academicYearId: number;
    examId: number;
    classId: number;
    sectionId: number;
  } | null,
) =>
  useQuery({
    queryKey: [...queryKeys.results, criteria],
    queryFn: () => service.getResults(criteria!),
    enabled: Boolean(criteria),
  });
export const useCreateExam = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.createExam,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.exams }),
  });
};
export const useUpdateExam = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Parameters<typeof service.updateExam>[1];
    }) => service.updateExam(id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.exams }),
  });
};
export const useDeleteExam = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.deleteExam,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.exams }),
  });
};
export const useCreateExamSubject = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.createExamSubject,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.examSubjects }),
  });
};
export const useUpdateExamSubject = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Parameters<typeof service.updateExamSubject>[1];
    }) => service.updateExamSubject(id, input),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.examSubjects }),
  });
};
export const useDeleteExamSubject = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.deleteExamSubject,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.examSubjects }),
  });
};
export const useCreateMark = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.createMark,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.marks });
      client.invalidateQueries({ queryKey: queryKeys.results });
    },
  });
};
export const useUpdateMark = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Parameters<typeof service.updateMark>[1];
    }) => service.updateMark(id, input),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.marks });
      client.invalidateQueries({ queryKey: queryKeys.results });
    },
  });
};
export const useDeleteMark = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.deleteMark,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.marks });
      client.invalidateQueries({ queryKey: queryKeys.results });
    },
  });
};
export const useSaveBulkMarks = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.saveBulkMarks,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.marks });
      client.invalidateQueries({ queryKey: queryKeys.results });
    },
  });
};
