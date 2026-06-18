import { describe, it, expect } from "vitest";
import {
  cleanTime,
  getPrayerList,
  getNextPrayer,
  formatCountdown,
  formatHijriId,
} from "@/lib/prayer-times";
import type { PrayerSchedule } from "@/lib/prayer-times";

const mockSchedule: PrayerSchedule = {
  date: "15-1-2025",
  location: { lat: -6.2088, lng: 106.8456, method: "gps" },
  timings: {
    Fajr: "04:30",
    Sunrise: "05:45",
    Dhuhr: "12:00",
    Asr: "15:15",
    Sunset: "18:00",
    Maghrib: "18:15",
    Isha: "19:30",
    Imsak: "04:20",
    Midnight: "00:00",
  },
  hijriDate: {
    date: "15-1-1446",
    day: "15",
    month: { number: 1, en: "Muharram", ar: "المحرم" },
    year: "1446",
  },
  method: "KEMENAG",
};

// Helper: create Date dengan jam tertentu hari ini
function todayAt(hours: number, minutes = 0): Date {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

describe("cleanTime", () => {
  it("strips timezone suffix (WIB, etc)", () => {
    expect(cleanTime("04:30 (WIB)")).toBe("04:30");
    expect(cleanTime("12:00 (WITA)")).toBe("12:00");
  });

  it("returns unchanged if no suffix", () => {
    expect(cleanTime("04:30")).toBe("04:30");
  });

  it("handles whitespace", () => {
    expect(cleanTime("  04:30  ")).toBe("04:30");
  });
});

describe("getPrayerList", () => {
  it("returns 5 prayers in order (Subuh, Dzuhur, Ashar, Maghrib, Isya)", () => {
    const list = getPrayerList(mockSchedule, todayAt(8));
    expect(list).toHaveLength(5);
    expect(list.map((p) => p.name)).toEqual([
      "Subuh",
      "Dzuhur",
      "Ashar",
      "Maghrib",
      "Isya",
    ]);
  });

  it("marks past prayers correctly", () => {
    // At 13:00, Subuh (04:30) and Dzuhur (12:00) are past
    const list = getPrayerList(mockSchedule, todayAt(13));
    expect(list[0].isPast).toBe(true); // Subuh
    expect(list[1].isPast).toBe(true); // Dzuhur
    expect(list[2].isPast).toBe(false); // Ashar (15:15)
    expect(list[2].isNext).toBe(true); // Ashar is next
  });

  it("marks first prayer as next if all are future", () => {
    const list = getPrayerList(mockSchedule, todayAt(0, 30));
    expect(list[0].isNext).toBe(true); // Subuh at 04:30
  });

  it("marks first prayer as next if all are past (next day Subuh)", () => {
    const list = getPrayerList(mockSchedule, todayAt(23, 0));
    expect(list.every((p) => p.isPast)).toBe(true);
    expect(list[0].isNext).toBe(true); // Subuh is "next" (tomorrow)
  });
});

describe("getNextPrayer", () => {
  it("returns next prayer + countdown", () => {
    const result = getNextPrayer(mockSchedule, todayAt(10));
    expect(result?.prayer.name).toBe("Dzuhur");
    // From 10:00 to 12:00 = 2 hours = 7,200,000 ms
    expect(result?.countdownMs).toBeGreaterThan(7100000);
    expect(result?.countdownMs).toBeLessThan(7300000);
  });

  it("returns tomorrow Subuh if all prayers passed", () => {
    const result = getNextPrayer(mockSchedule, todayAt(23, 30));
    expect(result?.prayer.name).toBe("Subuh");
    // From 23:30 today to 04:30 tomorrow = 5 hours
    expect(result?.countdownMs).toBeGreaterThan(5 * 60 * 60 * 1000);
    expect(result?.countdownMs).toBeLessThan(5 * 60 * 60 * 1000 + 60000);
  });
});

describe("formatCountdown", () => {
  it("formats ms to HH:mm:ss", () => {
    expect(formatCountdown(0)).toBe("00:00:00");
    expect(formatCountdown(1000)).toBe("00:00:01");
    expect(formatCountdown(60 * 1000)).toBe("00:01:00");
    expect(formatCountdown(60 * 60 * 1000)).toBe("01:00:00");
    expect(formatCountdown(7 * 60 * 60 * 1000 + 30 * 60 * 1000 + 15 * 1000)).toBe(
      "07:30:15",
    );
  });

  it("handles negative values", () => {
    expect(formatCountdown(-1000)).toBe("00:00:00");
  });

  it("handles large values (multiple days)", () => {
    // 25 hours = 1d 1h
    expect(formatCountdown(25 * 60 * 60 * 1000)).toBe("25:00:00");
  });
});

describe("formatHijriId", () => {
  it("translates English month names to Indonesian", () => {
    expect(formatHijriId(mockSchedule.hijriDate)).toBe("15 Muharram 1446 H");
  });

  it("translates various months", () => {
    const cases: Array<[string, string]> = [
      ["Rabi' al-Awwal", "Rabiul Awal"],
      ["Rabi' al-Thani", "Rabiul Akhir"],
      ["Jumada al-Awwal", "Jumadil Awal"],
      ["Sha'ban", "Syaban"],
      ["Ramadan", "Ramadan"],
      ["Dhu al-Hijjah", "Dzulhijjah"],
    ];

    for (const [en, id] of cases) {
      const result = formatHijriId({
        ...mockSchedule.hijriDate,
        month: { ...mockSchedule.hijriDate.month, en },
      });
      expect(result).toContain(id);
    }
  });

  it("falls back to English name if not in mapping", () => {
    const result = formatHijriId({
      ...mockSchedule.hijriDate,
      month: { ...mockSchedule.hijriDate.month, en: "Unknown Month" },
    });
    expect(result).toContain("Unknown Month");
  });
});