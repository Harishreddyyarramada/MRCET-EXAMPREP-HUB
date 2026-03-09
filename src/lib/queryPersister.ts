const CACHE_KEY = "mrcet-query-cache";
const CACHE_VERSION = 1;
const MAX_AGE = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

interface CacheStore {
  version: number;
  entries: Record<string, CacheEntry>;
}

function getStore(): CacheStore {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return { version: CACHE_VERSION, entries: {} };
    const store = JSON.parse(raw) as CacheStore;
    if (store.version !== CACHE_VERSION) return { version: CACHE_VERSION, entries: {} };
    return store;
  } catch {
    return { version: CACHE_VERSION, entries: {} };
  }
}

function saveStore(store: CacheStore) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(store));
  } catch {
    // Storage full — clear and retry
    localStorage.removeItem(CACHE_KEY);
  }
}

export function getCachedQuery<T>(key: string): T | undefined {
  const store = getStore();
  const entry = store.entries[key];
  if (!entry) return undefined;
  if (Date.now() - entry.timestamp > MAX_AGE) {
    delete store.entries[key];
    saveStore(store);
    return undefined;
  }
  return entry.data as T;
}

export function setCachedQuery(key: string, data: unknown) {
  const store = getStore();
  store.entries[key] = { data, timestamp: Date.now() };
  // Keep max 50 entries
  const keys = Object.keys(store.entries);
  if (keys.length > 50) {
    const sorted = keys.sort((a, b) => store.entries[a].timestamp - store.entries[b].timestamp);
    for (let i = 0; i < keys.length - 50; i++) {
      delete store.entries[sorted[i]];
    }
  }
  saveStore(store);
}
