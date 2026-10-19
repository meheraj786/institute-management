"use client";

import { CrudPanel } from "@/components/crud-panel";
import { useTablePage } from "@/hooks/use-table-page";
import {
  useCreateNotice,
  useDeleteNotice,
  useNotices,
  usePublicNotices,
  usePublishNotice,
} from "@/modules/notices/hooks";
import { noticeSchema } from "@/modules/notices/schemas";

export function NoticeWorkspace({ canManage }: { canManage: boolean }) {
  return canManage ? <AdminNoticeWorkspace /> : <PublicNoticeWorkspace />;
}

function AdminNoticeWorkspace() {
  const { page, onPageChange } = useTablePage();
  const query = useNotices(page);
  const create = useCreateNotice();
  const publish = usePublishNotice();
  const remove = useDeleteNotice();
  return (
    <>
      <CrudPanel
        title="Notices"
        description="Draft, publish, and manage institute announcements."
        records={query.data?.data ?? []}
        pagination={query.data?.pagination}
        onPageChange={onPageChange}
        loading={query.isLoading}
        error={query.error}
        schema={noticeSchema}
        fields={[
          { name: "title", label: "Title" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "publishDate", label: "Publish date", type: "date" },
          {
            name: "status",
            label: "Initial visibility",
            type: "select",
            options: [
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Draft" },
            ],
          },
        ]}
        columns={[
          { key: "title", label: "Notice" },
          {
            key: "publishDate",
            label: "Publish date",
            format: (value) =>
              value ? new Date(String(value)).toLocaleDateString() : "—",
          },
          { key: "status", label: "Status" },
          {
            key: "publisher",
            label: "Published by",
            format: (value) => (value as { name?: string })?.name ?? "—",
          },
        ]}
        onCreate={(value) => create.mutateAsync(value as never)}
        onDelete={(id) => remove.mutateAsync(id)}
      />
      {query.data?.data.some((notice) => notice.status !== "ACTIVE") && (
        <div className="notice-actions">
          <h3>Drafts</h3>
          {query.data.data
            .filter((notice) => notice.status !== "ACTIVE")
            .map((notice) => (
              <div className="notice-row" key={notice.id}>
                <span>{notice.title}</span>
                <button
                  className="button button-secondary"
                  onClick={() => publish.mutate(notice.id)}
                  disabled={publish.isPending}
                >
                  Publish
                </button>
              </div>
            ))}
        </div>
      )}
    </>
  );
}

function PublicNoticeWorkspace() {
  const query = usePublicNotices();
  return (
    <section className="workflow-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">INSTITUTE · ANNOUNCEMENTS</p>
          <h2>Notice board</h2>
          <p>Current notices published by the institute.</p>
        </div>
      </div>
      {query.error && (
        <div className="notice notice-error">
          {query.error instanceof Error
            ? query.error.message
            : "Could not load notices"}
        </div>
      )}
      <div className="notice-board">
        {query.data?.data.length ? (
          query.data.data.map((notice) => (
            <article className="notice-item" key={notice.id}>
              <div className="notice-date">
                {new Date(notice.publishDate).toLocaleDateString()}
              </div>
              <div>
                <h3>{notice.title}</h3>
                <p>{notice.description}</p>
                <small>
                  {notice.publisher?.name ?? "Institute administration"}
                </small>
              </div>
            </article>
          ))
        ) : (
          <p className="empty-inline">No published notices.</p>
        )}
      </div>
    </section>
  );
}
