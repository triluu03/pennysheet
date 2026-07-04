import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_CLASSIFICATIONS,
  type TransactionCategory,
  type TransactionClassification
} from "../api/endpoints/transactions";
import {
  createUserSetting,
  deleteUserSetting,
  type UserSettings,
  updateUserSetting
} from "../api/endpoints/userSettings";
import { useUserSettings } from "../hooks/useUserSettings";

/**
 * Create a new default regex rule.
 */
async function freshRule(): Promise<UserSettings> {
  return await createUserSetting({
    regex_rule: "example",
    category: "Excluded",
    classification: "excluded"
  });
}

/**
 * Section for managing regex-based categorization rules.
 */
export default function RegexRulesSection() {
  const [userSettings, setUserSettings] = useState<UserSettings[]>([]);

  const { data, loading, error } = useUserSettings();
  useEffect(() => {
    if (!loading && !error) setUserSettings(data);
    if (error) console.error(`Error when fetching the user settings: ${error}`);
  }, [data, loading, error]);

  function stageUpdateUserSetting(id: number, patch: Partial<UserSettings>) {
    setUserSettings(prev => prev.map(r => (r.setting_id === id ? { ...r, ...patch } : r)));
  }
  function commitUpdateUserSetting(id: number, patch: Partial<UserSettings>) {
    updateUserSetting(id, patch)
      .then(_ => console.log("Successfully updated regex rule!"))
      .catch(error => console.error(`Failed to update regex rule: ${error}`));
  }

  function removeRule(id: number) {
    setUserSettings(prev => prev.filter(r => r.setting_id !== id));
    deleteUserSetting(id)
      .then(_ => console.log("Successfully deleted user setting!"))
      .catch(error => console.error(`Failed to delete user setting: ${error}`));
  }

  async function addRule() {
    let newRule = await freshRule();
    setUserSettings(prev => [...prev, newRule]);
  }

  function moveRule(currentPriority: number, direction: -1 | 1) {
    const updatedPriority = currentPriority + direction;
    if (updatedPriority < 0 || updatedPriority >= userSettings.length) return;

    setUserSettings(current => {
      const updated = [...current];
      // Swap the order between two entries
      [updated[currentPriority], updated[updatedPriority]] = [
        updated[updatedPriority],
        updated[currentPriority]
      ];
      return updated;
    });

    // NOTE: this will spawn two background jobs in the backend to apply the regex rules to projections,
    // which potentially causes a concurrency race.
    // TODO: address it so that only one background is spawn when updating the priority!
    updateUserSetting(userSettings[currentPriority].setting_id, { priority: currentPriority });
    updateUserSetting(userSettings[updatedPriority].setting_id, { priority: updatedPriority });
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Regex Rules</h2>
        <button
          type="button"
          onClick={addRule}
          className="px-3 py-1.5 rounded-xl bg-indigo-500 text-white text-sm hover:bg-indigo-600"
        >
          + Add rule
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Rules are evaluated top-to-bottom. The first match applies.
      </p>

      {userSettings.length === 0 && (
        <p className="text-sm text-gray-400 italic">No rules yet. Add one above.</p>
      )}

      <div className="flex flex-col gap-2">
        {userSettings.map((rule, priority) => (
          <div
            key={rule.setting_id}
            className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 bg-gray-50"
          >
            {/* Regex */}
            <input
              type="text"
              value={rule.regex_rule}
              onChange={e =>
                stageUpdateUserSetting(rule.setting_id, { regex_rule: e.target.value })
              }
              onBlur={e => commitUpdateUserSetting(rule.setting_id, { regex_rule: e.target.value })}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                  commitUpdateUserSetting(rule.setting_id, { regex_rule: e.currentTarget.value });
                }
              }}
              placeholder="e.g. ^AMZN.*"
              className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />

            {/* Category */}
            <select
              value={rule.category ?? ""}
              onChange={e => {
                stageUpdateUserSetting(rule.setting_id, {
                  category: e.target.value as TransactionCategory
                });
                commitUpdateUserSetting(rule.setting_id, {
                  category: e.target.value as TransactionCategory
                });
              }}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              {TRANSACTION_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Classification */}
            <select
              value={rule.classification ?? ""}
              onChange={e => {
                stageUpdateUserSetting(rule.setting_id, {
                  classification: e.target.value as TransactionClassification
                });
                commitUpdateUserSetting(rule.setting_id, {
                  classification: e.target.value as TransactionClassification
                });
              }}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              {TRANSACTION_CLASSIFICATIONS.map(classification => (
                <option key={classification} value={classification}>
                  {classification}
                </option>
              ))}
            </select>

            {/* Reorder */}
            <button
              type="button"
              onClick={() => moveRule(priority, -1)}
              disabled={priority === 0}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Move rule up"
            >
              <ChevronUpIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => moveRule(priority, 1)}
              disabled={priority === userSettings.length - 1}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Move rule down"
            >
              <ChevronDownIcon className="size-4" />
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => removeRule(rule.setting_id)}
              className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"
              aria-label="Delete rule"
            >
              <TrashIcon className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
