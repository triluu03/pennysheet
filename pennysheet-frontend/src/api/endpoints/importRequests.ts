import client from "../client";

export interface ImportRequestsMetadata {
  request_id: string;
  session_id: number;
  session_name: string;
  start_date: Date;
  end_date: Date;
  status: "PENDING" | "FAILED" | "SUCCEEDED";
}

/**
 * Get all import requests metadata.
 *
 * @returns {Promise<ImportRequestsMetadata[]>} - List of all import requests metadata.
 */
export async function getAllImportRequestsMetadata(): Promise<ImportRequestsMetadata[]> {
  return await client.get("/import_requests").then(response => response.data);
}
