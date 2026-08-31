import { useCallback, useState } from "react";

type DraftStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
type DraftEnvelope<T> = { version: 1; value: T };

export function formDraftStorageKey(scope: string, formId: string) {
  return `keeper:form-draft:${encodeURIComponent(scope)}:${encodeURIComponent(formId)}`;
}

export function readFormDraft<T>(storage: DraftStorage, key: string, isValid: (value: unknown) => value is T): T | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DraftEnvelope<unknown>>;
    if (parsed.version !== 1 || !isValid(parsed.value)) {
      storage.removeItem(key);
      return null;
    }
    return parsed.value;
  } catch {
    storage.removeItem(key);
    return null;
  }
}

export function writeFormDraft<T>(storage: DraftStorage, key: string, value: T) {
  try {
    storage.setItem(key, JSON.stringify({ version: 1, value } satisfies DraftEnvelope<T>));
  } catch {
    // A full or disabled sessionStorage must not prevent normal form entry.
  }
}

export function clearFormDraft(storage: DraftStorage, key: string) {
  try {
    storage.removeItem(key);
  } catch {
    // Treat unavailable storage as an optional resilience feature.
  }
}

function browserSessionStorage(): DraftStorage | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

type SessionDraftOptions<T> = {
  scope: string | null;
  formId: string;
  createInitial: () => T;
  isValid: (value: unknown) => value is T;
};

export function useSessionDraft<T>({ scope, formId, createInitial, isValid }: SessionDraftOptions<T>) {
  const storageKey = scope ? formDraftStorageKey(scope, formId) : null;
  // Form components use their user/vehicle scope as a React key. A real scope
  // change therefore remounts with the correct isolated draft, while ordinary
  // rerenders and same-identity refreshes keep this state instance intact.
  const [state, setState] = useState<{ value: T; dirty: boolean; key: string | null }>(() => {
    const storage = browserSessionStorage();
    const restored = storage && storageKey ? readFormDraft(storage, storageKey, isValid) : null;
    return { value: restored ?? createInitial(), dirty: restored !== null, key: storageKey };
  });

  const update = useCallback((next: T | ((current: T) => T)) => {
    setState((current) => {
      const value = typeof next === "function" ? (next as (current: T) => T)(current.value) : next;
      const storage = browserSessionStorage();
      if (storage && storageKey) writeFormDraft(storage, storageKey, value);
      return { value, dirty: true, key: storageKey };
    });
  }, [storageKey]);

  const reset = useCallback((next?: T) => {
    const storage = browserSessionStorage();
    if (storage && storageKey) clearFormDraft(storage, storageKey);
    setState({ value: next ?? createInitial(), dirty: false, key: storageKey });
  }, [createInitial, storageKey]);

  return { draft: state.value, isDirty: state.dirty, update, reset };
}
