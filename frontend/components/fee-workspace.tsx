"use client";

import { useState } from "react";
import { Search } from "lucide-react";
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
import { ValidatedForm, type FormField } from "@/components/validated-form";
import { useAcademicYears } from "@/modules/academic-years/hooks";
import { useClasses } from "@/modules/classes/hooks";
import {
  useFeeCollections,
  useFeeHeads,
  useFeeStructures,
  useFeeStudentSearch,
  useStudentFeeDue,
  useCreateFeeCollection,
  useCreateFeeHead,
  useCreateFeeStructure,
  useDeleteFeeHead,
  useDeleteFeeStructure,
} from "@/modules/fees/hooks";
import {
  feeCollectionSchema,
  feeHeadSchema,
  feeStructureSchema,
} from "@/modules/fees/schemas";
import type { FeeStudent } from "@/modules/fees/service";

const toOptions = (items: { id: number; name?: string; title?: string }[]) =>
  items.map((item) => ({
    value: String(item.id),
    label: item.name ?? item.title ?? String(item.id),
  }));

type Props = { canManage: boolean };
export function FeeWorkspace({ canManage }: Props) {
  const [view, setView] = useState<"collection" | "heads" | "structures">(
    "collection",
  );
  const headsPage = useTablePage();
  const structuresPage = useTablePage();
  const [search, setSearch] = useState("");
  const [studentId, setStudentId] = useState<number | null>(null);
  const [yearId, setYearId] = useState<number | null>(null);
  const students = useFeeStudentSearch(search);
  const due = useStudentFeeDue(studentId, yearId);
  const collections = useFeeCollections();
  const heads = useFeeHeads(headsPage.page);
  const structures = useFeeStructures(structuresPage.page);
  const years = useAcademicYears();
  const classes = useClasses();
  const createPayment = useCreateFeeCollection();
  const createHead = useCreateFeeHead();
  const removeHead = useDeleteFeeHead();
  const createStructure = useCreateFeeStructure();
  const removeStructure = useDeleteFeeStructure();
  const lastReceipt = createPayment.data?.receiptNo;
  const headFields: FormField[] = [
    { name: "name", label: "Fee name", placeholder: "Tuition" },
    { name: "description", label: "Description", type: "textarea" },
  ];
  const structureFields: FormField[] = [
    {
      name: "academicYearId",
      label: "Academic year",
      type: "select",
      options: toOptions(years.data?.data ?? []),
    },
    {
      name: "classId",
      label: "Class",
      type: "select",
      options: toOptions(classes.data?.data ?? []),
    },
    {
      name: "feeHeadId",
      label: "Fee head",
      type: "select",
      options: toOptions(heads.data?.data ?? []),
    },
    { name: "amount", label: "Amount", type: "number" },
    {
      name: "frequency",
      label: "Frequency",
      type: "select",
      options: [
        { value: "MONTHLY", label: "Monthly" },
        { value: "YEARLY", label: "Yearly" },
        { value: "ONE_TIME", label: "One time" },
      ],
    },
  ];
  const paymentFields: FormField[] = [
    {
      name: "studentId",
      label: "Student",
      type: "select",
      options:
        students.data?.map((student) => ({
          value: String(student.id),
          label: `${student.studentId} · ${student.user.name}`,
        })) ?? [],
    },
    {
      name: "academicYearId",
      label: "Academic year",
      type: "select",
      options: toOptions(years.data?.data ?? []),
    },
    {
      name: "feeHeadId",
      label: "Fee item",
      type: "select",
      options:
        due.data?.map((item) => ({
          value: String(item.feeHeadId),
          label: `${item.feeHead?.name ?? "Fee"} · due ${item.balanceDue.toFixed(2)}`,
        })) ?? [],
    },
    { name: "amount", label: "Fee amount", type: "number" },
    { name: "paidAmount", label: "Paid now", type: "number" },
    { name: "discount", label: "Discount", type: "number" },
    { name: "fine", label: "Fine", type: "number" },
    { name: "paymentDate", label: "Payment date", type: "date" },
    {
      name: "paymentMethod",
      label: "Payment method",
      type: "select",
      options: [
        { value: "CASH", label: "Cash" },
        { value: "BKASH", label: "bKash" },
        { value: "NAGAD", label: "Nagad" },
        { value: "BANK", label: "Bank" },
      ],
    },
    { name: "remarks", label: "Remarks" },
  ];

  return (
    <>
      <div className="segmented-control">
        <button
          className={view === "collection" ? "selected" : ""}
          onClick={() => setView("collection")}
        >
          Collection
        </button>
        {canManage && (
          <>
            <button
              className={view === "heads" ? "selected" : ""}
              onClick={() => setView("heads")}
            >
              Fee heads
            </button>
            <button
              className={view === "structures" ? "selected" : ""}
              onClick={() => setView("structures")}
            >
              Fee structures
            </button>
          </>
        )}
      </div>
      {view === "heads" && canManage ? (
        <CrudPanel
          title="Fee heads"
          description="Define the fee categories used across classes."
          records={heads.data?.data ?? []}
          pagination={heads.data?.pagination}
          onPageChange={headsPage.onPageChange}
          loading={heads.isLoading}
          error={heads.error}
          schema={feeHeadSchema}
          fields={headFields}
          columns={[
            { key: "name", label: "Fee head" },
            { key: "description", label: "Description" },
          ]}
          onCreate={(value) => createHead.mutateAsync(value as never)}
          onDelete={(id) => removeHead.mutateAsync(id)}
        />
      ) : null}
      {view === "structures" && canManage ? (
        <CrudPanel
          title="Fee structures"
          description="Set amount and frequency for each class and academic year."
          records={structures.data?.data ?? []}
          pagination={structures.data?.pagination}
          onPageChange={structuresPage.onPageChange}
          loading={structures.isLoading}
          error={structures.error}
          schema={feeStructureSchema}
          fields={structureFields}
          columns={[
            {
              key: "class",
              label: "Class",
              format: (value) => (value as { name?: string })?.name ?? "—",
            },
            {
              key: "feeHead",
              label: "Fee head",
              format: (value) => (value as { name?: string })?.name ?? "—",
            },
            {
              key: "amount",
              label: "Amount",
              format: (value) => Number(value).toFixed(2),
            },
            { key: "frequency", label: "Frequency" },
          ]}
          onCreate={(value) => createStructure.mutateAsync(value as never)}
          onDelete={(id) => removeStructure.mutateAsync(id)}
        />
      ) : null}
      {view === "collection" && (
        <div className="fee-flow">
          <section className="workflow-page">
            <div className="section-heading">
              <div>
                <p className="eyebrow">PAYMENTS · RECEIPTS</p>
                <h2>Fee collection</h2>
                <p>
                  Find a student, review their balance, then record a payment.
                </p>
              </div>
            </div>
            <label className="search-field">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search student ID, name, or email"
              />
            </label>
            {students.data?.length ? (
              <div className="student-results">
                {students.data.map((student: FeeStudent) => (
                  <button
                    className={`student-result ${studentId === student.id ? "active" : ""}`}
                    key={student.id}
                    onClick={() => setStudentId(student.id)}
                  >
                    <strong>{student.user.name}</strong>
                    <span>
                      {student.studentId} ·{" "}
                      {student.enrollments[0]?.class.name ?? "No class"}
                    </span>
                  </button>
                ))}
              </div>
            ) : search.trim() && !students.isLoading ? (
              <p className="empty-inline">No matching students.</p>
            ) : null}
            {studentId && (
              <label className="year-picker">
                <span>Academic year</span>
                <select
                  value={yearId ?? ""}
                  onChange={(event) => setYearId(Number(event.target.value))}
                >
                  <option value="" disabled>
                    Select year
                  </option>
                  {years.data?.data.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.title}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {due.data && (
              <div className="due-list">
                <h3>Outstanding fees</h3>
                {due.data.length ? (
                  due.data.map((item) => (
                    <div className="due-row" key={item.id}>
                      <span>
                        {item.feeHead?.name ?? "Fee"}
                        <small>
                          {item.frequency} · {item.class?.name}
                        </small>
                      </span>
                      <strong>{item.balanceDue.toFixed(2)}</strong>
                    </div>
                  ))
                ) : (
                  <p className="empty-inline">
                    No fee structures found for this enrollment.
                  </p>
                )}
              </div>
            )}
            {lastReceipt && (
              <div className="notice notice-success">
                Payment saved. Receipt <strong>{lastReceipt}</strong>
              </div>
            )}
          </section>
          <aside className="module-form">
            <p className="eyebrow">SAVE PAYMENT</p>
            <h2>Payment details</h2>
            <ValidatedForm
              schema={feeCollectionSchema}
              fields={paymentFields}
              submitLabel="Save payment & generate receipt"
              onSubmit={(value) => createPayment.mutateAsync(value as never)}
            />
          </aside>
          <section className="recent-payments">
            <div className="section-heading">
              <div>
                <p className="eyebrow">LEDGER</p>
                <h2>Recent collections</h2>
              </div>
            </div>
            <div className="table-wrap">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Fee item</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collections.data?.data.slice(0, 8).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.receiptNo}</TableCell>
                      <TableCell>{row.student?.user?.name ?? "—"}</TableCell>
                      <TableCell>{row.feeHead?.name ?? "—"}</TableCell>
                      <TableCell>{Number(row.paidAmount).toFixed(2)}</TableCell>
                      <TableCell>
                        {new Date(row.paymentDate).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
