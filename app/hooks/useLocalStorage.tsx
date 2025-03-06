import { useEffect, useState } from "react";

interface LocalStorage<T> {
  value: T;
  set: (newVal: T) => void;
  clear: () => void;
}

export default function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): LocalStorage<T> {
  const [value, setValue] = useState<T>(defaultValue);

  
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = globalThis.localStorage.getItem(key);
      if (stored) {
        setValue(stored.startsWith("{") || stored.startsWith("[") ? JSON.parse(stored) : (stored as T));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  
  const set = (newVal: T) => {
    setValue(newVal);
    if (typeof window !== "undefined") {
        const valueToStore = typeof newVal === "string" ? newVal : JSON.stringify(newVal);
        globalThis.localStorage.setItem(key, valueToStore);
    }
};

  const clear = () => {
    setValue(defaultValue);
    if (typeof window !== "undefined") {
      globalThis.localStorage.removeItem(key);
    }
  };

  return { value, set, clear };
}
