"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { z } from "zod";
import { getApiErrorMessage } from "@/lib/api-client";
import { ValidatedForm, type FormField } from "./validated-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type TableColumn<T> = {
  key: keyof T | string;
  label: string;
  format?: (value: unknown, record: T) => string;
};

type Props<T extends { id: number }> = {
  title: string;
  description: string;
  records: T[];
  columns: TableColumn<T>[];
  schema: z.ZodType;
  fields: FormField[];
  loading?: boolean;
  error?: unknown;
  pagination?: { page: number; limit: number; total: number; pages: number };
  onPageChange?: (page: number) => void;
  onCreate: (value: unknown) => Promise<unknown>;
  onDelete?: (id: number) => Promise<unknown>;
};

export function CrudPanel<T extends { id: number }>({
  title,
  description,
  records,
  columns,
  schema,
  fields,
  loading,
  error,
  pagination,
  onPageChange,
  onCreate,
  onDelete,
}: Props<T>) {
  const [page, setPage] = useState(1);
  const pageSize = pagination?.limit ?? 10;
  const pageCount =
    pagination?.pages ?? Math.max(1, Math.ceil(records.length / pageSize));
  const currentPage = pagination?.page ?? Math.min(page, pageCount);
  const pageRecords = pagination
    ? records
    : records.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const changePage = (nextPage: number) => {
    if (onPageChange) onPageChange(nextPage);
    else setPage(nextPage);
  };
  const message = error ? getApiErrorMessage(error) : "";
  return (
    <div className="module-layout">
      <Card className="module-list min-w-0 rounded-lg">
        <CardHeader>
          <p className="eyebrow">RECORDS · {records.length}</p>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        {message && <div className="notice notice-error">{message}</div>}
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={String(column.key)}>{column.label}</TableHead>
                ))}
                {onDelete && <TableHead aria-label="Actions" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (onDelete ? 1 : 0)}>
                    Loading records…
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (onDelete ? 1 : 0)}>
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                pageRecords.map((record) => (
                  <TableRow key={record.id}>
                    {columns.map((column) => {
                      const value = (record as Record<string, unknown>)[
                        String(column.key)
                      ];
                      return (
                        <TableCell key={String(column.key)}>
                          {column.format
                            ? column.format(value, record)
                            : value == null || value === ""
                              ? "—"
                              : String(value)}
                        </TableCell>
                      );
                    })}
                    {onDelete && (
                      <TableCell className="action-cell">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Delete record"
                          aria-label="Delete record"
                          onClick={() =>
                            window.confirm("Delete this record?") &&
                            onDelete(record.id)
                          }
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {(pagination?.pages ?? Math.ceil(records.length / pageSize)) > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
              <span className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1}–
                {Math.min(
                  currentPage * pageSize,
                  pagination?.total ?? records.length,
                )}{" "}
                of {pagination?.total ?? records.length}
              </span>
              <Pagination className="mx-0 w-auto justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      aria-disabled={currentPage <= 1}
                      onClick={(event) => {
                        event.preventDefault();
                        changePage(Math.max(1, currentPage - 1));
                      }}
                    />
                  </PaginationItem>
                  {Array.from(
                    { length: pageCount },
                    (_, index) => index + 1,
                  ).map((pageNumber) => (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        isActive={pageNumber === currentPage}
                        onClick={(event) => {
                          event.preventDefault();
                          changePage(pageNumber);
                        }}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      aria-disabled={currentPage >= pageCount}
                      onClick={(event) => {
                        event.preventDefault();
                        changePage(Math.min(pageCount, currentPage + 1));
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="module-form rounded-lg">
        <CardHeader>
          <p className="eyebrow">NEW RECORD</p>
          <CardTitle>Add {title.replace(/s$/, "")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ValidatedForm schema={schema} fields={fields} onSubmit={onCreate} />
        </CardContent>
      </Card>
    </div>
  );
}
