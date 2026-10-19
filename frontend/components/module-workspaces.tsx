"use client";

import { useState } from "react";
import { CrudPanel } from "@/components/crud-panel";
import { useTablePage } from "@/hooks/use-table-page";
import {
  useAcademicYears,
  useCreateAcademicYear,
  useDeleteAcademicYear,
} from "@/modules/academic-years/hooks";
import { academicYearSchema } from "@/modules/academic-years/schemas";
import {
  useClasses,
  useClassSections,
  useCreateClass,
  useCreateClassSection,
  useDeleteClass,
  useDeleteClassSection,
} from "@/modules/classes/hooks";
import { classSchema, classSectionSchema } from "@/modules/classes/schemas";
import {
  useSections,
  useCreateSection,
  useDeleteSection,
} from "@/modules/sections/hooks";
import { sectionSchema } from "@/modules/sections/schemas";
import {
  useSubjects,
  useClassSubjects,
  useCreateSubject,
  useCreateClassSubject,
  useDeleteSubject,
  useDeleteClassSubject,
} from "@/modules/subjects/hooks";
import { subjectSchema, classSubjectSchema } from "@/modules/subjects/schemas";
import { useUsers, useCreateUser, useDeleteUser } from "@/modules/users/hooks";
import { userSchema } from "@/modules/users/schemas";
import {
  useTeachers,
  useTeacherAssignments,
  useCreateTeacher,
  useCreateTeacherAssignment,
  useDeleteTeacher,
  useDeleteTeacherAssignment,
} from "@/modules/teachers/hooks";
import {
  teacherSchema,
  teacherAssignmentSchema,
} from "@/modules/teachers/schemas";
import {
  useStudents,
  useGenerateStudentId,
  useCreateStudent,
  useDeleteStudent,
} from "@/modules/students/hooks";
import { studentSchema } from "@/modules/students/schemas";
import type { FormField } from "@/components/validated-form";

const activeStatus: FormField = {
  name: "status",
  label: "Status",
  type: "select",
  options: [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
  ],
};
const options = (items: { id: number; name?: string; title?: string }[]) =>
  items.map((item) => ({
    value: String(item.id),
    label: item.name ?? item.title ?? String(item.id),
  }));
const shortDate = (value: unknown) =>
  value ? new Date(String(value)).toLocaleDateString() : "—";

export function AcademicYearsWorkspace() {
  const { page, onPageChange } = useTablePage();
  const query = useAcademicYears(page);
  const create = useCreateAcademicYear();
  const remove = useDeleteAcademicYear();
  return (
    <CrudPanel
      title="Academic years"
      description="Set the active school calendar and enrollment periods."
      records={query.data?.data ?? []}
      pagination={query.data?.pagination}
      onPageChange={onPageChange}
      loading={query.isLoading}
      error={query.error}
      schema={academicYearSchema}
      fields={[
        { name: "title", label: "Year title", placeholder: "2026–2027" },
        { name: "startDate", label: "Start date", type: "date" },
        { name: "endDate", label: "End date", type: "date" },
        { name: "isCurrent", label: "Set as current", type: "checkbox" },
      ]}
      columns={[
        { key: "title", label: "Academic year" },
        { key: "startDate", label: "Starts", format: shortDate },
        { key: "endDate", label: "Ends", format: shortDate },
        {
          key: "isCurrent",
          label: "Current",
          format: (value) => (value ? "Current" : "—"),
        },
      ]}
      onCreate={(value) => create.mutateAsync(value as never)}
      onDelete={(id) => remove.mutateAsync(id)}
    />
  );
}

