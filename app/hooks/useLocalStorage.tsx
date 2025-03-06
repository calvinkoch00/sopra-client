import { useEffect, useState } from "react";

interface LocalStorage<T> {
  value: T;
  set: (newVal: T) => void;
  clear: () => void;
}

/**
 * This custom function/hook safely handles SSR by checking
 * for the window before accessing browser localStorage.
 * IMPORTANT: It has a local react state AND a localStorage state.
 * When initializing the state with a default value,
 * clearing will revert to this default value for the state and
 * the corresponding token gets deleted in the localStorage.
 *
 * @param key - The key from localStorage, generic type T.
 * @param defaultValue - The default value if nothing is in localStorage yet.
 * @returns An object containing:
 *  - value: The current value (synced with localStorage).
 *  - set: Updates both react state & localStorage.
 *  - clear: Resets state to defaultValue and deletes localStorage key.
 */
export default function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): LocalStorage<T> {
  const [value, setValue] = useState<T>(defaultValue);

  // On mount, try to read the stored value
  useEffect(() => {
    if (typeof window === "undefined") return; // SSR safeguard
    try {
      const stored = globalThis.localStorage.getItem(key);
      if (stored) {
        // ✅ Fix: Only parse if it is actually JSON
        setValue(stored.startsWith("{") || stored.startsWith("[") ? JSON.parse(stored) : (stored as T));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  // Simple setter that updates both state and localStorage
  const set = (newVal: T) => {
    setValue(newVal);
    if (typeof window !== "undefined") {
        const valueToStore = typeof newVal === "string" ? newVal : JSON.stringify(newVal);
        globalThis.localStorage.setItem(key, valueToStore);
    }
};

  // Removes the key from localStorage and resets the state
  const clear = () => {
    setValue(defaultValue);
    if (typeof window !== "undefined") {
      globalThis.localStorage.removeItem(key);
    }
  };

  return { value, set, clear };
}
