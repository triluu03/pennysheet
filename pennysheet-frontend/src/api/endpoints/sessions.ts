import client from "../client";

export interface EnableBankingSession {
  session_id: number;
  session_name: string;
  created_at: Date;
}

export interface CreateSessionPayload {
  name: string;
  session: string;
}

/**
 * Fetch all Enable Banking sessions.
 *
 * @returns {Promise<EnableBankingSession[]>} - List of all Enable Banking sessions.
 */
export async function getAllSessions(): Promise<EnableBankingSession[]> {
  // TODO: show also the expired sessions!
  return await client.get("/sessions").then(response => response.data.valid_sessions);
}

/**
 * Create a new Enable Banking session.
 *
 * @param rule {CreateSessionPayload} - The new session to create.
 * @returns {Promise<EnableBankingSession>} - The created Enable Banking session.
 */
export async function createNewSession(
  payload: CreateSessionPayload
): Promise<EnableBankingSession> {
  return await client.post("/sessions", payload).then(response => response.data);
}

/**
 * Delete an Enable Banking session.
 *
 * @param sessionId {number} - The session id to delete.
 * @returns {Promise<number>} - The status code returned.
 */
export async function deleteSession(sessionId: number): Promise<number> {
  return await client.delete(`/sessions/${sessionId}`).then(response => response.data);
}
