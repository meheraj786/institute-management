import {
  apiClient,
  responseData,
  responsePage,
  type ApiEnvelope,
  type Paged,
} from "@/lib/api-client";
import type {
  FeeCollectionInput,
  FeeHeadInput,
  FeeStructureInput,
} from "./schemas";

export type FeeHeadRecord = {
  id: number;
  name: string;
  description?: string | null;
};
export type FeeStructureRecord = {
  id: number;
  academicYearId: number;
  classId: number;
  feeHeadId: number;
  amount: number;
  frequency: "MONTHLY" | "YEARLY" | "ONE_TIME";
  feeHead?: FeeHeadRecord;
  class?: { name: string };
};
export type FeeCollectionRecord = {
  id: number;
  studentId: number;
  academicYearId: number;
  feeHeadId: number;
  amount: number;
  paidAmount: number;
  discount: number;
  fine: number;
  receiptNo: string;
  paymentDate: string;
  paymentMethod: string;
  student?: { studentId: string; user?: { name: string } };
  feeHead?: FeeHeadRecord;
};
export type FeeDueRecord = FeeStructureRecord & {
  paidAmount: number;
  discount: number;
  fine: number;
  balanceDue: number;
};
export type FeeStudent = {
  id: number;
  studentId: string;
  user: { name: string; email: string };
  enrollments: {
    academicYearId: number;
    classId: number;
    academicYear: { title: string };
    class: { name: string };
  }[];
};
const base = "/fees";
export const listFeeHeads = (page = 1, limit = 100) =>
  apiClient
    .get<
      ApiEnvelope<FeeHeadRecord[]>
    >(`${base}/heads`, { params: { page, limit } })
    .then(responsePage) as Promise<Paged<FeeHeadRecord>>;
export const getFeeHead = (id: number) =>
  apiClient
    .get<ApiEnvelope<FeeHeadRecord>>(`${base}/heads/${id}`)
    .then(responseData);
export const createFeeHead = (input: FeeHeadInput) =>
  apiClient
    .post<ApiEnvelope<FeeHeadRecord>>(`${base}/heads`, input)
    .then(responseData);
export const updateFeeHead = (id: number, input: Partial<FeeHeadInput>) =>
  apiClient
    .patch<ApiEnvelope<FeeHeadRecord>>(`${base}/heads/${id}`, input)
    .then(responseData);
export const deleteFeeHead = (id: number) =>
  apiClient
    .delete<ApiEnvelope<FeeHeadRecord>>(`${base}/heads/${id}`)
    .then(responseData);
export const listFeeStructures = (page = 1, limit = 100) =>
  apiClient
    .get<
      ApiEnvelope<FeeStructureRecord[]>
    >(`${base}/structures`, { params: { page, limit } })
    .then(responsePage) as Promise<Paged<FeeStructureRecord>>;
export const getFeeStructure = (id: number) =>
  apiClient
    .get<ApiEnvelope<FeeStructureRecord>>(`${base}/structures/${id}`)
    .then(responseData);
export const createFeeStructure = (input: FeeStructureInput) =>
  apiClient
    .post<ApiEnvelope<FeeStructureRecord>>(`${base}/structures`, input)
    .then(responseData);
export const updateFeeStructure = (
  id: number,
  input: Partial<FeeStructureInput>,
) =>
  apiClient
    .patch<ApiEnvelope<FeeStructureRecord>>(`${base}/structures/${id}`, input)
    .then(responseData);
export const deleteFeeStructure = (id: number) =>
  apiClient
    .delete<ApiEnvelope<FeeStructureRecord>>(`${base}/structures/${id}`)
    .then(responseData);
export const listFeeCollections = (page = 1, limit = 100) =>
  apiClient
    .get<ApiEnvelope<FeeCollectionRecord[]>>(base, { params: { page, limit } })
    .then(responsePage) as Promise<Paged<FeeCollectionRecord>>;
export const getFeeCollection = (id: number) =>
  apiClient
    .get<ApiEnvelope<FeeCollectionRecord>>(`${base}/${id}`)
    .then(responseData);
export const createFeeCollection = (input: FeeCollectionInput) =>
  apiClient
    .post<ApiEnvelope<FeeCollectionRecord>>(base, input)
    .then(responseData);
export const updateFeeCollection = (
  id: number,
  input: Partial<FeeCollectionInput>,
) =>
  apiClient
    .patch<ApiEnvelope<FeeCollectionRecord>>(`${base}/${id}`, input)
    .then(responseData);
export const deleteFeeCollection = (id: number) =>
  apiClient
    .delete<ApiEnvelope<FeeCollectionRecord>>(`${base}/${id}`)
    .then(responseData);
export const searchFeeStudents = (q: string) =>
  apiClient
    .get<
      ApiEnvelope<FeeStudent[]>
    >(`${base}/students/search`, { params: { q } })
    .then(responseData);
export const getStudentFeeDue = (studentId: number, academicYearId: number) =>
  apiClient
    .get<
      ApiEnvelope<FeeDueRecord[]>
    >(`${base}/students/${studentId}/due`, { params: { academicYearId } })
    .then(responseData);
