"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAcademicYears } from "@/modules/academic-years/hooks";
import { useClasses } from "@/modules/classes/hooks";
import { useSections } from "@/modules/sections/hooks";
import {
  useAttendanceRoster,
  useSaveBulkAttendance,
} from "@/modules/attendances/hooks";
import type { AttendanceRosterRow } from "@/modules/attendances/service";
import type { AttendanceStatus } from "@/modules/attendances/schemas";

type Criteria = {
  academicYearId: number;
  classId: number;
  sectionId: number;
  date: string;
};

export function AttendanceWorkspace() {
  const years = useAcademicYears();
  const classes = useClasses();
  const sections = useSections();
  const [criteria, setCriteria] = useState<Criteria | null>(null);
  const [statusByStudent, setStatusByStudent] = useState<
    Record<number, AttendanceStatus>
  >({});
  const roster = useAttendanceRoster(criteria);
  const save = useSaveBulkAttendance();

  function loadRoster(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatusByStudent({});
    setCriteria({
      academicYearId: Number(form.get("academicYearId")),
      classId: Number(form.get("classId")),
      sectionId: Number(form.get("sectionId")),
      date: String(form.get("date")),
    });
  }

  async function saveAttendance() {
    if (!criteria || !roster.data?.length) return;
    await save.mutateAsync({
      ...criteria,
      date: new Date(`${criteria.date}T00:00:00.000Z`),
      attendances: roster.data.map((row: AttendanceRosterRow) => ({
        studentId: row.studentId,
        status:
          statusByStudent[row.studentId] ?? row.attendance?.status ?? "PRESENT",
        remarks: row.attendance?.remarks ?? undefined,
      })),
    });
  }

  return (
    <div className="workflow-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">CLASSROOM · DAILY REGISTER</p>
          <h2>Mark attendance</h2>
          <p>
            Load the class roster, review existing marks, then save all students
            together.
          </p>
        </div>
      </div>
      <form className="filter-bar" onSubmit={loadRoster}>
        <label>
          <span>Academic year</span>
          <select name="academicYearId" required defaultValue="">
            <option value="" disabled>
              Select year
            </option>
            {years.data?.data.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Class</span>
          <select name="classId" required defaultValue="">
            <option value="" disabled>
              Select class
            </option>
            {classes.data?.data.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Section</span>
          <select name="sectionId" required defaultValue="">
            <option value="" disabled>
              Select section
            </option>
            {sections.data?.data.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Date</span>
          <input
            name="date"
            type="date"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
          />
        </label>
        <button className="button button-primary" type="submit">
          Load roster
        </button>
      </form>
      {roster.isError && (
        <div className="notice notice-error">
          {roster.error instanceof Error
            ? roster.error.message
            : "Could not load this class roster"}
        </div>
      )}
      {criteria && (
        <div className="table-wrap attendance-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roster.isLoading ? (
                <TableRow>
                  <TableCell colSpan={4}>Loading class roster…</TableCell>
                </TableRow>
              ) : roster.data?.length ? (
                roster.data.map((row) => (
                  <TableRow key={row.studentId}>
                    <TableCell>{row.rollNumber ?? "—"}</TableCell>
                    <TableCell>{row.student.user.name}</TableCell>
                    <TableCell className="muted-cell">
                      {row.student.studentId}
                    </TableCell>
                    <TableCell>
                      <select
                        aria-label={`Attendance for ${row.student.user.name}`}
                        value={
                          statusByStudent[row.studentId] ??
                          row.attendance?.status ??
                          "PRESENT"
                        }
                        onChange={(event) =>
                          setStatusByStudent((current) => ({
                            ...current,
                            [row.studentId]: event.target
                              .value as AttendanceStatus,
                          }))
                        }
                      >
                        <option value="PRESENT">Present</option>
                        <option value="ABSENT">Absent</option>
                        <option value="LATE">Late</option>
                      </select>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4}>
                    No active students are enrolled in this class-section.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {criteria && roster.data?.length ? (
        <div className="table-actions">
          <span>{roster.data.length} students in roster</span>
          <button
            className="button button-primary"
            onClick={saveAttendance}
            disabled={save.isPending}
          >
            <Save size={16} />
            {save.isPending ? "Saving…" : "Save attendance"}
          </button>
        </div>
      ) : null}
      {save.isSuccess && (
        <div className="notice notice-success">
          Attendance saved for this class.
        </div>
      )}
      {save.isError && (
        <div className="notice notice-error">
          {save.error instanceof Error
            ? save.error.message
            : "Could not save attendance"}
        </div>
      )}
    </div>
  );
}
