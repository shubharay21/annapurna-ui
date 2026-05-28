/**
 * formCache.ts
 * Tab-wise local cache for form drafts.
 * - Saves each step's payload to localStorage under `annapurna_draft_<stepId>`
 * - Stores a djb2 hash alongside under `annapurna_draft_hash_<stepId>`
 * - `isDraftChanged` lets callers skip redundant API saves when data is unchanged
 */

const PREFIX = 'annapurna_draft_';
const HASH_PREFIX = 'annapurna_draft_hash_';

/** Simple deterministic djb2 hash over a JSON string */
function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0; // unsigned 32-bit
}

/** Stable serialisation: sorts object keys so field-order changes don't create false positives */
function stableStringify(data: unknown): string {
  if (data === null || data === undefined) return 'null';
  if (typeof data !== 'object') return JSON.stringify(data);
  if (Array.isArray(data)) return '[' + (data as unknown[]).map(stableStringify).join(',') + ']';
  const sorted = Object.keys(data as object)
    .sort()
    .map(k => JSON.stringify(k) + ':' + stableStringify((data as Record<string, unknown>)[k]));
  return '{' + sorted.join(',') + '}';
}

/** Load previously cached draft for a step. Returns null if nothing cached. */
export function loadCachedDraft(stepId: string): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${PREFIX}${stepId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Returns true when the in-memory data differs from the last-saved hash */
export function isDraftChanged(stepId: string, data: unknown): boolean {
  if (typeof window === 'undefined') return true;
  const storedHash = localStorage.getItem(`${HASH_PREFIX}${stepId}`);
  if (!storedHash) return true;
  const currentHash = djb2Hash(stableStringify(data)).toString();
  return currentHash !== storedHash;
}

/** Persist draft and update hash */
export function saveCachedDraft(stepId: string, data: unknown): void {
  if (typeof window === 'undefined') return;
  const serialised = stableStringify(data);
  localStorage.setItem(`${PREFIX}${stepId}`, JSON.stringify(data));
  localStorage.setItem(`${HASH_PREFIX}${stepId}`, djb2Hash(serialised).toString());
}

/** Clear all cached draft steps (called on logout / successful submission) */
export function clearAllDraftCache(): void {
  if (typeof window === 'undefined') return;
  const keysToDelete: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith(PREFIX) || key.startsWith(HASH_PREFIX))) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(k => localStorage.removeItem(k));
}
