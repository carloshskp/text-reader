export function readFromStorage(key: string, storage: Storage): string | null {
  try {
    return storage.getItem(key);
  } catch (_error) {
    return null;
  }
}

export function writeToStorage(key: string, value: string, storage: Storage): void {
  try {
    storage.setItem(key, value);
  } catch (_error) {
    // ignore persistence issues (private mode, quotas, etc.)
  }
}
