import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
    return stored ? (JSON.parse(stored) as LastRead) : null;
  } catch {
    return null;
  }
}

export function LastReadProvider({ children }: { children: ReactNode }) {
  const [lastRead, setLastRead] = useState<LastRead | null>(loadLastRead);

  useEffect(() => {
    if (lastRead) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lastRead));
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
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <LastReadContext.Provider
      value={{ lastRead, updateLastRead, clearLastRead }}
    >
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