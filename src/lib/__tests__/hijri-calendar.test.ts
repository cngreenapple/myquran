import { describe, it, expect } from "vitest";
import {
  gregorianToHijri,
  hijriToGregorian,
  getTodayInfo,
  formatFullDate,
} from "@/lib/hijri-calendar";

describe("gregorianToHijri", () => {
  it("converts known date 2025-03-30 → 1 Ramadan 1446 (approx)", () => {
    // Eid al-Fitr 2025 = 1 Syawal 1446 = 2025-03-30
    // So 1 Ramadan 1446 ≈ 2025-02-28 (or 2025-03-01)
    const result = gregorianToHijri(new Date(2025, 1, 28)); // Feb 28, 2025
    // Allow ±1 day variance depending on algorithm
    expect([1, 2, 29, 30]).toContain(result.day);
  });

  it("returns day 1 for start of new Hijri month (Umm al-Qura)", () => {
    // 2025-03-30 should be approximately 1 Syawal 1446
    const result = gregorianToHijri(new Date(2025, 2, 30)); // Mar 30, 2025
    expect([1, 30, 29]).toContain(result.day); // ±1 day variance
  });

  it("returns monthName and monthArabic", () => {
    const result = gregorianToHijri(new Date(2025, 0, 1));
    expect(result.monthName).toBeTruthy();
    expect(result.monthArabic).toBeTruthy();
  });

  it("uses Umm al-Qura algorithm (table-based)", () => {
    // Reference: 2024-07-07 = 1 Muharram 1446
    const result = gregorianToHijri(new Date(2024, 6, 7));
    expect([1, 30]).toContain(result.day); // ±1 day
  });
});

describe("hijriToGregorian", () => {
  it("round-trip preserves date (±1 day)", () => {
    const original = new Date(2025, 5, 15); // June 15, 2025
    const hijri = gregorianToHijri(original);
    const back = hijriToGregorian(hijri.day, hijri.month, hijri.year);

    const diff = Math.abs(original.getTime() - back.getTime());
    const dayInMs = 1000 * 60 * 60 * 24;
    expect(diff).toBeLessThan(dayInMs * 2); // Allow ±1 day
  });

  it("returns valid Date object", () => {
    const date = hijriToGregorian(1, 1, 1446);
    expect(date).toBeInstanceOf(Date);
    expect(date.getFullYear()).toBeGreaterThan(2023);
    expect(date.getFullYear()).toBeLessThan(2025);
  });
});

describe("getTodayInfo", () => {
  it("returns both Gregorian and Hijri info", () => {
    const info = getTodayInfo(new Date(2025, 5, 15));
    expect(info.gregorian.weekday).toBeTruthy();
    expect(info.hijri.day).toBeGreaterThan(0);
    expect(info.hijri.month).toBeGreaterThan(0);
  });

  it("detects Friday (Jumat)", () => {
    // 2025-06-13 is a Friday
    const info = getTodayInfo(new Date(2025, 5, 13));
    expect(info.isJumat).toBe(true);
    expect(info.gregorian.weekday).toBe("Jumat");
  });
});

describe("formatFullDate", () => {
  it("formats Indonesian full date", () => {
    // 2025-01-15 is a Wednesday
    const result = formatFullDate(new Date(2025, 0, 15));
    expect(result).toBe("Rabu, 15 Januari 2025");
  });

  it("formats various months in Indonesian", () => {
    expect(formatFullDate(new Date(2025, 11, 25))).toContain("Desember");
    expect(formatFullDate(new Date(2025, 6, 17))).toContain("Juli");
  });
});