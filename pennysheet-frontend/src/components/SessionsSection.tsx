import { TrashIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import {
  createNewSession,
  deleteSession,
  type EnableBankingSession
} from "../api/endpoints/sessions";
import { useSessions } from "../hooks/useSessions";

/**
 * Section for managing Enable Banking sessions.
 */
export default function SessionsSection() {
  const [sessions, setSessions] = useState<EnableBankingSession[]>([]);
  const { data, loading, error } = useSessions();
  useEffect(() => {
    if (!loading && !error) setSessions(data);
    if (error) console.error(`Error when fetching the Enable Banking sessions: ${error}`);
  }, [data, loading, error]);

  const [showImport, setShowImport] = useState(false);
  const [importName, setImportName] = useState("");
  const [importJson, setImportJson] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  async function handleImport() {
    const trimmedName = importName.trim();
    if (!trimmedName) {
      setImportError("Session name is required.");
      return;
    }
    if (!importJson.trim()) {
      setImportError("Session JSON data is required.");
      return;
    }
    try {
      JSON.parse(importJson);
    } catch {
      setImportError("Invalid JSON format in session data.");
      return;
    }

    let newSession = await createNewSession({ name: trimmedName, session: importJson });
    setSessions(prev => [...prev, newSession]);

    setImportName("");
    setImportJson("");
    setShowImport(false);
    setImportError(null);
  }

  async function confirmDelete(sessionId: number) {
    await deleteSession(sessionId);
    setSessions(prev => prev.filter(s => s.session_id !== sessionId));
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Enable Banking Sessions</h2>
        {!showImport && (
          <button
            type="button"
            onClick={() => setShowImport(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-500 text-white text-sm hover:bg-indigo-600"
          >
            + Import session
          </button>
        )}
      </div>

      {showImport && (
        <div className="mb-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500 mb-3">Import a new session.</p>
          <input
            type="text"
            value={importName}
            onChange={e => {
              setImportName(e.target.value);
              setImportError(null);
            }}
            placeholder="Session name"
            className="w-full mb-2 px-3 py-1.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
          <textarea
            value={importJson}
            onChange={e => {
              setImportJson(e.target.value);
              setImportError(null);
            }}
            placeholder='{"key": "value", ...}'
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none"
          />
          {importError && <p className="text-sm text-red-500 mt-1">{importError}</p>}
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={handleImport}
              className="px-3 py-1.5 rounded-xl bg-indigo-500 text-white text-sm hover:bg-indigo-600"
            >
              Import
            </button>
            <button
              type="button"
              onClick={() => {
                setShowImport(false);
                setImportName("");
                setImportJson("");
                setImportError(null);
              }}
              className="px-3 py-1.5 rounded-xl border border-gray-300 text-sm text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {sessions.length === 0 && (
        <p className="text-sm text-gray-400 italic">
          No Enable Banking sessions are found! Please import at least one to keep the app working!
        </p>
      )}

      <div className="flex flex-col gap-2">
        {sessions.map(session => (
          <div
            key={session.session_id}
            className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium">{session.session_name}</span>
              <span className="text-xs text-gray-500">
                {new Date(session.created_at).toISOString().split("T")[0]}
              </span>
            </div>

            {deleteConfirmId === session.session_id ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-600">Delete this session?</span>
                <button
                  type="button"
                  onClick={() => confirmDelete(session.session_id)}
                  className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs hover:bg-red-600"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-2 py-1 rounded-lg border border-gray-300 text-xs text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setDeleteConfirmId(session.session_id)}
                className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"
                aria-label="Delete session"
              >
                <TrashIcon className="size-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
