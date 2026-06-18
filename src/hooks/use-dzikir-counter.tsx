import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DzikirCounter } from "@/types/dzikir";

const STORAGE_KEY = "quran-dzikir-counters";

interface DzikirContextValue {
  counters: Record<string, DzikirCounter>;
  increment: (categoryId: string, itemId: string, target: number) => void;
  reset: (categoryId: string, itemId: string, target: number) => void;
  resetCategory: (categoryId: string) => void;
  resetAll: () => void;
  getCounter: (categoryId: string, itemId: string, target: number) => DzikirCounter;
  totalCompletedToday: number;
}

const DzikirContext = createContext<DzikirContextValue | null>(null);

function loadCounters(): Record<string, DzikirCounter> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored) as Record<string, DzikirCounter>;
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed;
  } catch (err) {
    console.error("[Dzikir] Failed to load counters", err);
    return {};
  }
}

function makeKey(categoryId: string, itemId: string): string {
  return `${categoryId}::${itemId}`;
}

/**
 * Get YYYY-MM-DD date key dari timestamp.
 * Pakai local date (bukan UTC) supaya match dengan hari user.
 */
function getDateKey(timestamp: number): string {
  const d = new Date(timestamp);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function DzikirProvider({ children }: { children: ReactNode }) {
  const [counters, setCounters] = useState<Record<string, DzikirCounter>>(
    loadCounters,
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(counters));
    } catch (err) {
      console.error("[Dzikir] Failed to save counters", err);
    }
  }, [counters]);

  const getCounter = useCallback(
    (categoryId: string, itemId: string, target: number): DzikirCounter => {
      const key = makeKey(categoryId, itemId);
      const existing = counters[key];
      if (existing && existing.target === target) {
        return existing;
      }
      return {
        itemId,
        categoryId,
        current: 0,
        target,
        lastUpdated: Date.now(),
        completed: false,
        totalCompleted: 0,
      };
    },
    [counters],
  );

  const increment = useCallback(
    (categoryId: string, itemId: string, target: number) => {
      setCounters((prev) => {
        const key = makeKey(categoryId, itemId);
        const existing = prev[key];
        const current = existing
          ? Math.min(existing.current + 1, target)
          : 1;
        const completed = current >= target;
        const totalCompleted = existing
          ? existing.totalCompleted + (completed && !existing.completed ? 1 : 0)
          : 0;
        return {
          ...prev,
          [key]: {
            itemId,
            categoryId,
            current,
            target,
            lastUpdated: Date.now(),
            completed,
            totalCompleted,
          },
        };
      });
    },
    [],
  );

  const reset = useCallback(
    (categoryId: string, itemId: string, target: number) => {
      setCounters((prev) => {
        const key = makeKey(categoryId, itemId);
        const existing = prev[key];
        return {
          ...prev,
          [key]: {
            itemId,
            categoryId,
            current: 0,
            target,
            lastUpdated: Date.now(),
            completed: false,
            totalCompleted: existing?.totalCompleted ?? 0,
          },
        };
      });
    },
    [],
  );

  const resetCategory = useCallback((categoryId: string) => {
    setCounters((prev) => {
      const next: Record<string, DzikirCounter> = {};
      for (const [key, value] of Object.entries(prev)) {
        if (value.categoryId !== categoryId) {
          next[key] = value;
        }
      }
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setCounters({});
  }, []);

  /**
   * Total dzikir yang selesai **pada hari ini** (date key match).
   * Lebih akurat dari window 24 jam: kalau user increment di 23:30 dan
   * check di 00:30 next day, increment sebelumnya tetap dihitung untuk
   * tanggal increment, BUKAN hari ini.
   *
   * Note: counter hanya punya `lastUpdated` timestamp, bukan `completedAt`.
   * Untuk simplicity, kita pakai `lastUpdated` sebagai proxy. Kalau user
   * increment siang hari, lalu increment pagi hari berikutnya, increment
   * pertama akan di-attribute ke tanggal sebelumnya → mungkin miss.
   *
   * Trade-off: counter tidak di-archive per hari, jadi kita tidak punya
   * "completedAt". Pakai `lastUpdated` cukup untuk typical use case
   * (user increment + complete dalam satu sesi).
   */
  const totalCompletedToday = useMemo(() => {
    const todayKey = getDateKey(Date.now());
    return Object.values(counters).filter(
      (c) => c.completed && getDateKey(c.lastUpdated) === todayKey,
    ).length;
  }, [counters]);

  const value = useMemo<DzikirContextValue>(
    () => ({
      counters,
      increment,
      reset,
      resetCategory,
      resetAll,
      getCounter,
      totalCompletedToday,
    }),
    [counters, increment, reset, resetCategory, resetAll, getCounter, totalCompletedToday],
  );

  return (
    <DzikirContext.Provider value={value}>{children}</DzikirContext.Provider>
  );
}

export function useDzikirCounter() {
  const ctx = useContext(DzikirContext);
  if (!ctx) throw new Error("useDzikirCounter must be used within DzikirProvider");
  return ctx;
}