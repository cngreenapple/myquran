import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  ReadingStatsProvider,
  useReadingStats,
} from "@/hooks/use-reading-stats";
import type { ReactNode } from "react";

function wrapper({ children }: { children: ReactNode }) {
  return <ReadingStatsProvider>{children}</ReadingStatsProvider>;
}

describe("useReadingStats", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with empty stats", () => {
    const { result } = renderHook(() => useReadingStats(), { wrapper });
    expect(result.current.stats.totalAyatRead).toBe(0);
    expect(result.current.stats.streakDays).toBe(0);
    expect(result.current.history).toEqual([]);
  });

  it("first track sets streak to 1", () => {
    const { result } = renderHook(() => useReadingStats(), { wrapper });
    act(() => {
      result.current.trackSurahOpen(1, "Al-Fatihah");
    });
    expect(result.current.stats.streakDays).toBe(1);
    expect(result.current.stats.surahsOpened).toContain(1);
  });

  it("same day activity keeps streak", () => {
    const { result } = renderHook(() => useReadingStats(), { wrapper });
    act(() => {
      result.current.trackSurahOpen(1, "Al-Fatihah");
      result.current.trackSurahOpen(2, "Al-Baqarah");
    });
    expect(result.current.stats.streakDays).toBe(1);
  });

  it("tracks ayat read and increments totalAyatRead", () => {
    const { result } = renderHook(() => useReadingStats(), { wrapper });
    act(() => {
      result.current.trackAyatRead(1, "Al-Fatihah", 1);
      result.current.trackAyatRead(1, "Al-Fatihah", 2);
      result.current.trackAyatRead(2, "Al-Baqarah", 1);
    });
    expect(result.current.stats.totalAyatRead).toBe(3);
  });

  it("resets stats and history", () => {
    const { result } = renderHook(() => useReadingStats(), { wrapper });
    act(() => {
      result.current.trackSurahOpen(1, "Al-Fatihah");
      result.current.trackAyatRead(1, "Al-Fatihah", 1);
    });
    expect(result.current.stats.surahsOpened).toContain(1);

    act(() => {
      result.current.resetStats();
    });
    expect(result.current.stats.surahsOpened).toEqual([]);
    expect(result.current.history).toEqual([]);
  });

  it("persists stats to localStorage", () => {
    const { result } = renderHook(() => useReadingStats(), { wrapper });
    act(() => {
      result.current.trackSurahOpen(1, "Al-Fatihah");
    });

    const stored = localStorage.getItem("quran-reading-stats");
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.streakDays).toBe(1);
  });

  it("getProgress returns 50 for opened surah, 0 for new", () => {
    const { result } = renderHook(() => useReadingStats(), { wrapper });
    act(() => {
      result.current.trackSurahOpen(1, "Al-Fatihah");
    });
    expect(result.current.getProgress(1, 7)).toBe(50);
    expect(result.current.getProgress(114, 6)).toBe(0);
  });
});