"use client";

import { useState } from "react";
import { z } from "zod";
import { CrudPanel } from "@/components/crud-panel";
import { useTablePage } from "@/hooks/use-table-page";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ValidatedForm } from "@/components/validated-form";
import { useAcademicYears } from "@/modules/academic-years/hooks";
import { useClasses } from "@/modules/classes/hooks";
import { useSections } from "@/modules/sections/hooks";
import { useSubjects } from "@/modules/subjects/hooks";
import { useAttendanceRoster } from "@/modules/attendances/hooks";
import {
  useExams,
  useExamSubjects,
  useMarks,
  useResults,
  useCreateExam,
  useDeleteExam,
  useCreateExamSubject,
  useDeleteExamSubject,
  useCreateMark,
  useSaveBulkMarks,
} from "@/modules/exams/hooks";
import {
  examSchema,
  examSubjectSchema,
  markSchema,
  resultCriteriaSchema,
} from "@/modules/exams/schemas";
import type { FormField } from "@/components/validated-form";

const options = (items: { id: number; name?: string; title?: string }[]) =>
  items.map((item) => ({
    value: String(item.id),
    label: item.name ?? item.title ?? String(item.id),
  }));
const markLoadSchema = z.object({
  academicYearId: z.coerce.number().int().positive(),
  examId: z.coerce.number().int().positive(),
  classId: z.coerce.number().int().positive(),
  sectionId: z.coerce.number().int().positive(),
  subjectId: z.coerce.number().int().positive(),
});
type Props = { canManage: boolean; isStudent?: boolean };
export function ExamWorkspace(props: Props) {
  return props.isStudent ? (
    <StudentResultsWorkspace />
  ) : (
    <StaffExamWorkspace canManage={props.canManage} />
  );
}