export function ClassesWorkspace() {
  const [view, setView] = useState<"classes" | "mapping">("classes");
  const { page, onPageChange } = useTablePage();
  const classes = useClasses(page);
  const mappings = useClassSections(page);
  const sections = useSections();
  const years = useAcademicYears();
  const createClass = useCreateClass();
  const createMapping = useCreateClassSection();
  const removeClass = useDeleteClass();
  const removeMapping = useDeleteClassSection();
  return (
    <>
      <div className="segmented-control">
        <button
          className={view === "classes" ? "selected" : ""}
          onClick={() => setView("classes")}
        >
          Classes
        </button>
        <button
          className={view === "mapping" ? "selected" : ""}
          onClick={() => setView("mapping")}
        >
          Class sections
        </button>
      </div>
      {view === "classes" ? (
        <CrudPanel
          title="Classes"
          description="Organize grades and class levels."
          records={classes.data?.data ?? []}
          pagination={classes.data?.pagination}
          onPageChange={onPageChange}
          loading={classes.isLoading}
          error={classes.error}
          schema={classSchema}
          fields={[
            { name: "name", label: "Class name", placeholder: "Grade 6" },
            { name: "numericValue", label: "Numeric value", type: "number" },
            activeStatus,
          ]}
          columns={[
            { key: "name", label: "Class" },
            { key: "numericValue", label: "Level" },
            { key: "status", label: "Status" },
          ]}
          onCreate={(value) => createClass.mutateAsync(value as never)}
          onDelete={(id) => removeClass.mutateAsync(id)}
        />
      ) : (
        <CrudPanel
          title="Class sections"
          description="Connect a class, section, and academic year."
          records={mappings.data?.data ?? []}
          pagination={mappings.data?.pagination}
          onPageChange={onPageChange}
          loading={mappings.isLoading}
          error={mappings.error}
          schema={classSectionSchema}
          fields={[
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
              name: "academicYearId",
              label: "Academic year",
              type: "select",
              options: options(years.data?.data ?? []),
            },
          ]}
          columns={[
            {
              key: "class",
              label: "Class",
              format: (value) => (value as { name?: string })?.name ?? "—",
            },
            {
              key: "section",
              label: "Section",
              format: (value) => (value as { name?: string })?.name ?? "—",
            },
            {
              key: "academicYear",
              label: "Academic year",
              format: (value) => (value as { title?: string })?.title ?? "—",
            },
          ]}
          onCreate={(value) => createMapping.mutateAsync(value as never)}
          onDelete={(id) => removeMapping.mutateAsync(id)}
        />
      )}
    </>
  );
}

export function SectionsWorkspace() {
  const { page, onPageChange } = useTablePage();
  const query = useSections(page);
  const create = useCreateSection();
  const remove = useDeleteSection();
  return (
    <CrudPanel
      title="Sections"
      description="Manage parallel sections used for classroom grouping."
      records={query.data?.data ?? []}
      pagination={query.data?.pagination}
      onPageChange={onPageChange}
      loading={query.isLoading}
      error={query.error}
      schema={sectionSchema}
      fields={[
        { name: "name", label: "Section name", placeholder: "A" },
        activeStatus,
      ]}
      columns={[
        { key: "name", label: "Section" },
        { key: "status", label: "Status" },
      ]}
      onCreate={(value) => create.mutateAsync(value as never)}
      onDelete={(id) => remove.mutateAsync(id)}
    />
  );
}

export function SubjectsWorkspace() {
  const [view, setView] = useState<"subjects" | "assignments">("subjects");
  const { page, onPageChange } = useTablePage();
  const subjects = useSubjects(page);
  const assignments = useClassSubjects(page);
  const classes = useClasses();
  const years = useAcademicYears();
  const createSubject = useCreateSubject();
  const createAssignment = useCreateClassSubject();
  const removeSubject = useDeleteSubject();
  const removeAssignment = useDeleteClassSubject();
  return (
    <>
      <div className="segmented-control">
        <button
          className={view === "subjects" ? "selected" : ""}
          onClick={() => setView("subjects")}
        >
          Subjects
        </button>
        <button
          className={view === "assignments" ? "selected" : ""}
          onClick={() => setView("assignments")}
        >
          Class curriculum
        </button>
      </div>
      {view === "subjects" ? (
        <CrudPanel
          title="Subjects"
          description="Maintain the institute subject directory."
          records={subjects.data?.data ?? []}
          pagination={subjects.data?.pagination}
          onPageChange={onPageChange}
          loading={subjects.isLoading}
          error={subjects.error}
          schema={subjectSchema}
          fields={[
            { name: "name", label: "Subject name" },
            { name: "code", label: "Subject code" },
            activeStatus,
          ]}
          columns={[
            { key: "name", label: "Subject" },
            { key: "code", label: "Code" },
            { key: "status", label: "Status" },
          ]}
          onCreate={(value) => createSubject.mutateAsync(value as never)}
          onDelete={(id) => removeSubject.mutateAsync(id)}
        />
      ) : (
        <CrudPanel
          title="Class curriculum"
          description="Assign a subject to a class for an academic year."
          records={assignments.data?.data ?? []}
          pagination={assignments.data?.pagination}
          onPageChange={onPageChange}
          loading={assignments.isLoading}
          error={assignments.error}
          schema={classSubjectSchema}
          fields={[
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
            {
              name: "academicYearId",
              label: "Academic year",
              type: "select",
              options: options(years.data?.data ?? []),
            },
          ]}
          columns={[
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
            {
              key: "academicYear",
              label: "Academic year",
              format: (value) => (value as { title?: string })?.title ?? "—",
            },
          ]}
          onCreate={(value) => createAssignment.mutateAsync(value as never)}
          onDelete={(id) => removeAssignment.mutateAsync(id)}
        />
      )}
    </>
  );
}

