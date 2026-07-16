/**
 * Data access layer for tracker entries.
 *
 * Deliberately kept thin: two functions, one shape of data, no logic
 * that depends on *how* storage works underneath. This is what lets the
 * storage implementation change (localStorage -> hosted API -> real DB)
 * without touching any component code.
 *
 * Current implementation: browser localStorage, namespaced under one key.
 * Swap point: replace the body of getEntries/saveEntries with real
 * fetch() calls to a backend once one exists. The function signatures
 * (and therefore every caller) do not need to change.
 */

const STORAGE_KEY = "rebuild-tracker:entries";

const EMPTY = { income: [], credit: [], body: [] };

export async function getEntries() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load entries", e);
    return EMPTY;
  }
}

export async function saveEntries(entries) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch (e) {
    console.error("Failed to save entries", e);
    throw e;
  }
}

/**
 * Example of the swap point mentioned above — a future hosted version
 * would look like this instead:
 *
 * export async function getEntries() {
 *   const res = await fetch("/api/entries");
 *   if (!res.ok) throw new Error("Failed to fetch entries");
 *   return res.json();
 * }
 *
 * export async function saveEntries(entries) {
 *   const res = await fetch("/api/entries", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify(entries),
 *   });
 *   if (!res.ok) throw new Error("Failed to save entries");
 *   return res.json();
 * }
 */