function StaffExamWorkspace({ canManage }: { canManage: boolean }) {
  const [view, setView] = useState<"exams" | "subjects" | "marks" | "results">(
    "exams",
  );
  const [criteria, setCriteria] = useState<{
    academicYearId: number;
    examId: number;
    classId: number;
    sectionId: number;
  } | null>(null);
  const examsPage = useTablePage();
  const subjectsPage = useTablePage();
  const years = useAcademicYears();
  const classes = useClasses();
  const sections = useSections();
  const subjects = useSubjects();
  const exams = useExams(examsPage.page);
  const examSubjects = useExamSubjects(subjectsPage.page);
  const marks = useMarks();
  const results = useResults(criteria);
  const createExam = useCreateExam();
  const deleteExam = useDeleteExam();
  const createExamSubject = useCreateExamSubject();
  const deleteExamSubject = useDeleteExamSubject();
  const createMark = useCreateMark();
  const saveBulkMarks = useSaveBulkMarks();
  const [markCriteria, setMarkCriteria] = useState<{
    academicYearId: number;
    classId: number;
    sectionId: number;
    examId: number;
    subjectId: number;
  } | null>(null);
  const roster = useAttendanceRoster(
    markCriteria
      ? { ...markCriteria, date: new Date().toISOString().slice(0, 10) }
      : null,
  );
  const examFields: FormField[] = [
    { name: "name", label: "Exam name" },
    {
      name: "academicYearId",
      label: "Academic year",
      type: "select",
      options: options(years.data?.data ?? []),
    },
    { name: "startDate", label: "Start date", type: "date" },
    { name: "endDate", label: "End date", type: "date" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "UPCOMING", label: "Upcoming" },
        { value: "ONGOING", label: "Ongoing" },
        { value: "COMPLETED", label: "Completed" },
      ],
    },
  ];
  const subjectFields: FormField[] = [
    {
      name: "examId",
      label: "Exam",
      type: "select",
      options: options(exams.data?.data ?? []),
    },
    {
      name: "classId",
      label: "Class",
      type: "select",
      options: options(classes.data?.data ?? []),
    },
    {
      name: "subjectId",
      label: "Subject",
      type: "select",
      options: options(subjects.data?.data ?? []),
    },
    { name: "fullMarks", label: "Full marks", type: "number" },
    { name: "passMarks", label: "Pass marks", type: "number" },
  ];
  const criteriaFields: FormField[] = [
    {
      name: "academicYearId",
      label: "Academic year",
      type: "select",
      options: options(years.data?.data ?? []),
    },
    {
      name: "examId",
      label: "Exam",
      type: "select",
      options: options(exams.data?.data ?? []),
    },
    {
      name: "classId",
      label: "Class",
      type: "select",
      options: options(classes.data?.data ?? []),
    },
    {
      name: "sectionId",
      label: "Section",
      type: "select",
      options: options(sections.data?.data ?? []),
    },
  ];
  const bulkFields: FormField[] = [
    {
      name: "examId",
      label: "Exam",
      type: "select",
      options: options(exams.data?.data ?? []),
    },
    {
      name: "classId",
      label: "Class",
      type: "select",
      options: options(classes.data?.data ?? []),
    },
    {
      name: "sectionId",
      label: "Section",
      type: "select",
      options: options(sections.data?.data ?? []),
    },
    {
      name: "subjectId",
      label: "Subject",
      type: "select",
      options: options(subjects.data?.data ?? []),
    },
  ];
  const markFields: FormField[] = [
    {
      name: "examId",
      label: "Exam",
      type: "select",
      options: options(exams.data?.data ?? []),
    },
    { name: "studentId", label: "Student record ID", type: "number" },
    {
      name: "subjectId",
      label: "Subject",
      type: "select",
      options: options(subjects.data?.data ?? []),
    },
    { name: "obtainedMarks", label: "Obtained marks", type: "number" },
    { name: "grade", label: "Grade" },
    { name: "remarks", label: "Remarks" },
  ];
  const tabs = canManage
    ? (["exams", "subjects", "marks", "results"] as const)
    : (["results"] as const);

  return (
    <>
      <div className="segmented-control">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={view === tab ? "selected" : ""}
            onClick={() => setView(tab)}
          >
            {tab === "subjects"
              ? "Exam subjects"
              : tab === "marks"
                ? "Marks entry"
                : tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      {view === "exams" && canManage && (
        <CrudPanel
          title="Exams"
          description="Schedule an exam within an academic year."
          records={exams.data?.data ?? []}
          pagination={exams.data?.pagination}
          onPageChange={examsPage.onPageChange}
          loading={exams.isLoading}
          error={exams.error}
          schema={examSchema}
          fields={examFields}
          columns={[
            { key: "name", label: "Exam" },
            {
              key: "academicYearId",
              label: "Year",
              format: (value) =>
                years.data?.data.find((year) => year.id === Number(value))
                  ?.title ?? "—",
            },
            {
              key: "startDate",
              label: "Starts",
              format: (value) =>
                value ? new Date(String(value)).toLocaleDateString() : "—",
            },
            { key: "status", label: "Status" },
          ]}
          onCreate={(value) => createExam.mutateAsync(value as never)}
          onDelete={(id) => deleteExam.mutateAsync(id)}
        />
      )}
      {view === "subjects" && canManage && (
        <CrudPanel
          title="Exam subjects"
          description="Set class-wise subjects, full marks, and pass marks."
          records={examSubjects.data?.data ?? []}
          pagination={examSubjects.data?.pagination}
          onPageChange={subjectsPage.onPageChange}
          loading={examSubjects.isLoading}
          error={examSubjects.error}
          schema={examSubjectSchema}
          fields={subjectFields}
          columns={[
            {
              key: "exam",
              label: "Exam",
              format: (value) => (value as { name?: string })?.name ?? "—",
            },
            {
              key: "class",
              label: "Class",
              format: (value) => (value as { name?: string })?.name ?? "—",
            },
            {
              key: "subject",
              label: "Subject",
              format: (value) => (value as { name?: string })?.name ?? "—",
            },
            { key: "fullMarks", label: "Full marks" },
            { key: "passMarks", label: "Pass marks" },
          ]}
          onCreate={(value) => createExamSubject.mutateAsync(value as never)}
          onDelete={(id) => deleteExamSubject.mutateAsync(id)}
        />
      )}
      {view === "marks" && canManage && (
        <div className="workflow-page">
          <div className="section-heading">
            <div>
              <p className="eyebrow">ASSESSMENT · ENTRY</p>
              <h2>Marks entry</h2>
              <p>Choose an exam and class to load the enrolled roster.</p>
            </div>
          </div>
          <ValidatedForm
            schema={markLoadSchema}
            fields={[
              {
                name: "academicYearId",
                label: "Academic year",
                type: "select",
                options: options(years.data?.data ?? []),
              },
              ...bulkFields,
            ]}
            submitLabel="Load students"
            onSubmit={(value) => setMarkCriteria(value as typeof markCriteria)}
          />
          {markCriteria && (
            <div className="table-wrap">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Roll</TableHead>
                    <TableHead>Marks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roster.data?.map((row) => (
                    <TableRow key={row.studentId}>
                      <TableCell>{row.student.user.name}</TableCell>
                      <TableCell>{row.rollNumber ?? "—"}</TableCell>
                      <TableCell>
                        <input
                          aria-label={`Marks for ${row.student.user.name}`}
                          type="number"
                          min="0"
                          data-student-id={row.studentId}
                          className="mark-input"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {markCriteria && roster.data?.length ? (
            <button
              className="button button-primary"
              onClick={async () => {
                const entries = Array.from(
                  document.querySelectorAll<HTMLInputElement>(".mark-input"),
                );
                await saveBulkMarks.mutateAsync({
                  examId: markCriteria.examId,
                  subjectId: markCriteria.subjectId,
                  classId: markCriteria.classId,
                  marks: entries.map((entry) => ({
                    studentId: Number(entry.dataset.studentId),
                    obtainedMarks: Number(entry.value),
                  })),
                });
              }}
              disabled={saveBulkMarks.isPending}
            >
              {saveBulkMarks.isPending ? "Saving…" : "Save marks"}
            </button>
          ) : null}
          <div className="secondary-mark-entry">
            <h3>Single mark record</h3>
            <ValidatedForm
              schema={markSchema}
              fields={markFields}
              submitLabel="Save mark"
              onSubmit={(value) => createMark.mutateAsync(value as never)}
            />
          </div>
        </div>
      )}
      {view === "results" && (
        <div className="workflow-page">
          <div className="section-heading">
            <div>
              <p className="eyebrow">RESULTS · CALCULATED</p>
              <h2>Exam results</h2>
              <p>
                Calculate totals, percentage, grade, and rank for a
                class-section.
              </p>
            </div>
          </div>
          <ValidatedForm
            schema={resultCriteriaSchema}
            fields={criteriaFields}
            submitLabel="Load results"
            onSubmit={(value) => setCriteria(value as typeof criteria)}
          />
          <div className="table-wrap result-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Roll</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Percent</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.data?.data.map((result) => (
                  <TableRow key={result.studentId}>
                    <TableCell>{result.rank}</TableCell>
                    <TableCell>{result.rollNumber ?? "—"}</TableCell>
                    <TableCell>{result.name}</TableCell>
                    <TableCell>
                      {result.totalObtained} / {result.totalFullMarks}
                    </TableCell>
                    <TableCell>{result.percentage.toFixed(2)}%</TableCell>
                    <TableCell>
                      <span className="grade-mark">{result.grade}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {results.isError && (
            <p className="form-error">
              {results.error instanceof Error
                ? results.error.message
                : "Could not calculate results"}
            </p>
          )}
          {marks.error && <p className="form-error">{String(marks.error)}</p>}
        </div>
      )}
    </>
  );
}

function StudentResultsWorkspace() {
  const [criteria, setCriteria] = useState<{
    academicYearId: number;
    examId: number;
    classId: number;
    sectionId: number;
  } | null>(null);
  const results = useResults(criteria);
  const manualCriteria = z.object({
    academicYearId: z.coerce.number().int().positive(),
    examId: z.coerce.number().int().positive(),
    classId: z.coerce.number().int().positive(),
    sectionId: z.coerce.number().int().positive(),
  });
  return (
    <div className="workflow-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">RESULTS · MY RECORD</p>
          <h2>Exam results</h2>
          <p>Enter the result criteria provided by your institute.</p>
        </div>
      </div>
      <ValidatedForm
        schema={manualCriteria}
        fields={[
          { name: "academicYearId", label: "Academic year ID", type: "number" },
          { name: "examId", label: "Exam ID", type: "number" },
          { name: "classId", label: "Class ID", type: "number" },
          { name: "sectionId", label: "Section ID", type: "number" },
        ]}
        submitLabel="Load my result"
        onSubmit={(value) => setCriteria(value as typeof criteria)}
      />
      <ResultTable data={results.data?.data ?? []} error={results.error} />
    </div>
  );
}

function ResultTable({
  data,
  error,
}: {
  data: NonNullable<ReturnType<typeof useResults>["data"]>["data"];
  error: Error | null;
}) {
  return (
    <>
      <div className="table-wrap result-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Roll</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Percent</TableHead>
              <TableHead>Grade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((result) => (
              <TableRow key={result.studentId}>
                <TableCell>{result.rank}</TableCell>
                <TableCell>{result.rollNumber ?? "—"}</TableCell>
                <TableCell>{result.name}</TableCell>
                <TableCell>
                  {result.totalObtained} / {result.totalFullMarks}
                </TableCell>
                <TableCell>{result.percentage.toFixed(2)}%</TableCell>
                <TableCell>
                  <span className="grade-mark">{result.grade}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {error && <p className="form-error">{error.message}</p>}
    </>
  );
}
