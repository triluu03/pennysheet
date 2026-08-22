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

export interface SessionsResponse {
  valid_sessions: EnableBankingSession[];
  expired_sessions: EnableBankingSession[];
}

/**
 * Fetch all Enable Banking sessions.
 *
 * @returns {Promise<SessionsResponse>} - Object containing valid and expired Enable Banking sessions.
 */
export async function getAllSessions(): Promise<SessionsResponse> {
  return await client.get("/sessions").then(response => response.data);
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
