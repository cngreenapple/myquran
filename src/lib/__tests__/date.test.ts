import { describe, it, expect } from "vitest";
import {
  getDateKey,
  daysBetween,
  isSameDay,
  formatFullDate,
  getTodayInfo,
  gregorianToHijri,
} from "@/lib/date";

describe("getDateKey", () => {
  it("returns YYYY-MM-DD format", () => {
    const date = new Date(2025, 0, 15); // Jan 15, 2025
    expect(getDateKey(date)).toBe("2025-01-15");
  });

  it("pads single digit months and days", () => {
    expect(getDateKey(new Date(2025, 0, 5))).toBe("2025-01-05");
    expect(getDateKey(new Date(2025, 8, 9))).toBe("2025-09-09");
  });

  it("accepts timestamp number", () => {
    const ts = new Date(2025, 11, 31).getTime();
    expect(getDateKey(ts)).toBe("2025-12-31");
  });

  it("uses local timezone (not UTC)", () => {
    // Same timestamp, but local date might differ from UTC
    const localMidnight = new Date(2025, 5, 15, 0, 0, 0);
    const key = getDateKey(localMidnight);
    expect(key).toMatch(/^2025-06-15$/);
  });

  it("handles year boundary", () => {
    expect(getDateKey(new Date(2024, 11, 31))).toBe("2024-12-31");
    expect(getDateKey(new Date(2025, 0, 1))).toBe("2025-01-01");
  });
});

describe("daysBetween", () => {
  it("returns 0 for same day", () => {
    expect(daysBetween("2025-01-15", "2025-01-15")).toBe(0);
  });

  it("returns positive for future date", () => {
    expect(daysBetween("2025-01-15", "2025-01-20")).toBe(5);
  });

  it("returns negative for past date", () => {
    expect(daysBetween("2025-01-20", "2025-01-15")).toBe(-5);
  });

  it("handles month boundary", () => {
    expect(daysBetween("2025-01-30", "2025-02-02")).toBe(3);
  });

  it("handles year boundary", () => {
    expect(daysBetween("2024-12-30", "2025-01-02")).toBe(3);
  });

  it("handles leap year correctly", () => {
    // 2024 is leap year
    expect(daysBetween("2024-02-28", "2024-03-01")).toBe(2);
    // 2025 is not
    expect(daysBetween("2025-02-28", "2025-03-01")).toBe(1);
  });
});

describe("isSameDay", () => {
  it("returns true for same day", () => {
    const t1 = new Date(2025, 0, 15, 10, 0).getTime();
    const t2 = new Date(2025, 0, 15, 22, 30).getTime();
    expect(isSameDay(t1, t2)).toBe(true);
  });

  it("returns false for different days", () => {
    const t1 = new Date(2025, 0, 15).getTime();
    const t2 = new Date(2025, 0, 16).getTime();
    expect(isSameDay(t1, t2)).toBe(false);
  });

  it("accepts Date objects", () => {
    const d1 = new Date(2025, 0, 15);
    const d2 = new Date(2025, 0, 15);
    expect(isSameDay(d1, d2)).toBe(true);
  });
});

describe("formatFullDate", () => {
  it("formats Indonesian full date", () => {
    // 2025-01-15 is a Wednesday
    expect(formatFullDate(new Date(2025, 0, 15))).toBe("Rabu, 15 Januari 2025");
  });

  it("handles different months", () => {
    expect(formatFullDate(new Date(2025, 11, 25))).toContain("Desember");
    expect(formatFullDate(new Date(2025, 6, 17))).toContain("Juli");
  });
});

describe("getTodayInfo", () => {
  it("returns both Gregorian and Hijri info", () => {
    const info = getTodayInfo(new Date(2025, 5, 15));
    expect(info.gregorian.weekday).toBeTruthy();
    expect(info.hijri.day).toBeGreaterThan(0);
    expect(info.hijri.month).toBeGreaterThan(0);
    expect(info.hijri.month).toBeLessThanOrEqual(12);
  });
});

describe("gregorianToHijri", () => {
  it("returns valid Hijri date components", () => {
    const result = gregorianToHijri(new Date(2025, 0, 1));
    expect(result.day).toBeGreaterThan(0);
    expect(result.day).toBeLessThanOrEqual(30);
    expect(result.month).toBeGreaterThan(0);
    expect(result.month).toBeLessThanOrEqual(12);
    expect(result.year).toBeGreaterThan(1400);
    expect(result.monthName).toBeTruthy();
    expect(result.monthArabic).toBeTruthy();
  });
});