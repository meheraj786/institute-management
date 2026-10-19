"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import * as service from "./service";

export const useFeeHeads = (page = 1, limit = 100) =>
  useQuery({
    queryKey: [...queryKeys.feeHeads, page, limit],
    queryFn: () => service.listFeeHeads(page, limit),
  });
export const useFeeHead = (id: number) =>
  useQuery({
    queryKey: [...queryKeys.feeHeads, id],
    queryFn: () => service.getFeeHead(id),
    enabled: id > 0,
  });
export const useFeeStructures = (page = 1, limit = 100) =>
  useQuery({
    queryKey: [...queryKeys.feeStructures, page, limit],
    queryFn: () => service.listFeeStructures(page, limit),
  });
export const useFeeStructure = (id: number) =>
  useQuery({
    queryKey: [...queryKeys.feeStructures, id],
    queryFn: () => service.getFeeStructure(id),
    enabled: id > 0,
  });
export const useFeeCollections = (page = 1, limit = 100) =>
  useQuery({
    queryKey: [...queryKeys.feeCollections, page, limit],
    queryFn: () => service.listFeeCollections(page, limit),
  });
export const useFeeCollection = (id: number) =>
  useQuery({
    queryKey: [...queryKeys.feeCollections, id],
    queryFn: () => service.getFeeCollection(id),
    enabled: id > 0,
  });
export const useFeeStudentSearch = (query: string) =>
  useQuery({
    queryKey: [...queryKeys.fees, "students", query],
    queryFn: () => service.searchFeeStudents(query),
    enabled: query.trim().length > 0,
  });
export const useStudentFeeDue = (
  studentId: number | null,
  academicYearId: number | null,
) =>
  useQuery({
    queryKey: [...queryKeys.fees, "due", studentId, academicYearId],
    queryFn: () => service.getStudentFeeDue(studentId!, academicYearId!),
    enabled: Boolean(studentId && academicYearId),
  });
export const useCreateFeeHead = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.createFeeHead,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.feeHeads }),
  });
};
export const useUpdateFeeHead = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Parameters<typeof service.updateFeeHead>[1];
    }) => service.updateFeeHead(id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.feeHeads }),
  });
};
export const useDeleteFeeHead = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.deleteFeeHead,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.feeHeads }),
  });
};
export const useCreateFeeStructure = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.createFeeStructure,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.feeStructures }),
  });
};
export const useUpdateFeeStructure = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Parameters<typeof service.updateFeeStructure>[1];
    }) => service.updateFeeStructure(id, input),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.feeStructures }),
  });
};
export const useDeleteFeeStructure = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.deleteFeeStructure,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.feeStructures }),
  });
};
export const useCreateFeeCollection = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.createFeeCollection,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.feeCollections });
      client.invalidateQueries({ queryKey: queryKeys.fees });
    },
  });
};
export const useUpdateFeeCollection = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Parameters<typeof service.updateFeeCollection>[1];
    }) => service.updateFeeCollection(id, input),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.feeCollections });
      client.invalidateQueries({ queryKey: queryKeys.fees });
    },
  });
};
export const useDeleteFeeCollection = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.deleteFeeCollection,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.feeCollections });
      client.invalidateQueries({ queryKey: queryKeys.fees });
    },
  });
};
