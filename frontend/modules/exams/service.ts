import {
  apiClient,
  responseData,
  responsePage,
  type ApiEnvelope,
  type Paged,
} from "@/lib/api-client";
import type {
  BulkMarksInput,
  ExamInput,
  ExamSubjectInput,
  MarkInput,
} from "./schemas";

export type ExamRecord = {
  id: number;
  name: string;
  academicYearId: number;
  startDate?: string | null;
  endDate?: string | null;
  status: "UPCOMING" | "ONGOING" | "COMPLETED";
};
export type ExamSubjectRecord = {
  id: number;
  examId: number;
  subjectId: number;
  classId: number;
  fullMarks: number;
  passMarks: number;
  subject?: { name: string };
};
export type MarkRecord = {
  id: number;
  examId: number;
  studentId: number;
  subjectId: number;
  obtainedMarks: number;
  grade?: string | null;
  remarks?: string | null;
};
export type ResultRecord = {
  studentId: number;
  studentCode: string;
  name: string;
  rollNumber?: string | null;
  subjects: {
    subject: { name: string };
    fullMarks: number;
    passMarks: number;
    obtainedMarks: number;
  }[];
  totalObtained: number;
  totalFullMarks: number;
  percentage: number;
  grade: string;
  rank: number;
};
const base = "/exams";
export const listExams = (page = 1, limit = 100) =>
  apiClient
    .get<ApiEnvelope<ExamRecord[]>>(base, { params: { page, limit } })
    .then(responsePage) as Promise<Paged<ExamRecord>>;
export const getExam = (id: number) =>
  apiClient.get<ApiEnvelope<ExamRecord>>(`${base}/${id}`).then(responseData);
export const createExam = (input: ExamInput) =>
  apiClient.post<ApiEnvelope<ExamRecord>>(base, input).then(responseData);
export const updateExam = (id: number, input: Partial<ExamInput>) =>
  apiClient
    .patch<ApiEnvelope<ExamRecord>>(`${base}/${id}`, input)
    .then(responseData);
export const deleteExam = (id: number) =>
  apiClient.delete<ApiEnvelope<ExamRecord>>(`${base}/${id}`).then(responseData);
export const listExamSubjects = (page = 1, limit = 100) =>
  apiClient
    .get<
      ApiEnvelope<ExamSubjectRecord[]>
    >(`${base}/subjects`, { params: { page, limit } })
    .then(responsePage) as Promise<Paged<ExamSubjectRecord>>;
export const getExamSubject = (id: number) =>
  apiClient
    .get<ApiEnvelope<ExamSubjectRecord>>(`${base}/subjects/${id}`)
    .then(responseData);
export const createExamSubject = (input: ExamSubjectInput) =>
  apiClient
    .post<ApiEnvelope<ExamSubjectRecord>>(`${base}/subjects`, input)
    .then(responseData);
export const updateExamSubject = (
  id: number,
  input: Partial<ExamSubjectInput>,
) =>
  apiClient
    .patch<ApiEnvelope<ExamSubjectRecord>>(`${base}/subjects/${id}`, input)
    .then(responseData);
export const deleteExamSubject = (id: number) =>
  apiClient
    .delete<ApiEnvelope<ExamSubjectRecord>>(`${base}/subjects/${id}`)
    .then(responseData);
export const listMarks = (page = 1, limit = 100) =>
  apiClient
    .get<
      ApiEnvelope<MarkRecord[]>
    >(`${base}/marks`, { params: { page, limit } })
    .then(responsePage) as Promise<Paged<MarkRecord>>;
export const getMark = (id: number) =>
  apiClient
    .get<ApiEnvelope<MarkRecord>>(`${base}/marks/${id}`)
    .then(responseData);
export const createMark = (input: MarkInput) =>
  apiClient
    .post<ApiEnvelope<MarkRecord>>(`${base}/marks`, input)
    .then(responseData);
export const updateMark = (id: number, input: Partial<MarkInput>) =>
  apiClient
    .patch<ApiEnvelope<MarkRecord>>(`${base}/marks/${id}`, input)
    .then(responseData);
export const deleteMark = (id: number) =>
  apiClient
    .delete<ApiEnvelope<MarkRecord>>(`${base}/marks/${id}`)
    .then(responseData);
export const saveBulkMarks = (input: BulkMarksInput) =>
  apiClient
    .post<ApiEnvelope<MarkRecord[]>>(`${base}/marks/bulk`, input)
    .then(responseData);
export const getResults = (criteria: {
  academicYearId: number;
  examId: number;
  classId: number;
  sectionId: number;
}) =>
  apiClient
    .get<ApiEnvelope<ResultRecord[]>>(`${base}/results`, { params: criteria })
    .then((response) => ({
      data: response.data.data,
      meta: response.data.meta,
    }));
