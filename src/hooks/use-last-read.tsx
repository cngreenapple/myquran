import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LastRead } from "@/types/quran";

const STORAGE_KEY = "quran-last-read";

interface LastReadContextValue {
  lastRead: LastRead | null;
  updateLastRead: (data: Omit<LastRead, "timestamp">) => void;
  clearLastRead: () => void;
}

const LastReadContext = createContext<LastReadContextValue | null>(null);

function loadLastRead(): LastRead | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as LastRead;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch (err) {
    console.error("[LastRead] Failed to load from localStorage", err);
    return null;
  }
}

export function LastReadProvider({ children }: { children: ReactNode }) {
  const [lastRead, setLastRead] = useState<LastRead | null>(loadLastRead);

  useEffect(() => {
    try {
      if (lastRead) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lastRead));
      }
    } catch (err) {
      console.error("[LastRead] Failed to save to localStorage", err);
    }
  }, [lastRead]);

  const updateLastRead = useCallback(
    (data: Omit<LastRead, "timestamp">) => {
      setLastRead({ ...data, timestamp: Date.now() });
    },
    [],
  );

  const clearLastRead = useCallback(() => {
    setLastRead(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("[LastRead] Failed to remove from localStorage", err);
    }
  }, []);

  const value = useMemo<LastReadContextValue>(
    () => ({ lastRead, updateLastRead, clearLastRead }),
    [lastRead, updateLastRead, clearLastRead],
  );

  return (
    <LastReadContext.Provider value={value}>
      {children}
    </LastReadContext.Provider>
  );
}

export function useLastRead() {
  const ctx = useContext(LastReadContext);
  if (!ctx)
    throw new Error("useLastRead must be used within LastReadProvider");
  return ctx;
}