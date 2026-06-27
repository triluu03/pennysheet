import client from "../client";
import type { TransactionCategory, TransactionClassification } from "./transactions";

export interface UserSettings {
  setting_id: number;
  priority: number;
  regex_rule: string;
  category: TransactionCategory;
  classification: TransactionClassification;
}

export interface CreateUserSettingPayload {
  regex_rule: string;
  category: TransactionCategory;
  classification: TransactionClassification;
}

export interface UpdateUserSettingPayload {
  priority?: number;
  regex_rule?: string;
  category?: TransactionCategory;
  classification?: TransactionClassification;
}

/**
 * Fetch all user settings.
 *
 * @returns {Promise<UserSettings[]>} - List of all user settings ordered by priority.
 */
export async function getUserSettings(): Promise<UserSettings[]> {
  return await client.get("/settings").then(response => response.data);
}

/**
 * Create a new user setting.
 *
 * @param rule {CreateUserSettingPayload} - The user setting to create.
 * @returns {Promise<UserSettings>} - The new user setting.
 */
export async function createUserSetting(payload: CreateUserSettingPayload): Promise<UserSettings> {
  return await client.post("/settings", payload).then(response => response.data);
}

/**
 * Update an existing user setting.
 *
 * @param setting_id {number} - The setting ID to update.
 * @param payload {UpdateUserSettingPayload} - The user setting to update.
 * @returns {Promise<number>} - The status code returned.
 */
export async function updateUserSetting(
  setting_id: number,
  payload: UpdateUserSettingPayload
): Promise<number> {
  return await client.patch(`/settings/${setting_id}`, payload).then(response => response.data);
}

/**
 * Delete a user setting.
 *
 * @param setting_id {number} - The rule id to delete.
 * @returns {Promise<number>} - The status code returned.
 */
export async function deleteUserSetting(setting_id: number): Promise<number> {
  return await client.delete(`/settings/${setting_id}`).then(response => response.data);
}
