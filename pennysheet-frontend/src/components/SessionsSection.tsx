import { TrashIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import {
  createNewSession,
  deleteSession,
  type EnableBankingSession
} from "../api/endpoints/sessions";
import { formatDate } from "../api/utils";
import { useSessions } from "../hooks/useSessions";
import { useToast } from "./Toast";

/**
 * Section for managing Enable Banking sessions.
 */
export default function SessionsSection() {
  const { showToast } = useToast();

  const [sessions, setSessions] = useState<EnableBankingSession[]>([]);
  const [expiredSessions, setExpiredSessions] = useState<EnableBankingSession[]>([]);
  const { data, loading, error } = useSessions();

  useEffect(() => {
    if (!loading && !error) {
      setSessions(data.valid_sessions);
      setExpiredSessions(data.expired_sessions);
    }
    if (error)
      showToast(`Error when fetching the Enable Banking sessions: ${error.message}`, "error");
  }, [data, loading, error, showToast]);

  useEffect(() => {
    if (expiredSessions.length > 0) {
      showToast(
        "You have expired Enable Banking sessions. Please address them by deleting and re-importing a new one.",
        "warning"
      );
    }
  }, [expiredSessions.length, showToast]);

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

    await createNewSession({ name: trimmedName, session: importJson })
      .then(newSession => {
        setSessions(prev => [...prev, newSession]);

        setImportName("");
        setImportJson("");
        setShowImport(false);
        setImportError(null);
      })
      .catch(error => showToast(`Failed to import a new session. Reason: ${error}`, "error"));
  }

  async function confirmDelete(sessionId: number) {
    await deleteSession(sessionId)
      .then(_ => {
        setSessions(prev => prev.filter(s => s.session_id !== sessionId));
        setExpiredSessions(prev => prev.filter(s => s.session_id !== sessionId));
        setDeleteConfirmId(null);
      })
      .catch(error => {
        showToast(`Failed to delete session: ${error}`, "error");
        setDeleteConfirmId(null);
      });
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

      {sessions.length === 0 && expiredSessions.length === 0 && (
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
                {formatDate(new Date(session.created_at))}
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

      {expiredSessions.length > 0 && (
        <>
          <p className="text-sm font-medium text-amber-600 mt-4 mb-1">Expired sessions</p>
          <div className="flex flex-col gap-2">
            {expiredSessions.map(session => (
              <div
                key={session.session_id}
                className="flex items-center justify-between p-3 rounded-lg border border-amber-500 bg-amber-50"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {session.session_name}
                    <span className="ml-2 text-xs font-medium text-amber-600">Expired</span>
                  </span>
                  <span className="text-xs text-amber-700">
                    {formatDate(new Date(session.created_at))}
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
        </>
      )}
    </section>
  );
}
