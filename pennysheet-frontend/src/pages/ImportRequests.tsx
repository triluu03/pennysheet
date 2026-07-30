import { useEffect } from "react";
import type { ImportRequestsMetadata } from "../api/endpoints/importRequests";
import PageHeader from "../components/PageHeader";
import Table, { type EditableColumn, type TableColumn } from "../components/Table";
import { useToast } from "../components/Toast";
import { useImportRequestsMetadata } from "../hooks/useImportRequestsMetadata";

/** Color map for import request status values. */
const IMPORT_REQUEST_STATUS_COLORS: Record<string, string> = {
  PENDING: "#f9ab00", // yellow
  FAILED: "#ea4335", // red
  SUCCEEDED: "#34a853" // green
};

/**
 * Columns to be rendered in the table.
 */
const TABLE_COLUMNS: TableColumn<keyof ImportRequestsMetadata>[] = [
  { key: "session_name", label: "Session" },
  { key: "start_date", label: "Start Date" },
  { key: "end_date", label: "End Date" },
  { key: "status", label: "Status", colorMap: IMPORT_REQUEST_STATUS_COLORS }
];

/**
 * Columns to support edit feature
 */
const EDITABLE_COLUMNS: EditableColumn<keyof ImportRequestsMetadata>[] = [];

/**
 * Import Requests page.
 */
export default function ImportRequestsPage() {
  const { showToast } = useToast();

  const { data, error } = useImportRequestsMetadata();
  useEffect(() => {
    if (error) showToast(`Failed to fetch transactions: ${error}`, "error");
  }, [error, showToast]);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-col flex-1 h-full p-8 overflow-y-auto">
        <PageHeader title="Transaction Import Requests" subtitle="Metadata" />
        <div className="flex flex-col flex-1 rounded-lg gap-5">
          <Table
            data={data}
            rowIdColumn="request_id"
            tableColumns={TABLE_COLUMNS}
            editableColumns={EDITABLE_COLUMNS}
          />
        </div>
      </div>
    </div>
  );
}