export function UsersWorkspace() {
  const { page, onPageChange } = useTablePage();
  const query = useUsers(page);
  const create = useCreateUser();
  const remove = useDeleteUser();
  return (
    <CrudPanel
      title="Users"
      description="Create staff accounts and manage access status."
      records={query.data?.data ?? []}
      pagination={query.data?.pagination}
      onPageChange={onPageChange}
      loading={query.isLoading}
      error={query.error}
      schema={userSchema}
      fields={[
        { name: "name", label: "Full name" },
        { name: "email", label: "Email", type: "email" },
        { name: "phone", label: "Phone" },
        { name: "password", label: "Temporary password", type: "password" },
        {
          name: "role",
          label: "Role",
          type: "select",
          options: [
            { value: "ADMIN", label: "Administrator" },
            { value: "TEACHER", label: "Teacher" },
            { value: "STUDENT", label: "Student" },
            { value: "PARENT", label: "Parent" },
          ],
        },
        activeStatus,
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "role", label: "Role" },
        { key: "status", label: "Status" },
      ]}
      onCreate={(value) => create.mutateAsync(value as never)}
      onDelete={(id) => remove.mutateAsync(id)}
    />
  );
}

export function TeachersWorkspace() {
  const [view, setView] = useState<"teachers" | "assignments">("teachers");
  const { page, onPageChange } = useTablePage();
  const teachers = useTeachers(page);
  const assignments = useTeacherAssignments(page);
  const classes = useClasses();
  const sections = useSections();
  const subjects = useSubjects();
  const years = useAcademicYears();
  const createTeacher = useCreateTeacher();
  const createAssignment = useCreateTeacherAssignment();
  const removeTeacher = useDeleteTeacher();
  const removeAssignment = useDeleteTeacherAssignment();
  return (
    <>
      <div className="segmented-control">
        <button
          className={view === "teachers" ? "selected" : ""}
          onClick={() => setView("teachers")}
        >
          Staff
        </button>
        <button
          className={view === "assignments" ? "selected" : ""}
          onClick={() => setView("assignments")}
        >
          Teaching assignments
        </button>
      </div>
      {view === "teachers" ? (
        <CrudPanel
          title="Teachers"
          description="Create teacher profiles and linked sign-in accounts."
          records={teachers.data?.data ?? []}
          pagination={teachers.data?.pagination}
          onPageChange={onPageChange}
          loading={teachers.isLoading}
          error={teachers.error}
          schema={teacherSchema}
          fields={[
            { name: "name", label: "Full name" },
            { name: "email", label: "Email", type: "email" },
            { name: "phone", label: "Phone" },
            { name: "password", label: "Temporary password", type: "password" },
            { name: "employeeId", label: "Employee ID" },
            { name: "designation", label: "Designation" },
            { name: "joiningDate", label: "Joining date", type: "date" },
          ]}
          columns={[
            {
              key: "user",
              label: "Teacher",
              format: (value) => (value as { name?: string })?.name ?? "—",
            },
            { key: "employeeId", label: "Employee ID" },
            { key: "designation", label: "Designation" },
            { key: "status", label: "Status" },
          ]}
          onCreate={(value) => createTeacher.mutateAsync(value as never)}
          onDelete={(id) => removeTeacher.mutateAsync(id)}
        />
      ) : (
        <CrudPanel
          title="Teaching assignments"
          description="Assign a teacher to a class, section, subject, and year."
          records={assignments.data?.data ?? []}
          pagination={assignments.data?.pagination}
          onPageChange={onPageChange}
          loading={assignments.isLoading}
          error={assignments.error}
          schema={teacherAssignmentSchema}
          fields={[
            {
              name: "teacherId",
              label: "Teacher",
              type: "select",
              options: options(
                teachers.data?.data.map((item) => ({
                  id: item.id,
                  name: item.user?.name,
                })) ?? [],
              ),
            },
            {
              name: "academicYearId",
              label: "Academic year",
              type: "select",
              options: options(years.data?.data ?? []),
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
          ]}
          columns={[
            {
              key: "teacher",
              label: "Teacher",
              format: (value) =>
                (value as { user?: { name?: string } })?.user?.name ?? "—",
            },
            {
              key: "class",
              label: "Class",
              format: (value) => (value as { name?: string })?.name ?? "—",
            },
            {
              key: "section",
              label: "Section",
              format: (value) => (value as { name?: string })?.name ?? "—",
            },
            {
              key: "subject",
              label: "Subject",
              format: (value) => (value as { name?: string })?.name ?? "—",
            },
          ]}
          onCreate={(value) => createAssignment.mutateAsync(value as never)}
          onDelete={(id) => removeAssignment.mutateAsync(id)}
        />
      )}
    </>
  );
}

export function StudentsWorkspace() {
  const { page, onPageChange } = useTablePage();
  const query = useStudents(page);
  const years = useAcademicYears();
  const classes = useClasses();
  const sections = useSections();
  const create = useCreateStudent();
  const remove = useDeleteStudent();
  const generateId = useGenerateStudentId();
  const [studentId, setStudentId] = useState("");
  const fields: FormField[] = [
    { name: "name", label: "Student name" },
    { name: "email", label: "Student email", type: "email" },
    { name: "password", label: "Initial password", type: "password" },
    { name: "phone", label: "Student phone" },
    { name: "photo", label: "Student photo", type: "file" },
    {
      name: "studentId",
      label: "Student ID",
      placeholder: "Generate or enter manually",
    },
    { name: "fatherName", label: "Father name" },
    { name: "motherName", label: "Mother name" },
    { name: "guardianPhone", label: "Guardian phone" },
    { name: "admissionDate", label: "Admission date", type: "date" },
    {
      name: "academicYearId",
      label: "Academic year",
      type: "select",
      options: options(years.data?.data ?? []),
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
    { name: "rollNumber", label: "Roll number" },
  ];
  return (
    <>
      <div className="workflow-strip">
        <div>
          <p className="eyebrow">ADMISSION WORKFLOW</p>
          <strong>Profile · Class · Enrollment</strong>
        </div>
        <button
          className="button button-secondary"
          onClick={async () =>
            setStudentId((await generateId.mutateAsync()).studentId)
          }
          disabled={generateId.isPending}
        >
          {generateId.isPending ? "Generating…" : "Generate student ID"}
        </button>
        {studentId && <span className="generated-id">{studentId}</span>}
      </div>
      <CrudPanel
        title="Students"
        description="Admit a student with guardian details and an academic-year enrollment."
        records={query.data?.data ?? []}
        pagination={query.data?.pagination}
        onPageChange={onPageChange}
        loading={query.isLoading}
        error={query.error}
        schema={studentSchema}
        fields={fields}
        columns={[
          { key: "studentId", label: "Student ID" },
          {
            key: "user",
            label: "Name",
            format: (value) => (value as { name?: string })?.name ?? "—",
          },
          {
            key: "enrollments",
            label: "Class / section",
            format: (value) => {
              const enrollment = (
                value as {
                  class?: { name?: string };
                  section?: { name?: string };
                }[]
              )?.[0];
              return enrollment
                ? `${enrollment.class?.name ?? ""} · ${enrollment.section?.name ?? ""}`
                : "—";
            },
          },
          { key: "status", label: "Status" },
        ]}
        onCreate={async (value) => {
          const input = value as Record<string, unknown>;
          if (studentId) input.studentId = studentId;
          await create.mutateAsync(input as never);
          setStudentId("");
        }}
        onDelete={(id) => remove.mutateAsync(id)}
      />
    </>
  );
}
