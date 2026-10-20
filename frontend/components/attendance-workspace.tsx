"use client";

import { useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Clock3,
  RotateCcw,
  Save,
  Search,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);
  const currentYearId = years.data?.data.find((year) => year.isCurrent);
  const [criteria, setCriteria] = useState<Criteria | null>(null);
  const [date, setDate] = useState(() => localDateValue(new Date()));
  const [search, setSearch] = useState("");
  const [rowPage, setRowPage] = useState(1);
  const [statusByStudent, setStatusByStudent] = useState<
    Record<number, AttendanceStatus>
  >({});
  const [remarksByStudent, setRemarksByStudent] = useState<
    Record<number, string>
  >({});
  const roster = useAttendanceRoster(criteria);
  const save = useSaveBulkAttendance();
  const rows = roster.data ?? [];
  const filteredRows = rows.filter((row) => {
    const query = search.trim().toLowerCase();
    return (
      !query ||
      row.student.user.name.toLowerCase().includes(query) ||
      row.student.studentId.toLowerCase().includes(query) ||
      (row.rollNumber ?? "").toLowerCase().includes(query)
    );
  });
  const getStatus = (row: AttendanceRosterRow) =>
    statusByStudent[row.studentId] ?? row.attendance?.status ?? "PRESENT";
  const counts = rows.reduce(
    (total, row) => {
      total[getStatus(row)] += 1;
      return total;
    },
    { PRESENT: 0, ABSENT: 0, LATE: 0 },
  );
  const rowsPerPage = 8;
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const currentPage = Math.min(rowPage, pageCount);
  const visibleRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );
  const dirtyCount =
    Object.keys(statusByStudent).length + Object.keys(remarksByStudent).length;

  function loadRoster(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatusByStudent({});
    setRemarksByStudent({});
    save.reset();
    setCriteria({
      academicYearId: Number(form.get("academicYearId")),
      classId: Number(form.get("classId")),
      sectionId: Number(form.get("sectionId")),
      date,
    });
  }

  function setRosterStatus(status: AttendanceStatus | null) {
    if (!rows.length) return;
    setStatusByStudent(
      status
        ? Object.fromEntries(rows.map((row) => [row.studentId, status]))
        : {},
    );
  }

  function setStudentStatus(studentId: number, status: AttendanceStatus) {
    setStatusByStudent((current) => ({ ...current, [studentId]: status }));
  }

  async function saveAttendance() {
    if (!criteria || !rows.length) return;
    await save.mutateAsync({
      ...criteria,
      date: new Date(`${criteria.date}T00:00:00.000Z`),
      attendances: rows.map((row) => ({
        studentId: row.studentId,
        status: getStatus(row),
        remarks:
          remarksByStudent[row.studentId] ??
          row.attendance?.remarks ??
          undefined,
      })),
    });
  }

  return (
    <div className="attendance-workspace">
      <header className="attendance-heading">
        <div>
          <p className="eyebrow">ACADEMIC OPERATIONS / ATTENDANCE LOG</p>
          <h1>Daily attendance</h1>
          <p>Mark, review, and save attendance for an enrolled class.</p>
        </div>
        <Badge variant="outline" className="attendance-live-badge">
          <span /> Live register
        </Badge>
      </header>

      <Card className="attendance-filter-panel rounded-lg">
        <CardContent className="attendance-filter-content">
          <form className="attendance-filter-form" onSubmit={loadRoster}>
            <div className="attendance-date-field">
              <label htmlFor="attendance-date">Attendance date</label>
              <div className="attendance-date-control">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Previous day"
                  onClick={() => setDate((value) => shiftDate(value, -1))}
                >
                  <ChevronLeft />
                </Button>
                <Input
                  id="attendance-date"
                  name="date"
                  type="date"
                  required
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Next day"
                  onClick={() => setDate((value) => shiftDate(value, 1))}
                >
                  <ChevronRight />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setDate(localDateValue(new Date()))}
                >
                  Today
                </Button>
              </div>
            </div>
            <label className="attendance-select-field">
              <span>Academic year</span>
              <Select
                name="academicYearId"
                required
                value={selectedYearId ?? (currentYearId ? String(currentYearId.id) : "")}
                onValueChange={(value) => setSelectedYearId(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  {years.data?.data.map((year) => (
                    <SelectItem key={year.id} value={String(year.id)}>
                      {year.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="attendance-select-field">
              <span>Class</span>
              <Select name="classId" required defaultValue="">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.data?.data.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="attendance-select-field">
              <span>Section</span>
              <Select name="sectionId" required defaultValue="">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.data?.data.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <Button type="submit" disabled={roster.isFetching}>
              <CalendarDays />
              {roster.isFetching ? "Loading…" : "Load register"}
            </Button>
          </form>
          {criteria && (
            <div className="attendance-bulk-actions">
              <div>
                <strong>Quick actions</strong>
                <span>Apply a status to all {rows.length} students</span>
              </div>
              <div className="attendance-action-buttons">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRosterStatus("PRESENT")}
                  disabled={!rows.length}
                >
                  <Check /> Mark all present
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRosterStatus("ABSENT")}
                  disabled={!rows.length}
                >
                  <X /> Mark all absent
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRosterStatus(null)}
                  disabled={!dirtyCount}
                >
                  <RotateCcw /> Reset marks
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {criteria && !roster.isError && (
        <section className="attendance-summary" aria-label="Attendance summary">
          <div className="attendance-summary-item total">
            <span className="attendance-summary-icon">
              <Users />
            </span>
            <div>
              <small>Total enrolled</small>
              <strong>{roster.isLoading ? "—" : rows.length}</strong>
            </div>
          </div>
          <div className="attendance-summary-item present">
            <span className="attendance-summary-icon">
              <CircleCheck />
            </span>
            <div>
              <small>Present</small>
              <strong>
                {counts.PRESENT}
                <em>
                  {rows.length
                    ? `${Math.round((counts.PRESENT / rows.length) * 100)}%`
                    : "0%"}
                </em>
              </strong>
            </div>
          </div>
          <div className="attendance-summary-item absent">
            <span className="attendance-summary-icon">
              <CircleX />
            </span>
            <div>
              <small>Absent</small>
              <strong>{counts.ABSENT}</strong>
            </div>
          </div>
          <div className="attendance-summary-item late">
            <span className="attendance-summary-icon">
              <Clock3 />
            </span>
            <div>
              <small>Late</small>
              <strong>{counts.LATE}</strong>
            </div>
          </div>
        </section>
      )}

      {roster.isError && (
        <div className="notice notice-error" role="alert">
          {roster.error instanceof Error
            ? roster.error.message
            : "Could not load this class roster"}
        </div>
      )}

      {criteria && (
        <Card className="attendance-roster-card rounded-lg">
          <div className="attendance-roster-toolbar">
            <div>
              <h2>Class register</h2>
              <p>
                {new Date(`${criteria.date}T00:00:00`).toLocaleDateString(
                  undefined,
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  },
                )}
              </p>
            </div>
            <label className="attendance-search">
              <Search />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, roll, or student ID"
                aria-label="Search students"
              />
            </label>
          </div>
          <div className="attendance-table-scroll">
            <Table className="attendance-register-table">
              <TableHeader>
                <TableRow>
                  <TableHead className="attendance-roll-column">Roll</TableHead>
                  <TableHead>Student details</TableHead>
                  <TableHead>Marking (P / A / L)</TableHead>
                  <TableHead>Remarks / note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roster.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="attendance-empty-state">
                      Loading class roster…
                    </TableCell>
                  </TableRow>
                ) : visibleRows.length ? (
                  visibleRows.map((row, index) => {
                    const status = getStatus(row);
                    return (
                      <TableRow key={row.studentId}>
                        <TableCell className="attendance-roll-cell">
                          {row.rollNumber ?? String((currentPage - 1) * rowsPerPage + index + 1).padStart(2, "0")}
                        </TableCell>
                        <TableCell>
                          <div className="attendance-student-cell">
                            <span className="attendance-student-avatar">
                              {row.student.user.name
                                .split(" ")
                                .map((part) => part[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </span>
                            <span>
                              <strong>{row.student.user.name}</strong>
                              <small>{row.student.studentId}</small>
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className="attendance-status-picker"
                            role="group"
                            aria-label={`Attendance for ${row.student.user.name}`}
                          >
                            {(["PRESENT", "ABSENT", "LATE"] as const).map(
                              (value) => (
                                <Button
                                  key={value}
                                  type="button"
                                  size="xs"
                                  variant="ghost"
                                  className={`attendance-status-option ${status === value ? `selected ${value.toLowerCase()}` : ""}`}
                                  aria-pressed={status === value}
                                  onClick={() =>
                                    setStudentStatus(row.studentId, value)
                                  }
                                >
                                  {value === "PRESENT"
                                    ? "P"
                                    : value === "ABSENT"
                                      ? "A"
                                      : "L"}
                                  <span>
                                    {value[0] + value.slice(1).toLowerCase()}
                                  </span>
                                </Button>
                              ),
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            className="attendance-remark-input"
                            value={
                              remarksByStudent[row.studentId] ??
                              row.attendance?.remarks ??
                              ""
                            }
                            onChange={(event) =>
                              setRemarksByStudent((current) => ({
                                ...current,
                                [row.studentId]: event.target.value,
                              }))
                            }
                            placeholder="Add a note"
                            aria-label={`Remark for ${row.student.user.name}`}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="attendance-empty-state">
                      {rows.length
                        ? "No students match this search."
                        : "No active students are enrolled in this class-section."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredRows.length > rowsPerPage && (
            <div className="attendance-pagebar">
              <span>
                Showing {(currentPage - 1) * rowsPerPage + 1}–
                {Math.min(currentPage * rowsPerPage, filteredRows.length)} of {filteredRows.length} students
              </span>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setRowPage((value) => Math.max(1, value - 1))}
                >
                  <ChevronLeft /> Previous
                </Button>
                <span className="attendance-page-number">{currentPage} / {pageCount}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= pageCount}
                  onClick={() => setRowPage((value) => Math.min(pageCount, value + 1))}
                >
                  Next <ChevronRight />
                </Button>
              </div>
            </div>
          )}
          <footer className="attendance-savebar">
            <div className="attendance-save-summary">
              <CircleCheck />
              <strong>{counts.PRESENT} present</strong>
              <span>·</span>
              <strong>{counts.ABSENT} absent</strong>
              <span>·</span>
              <strong>{counts.LATE} late</strong>
              <small>
                {dirtyCount ? `${dirtyCount} edits` : "No unsaved changes"}
              </small>
            </div>
            <Button
              onClick={saveAttendance}
              disabled={!rows.length || save.isPending}
            >
              <Save /> {save.isPending ? "Saving…" : "Save attendance"}
            </Button>
          </footer>
        </Card>
      )}
      {save.isSuccess && (
        <div className="notice notice-success" role="status">
          Attendance saved for this class.
        </div>
      )}
      {save.isError && (
        <div className="notice notice-error" role="alert">
          {save.error instanceof Error
            ? save.error.message
            : "Could not save attendance"}
        </div>
      )}
    </div>
  );
}

function localDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftDate(value: string, days: number) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return localDateValue(date);
}
