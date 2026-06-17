/**
 * Aladhan API client untuk jadwal sholat
 * https://aladhan.com/prayer-times-api
 */

import type { Location } from "./location";

export interface PrayerTime {
  name: string;
  nameArabic: string;
  time: string; // HH:mm
  timestamp: number; // ms epoch
  isPast: boolean;
  isNext: boolean;
}

export interface PrayerSchedule {
  date: string; // YYYY-MM-DD
  location: Location;
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Sunset: string;
    Maghrib: string;
    Isha: string;
    Imsak: string;
    Midnight: string;
  };
  hijriDate: {
    date: string;
    day: string;
    month: {
      number: number;
      en: string;
      ar: string;
      id?: string;
    };
    year: string;
  };
  method: string;
}

const ALADHAN_BASE = "https://api.aladhan.com/v1";

// Cache jadwal sholat per hari per lokasi (max 7 hari)
const scheduleCache = new Map<string, PrayerSchedule>();

function cacheKey(date: string, lat: number, lng: number, method: number): string {
  return `${date}|${lat.toFixed(3)}|${lng.toFixed(3)}|${method}`;
}

export interface FetchPrayerOptions {
  method?: number; // calculation method (default: 11 = KEMENAG Indonesia)
  school?: 0 | 1; // 0 = Standard (Shafii), 1 = Hanafi
  tune?: string; // comma-separated minutes adjustment
}

/**
 * Fetch jadwal sholat untuk 1 hari
 */
export async function fetchPrayerSchedule(
  location: Location,
  date: Date = new Date(),
  options: FetchPrayerOptions = {},
): Promise<PrayerSchedule> {
  const { method = 11, school = 0 } = options; // 11 = KEMENAG RI

  const d = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  const key = cacheKey(d, location.lat, location.lng, method);

  // Check memory cache
  if (scheduleCache.has(key)) {
    return scheduleCache.get(key)!;
  }

  const url = `${ALADHAN_BASE}/timings/${d}?latitude=${location.lat}&longitude=${location.lng}&method=${method}&school=${school}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Aladhan API error: ${res.status}`);
    }

    const json = await res.json();
    if (json.code !== 200 || !json.data) {
      throw new Error("Invalid Aladhan response");
    }

    const data = json.data;
    const schedule: PrayerSchedule = {
      date: d,
      location,
      timings: {
        Fajr: cleanTime(data.timings.Fajr),
        Sunrise: cleanTime(data.timings.Sunrise),
        Dhuhr: cleanTime(data.timings.Dhuhr),
        Asr: cleanTime(data.timings.Asr),
        Sunset: cleanTime(data.timings.Sunset),
        Maghrib: cleanTime(data.timings.Maghrib),
        Isha: cleanTime(data.timings.Isha),
        Imsak: cleanTime(data.timings.Imsak),
        Midnight: cleanTime(data.timings.Midnight),
      },
      hijriDate: {
        date: data.date.hijri.date,
        day: data.date.hijri.day,
        month: {
          number: data.date.hijri.month.number,
          en: data.date.hijri.month.en,
          ar: data.date.hijri.month.ar,
        },
        year: data.date.hijri.year,
      },
      method: data.meta?.method?.name || "Unknown",
    };

    scheduleCache.set(key, schedule);

    // Limit cache to 7 entries
    if (scheduleCache.size > 7) {
      const firstKey = scheduleCache.keys().next().value;
      if (firstKey) scheduleCache.delete(firstKey);
    }

    return schedule;
  } catch (err) {
    clearTimeout(timeout);
    // Fallback: compute locally if API fails
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Request timeout — periksa koneksi internet Anda");
    }
    throw err;
  }
}

/**
 * Cleanup timezone offset (Aladhan returns "04:30 (WIB)" format)
 */
function cleanTime(raw: string): string {
  return raw.split(" ")[0].trim();
}

/**
 * Convert HH:mm to timestamp today
 */
function timeToTimestamp(time: string, baseDate: Date = new Date()): number {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(baseDate);
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

/**
 * Get ordered list of 5 prayer times (exclude Sunrise/Sunset)
 * dengan flag isPast, isNext
 */
export function getPrayerList(schedule: PrayerSchedule, now: Date = new Date()): PrayerTime[] {
  const prayers: Array<{ name: string; nameArabic: string; key: keyof PrayerSchedule["timings"] }> = [
    { name: "Subuh", nameArabic: "الفجر", key: "Fajr" },
    { name: "Dzuhur", nameArabic: "الظهر", key: "Dhuhr" },
    { name: "Ashar", nameArabic: "العصر", key: "Asr" },
    { name: "Maghrib", nameArabic: "المغرب", key: "Maghrib" },
    { name: "Isya", nameArabic: "العشاء", key: "Isha" },
  ];

  const nowMs = now.getTime();

  const result: PrayerTime[] = prayers.map((p) => {
    const t = schedule.timings[p.key];
    return {
      name: p.name,
      nameArabic: p.nameArabic,
      time: t,
      timestamp: timeToTimestamp(t, now),
      isPast: false,
      isNext: false,
    };
  });

  // Mark past & next
  for (let i = 0; i < result.length; i++) {
    if (result[i].timestamp < nowMs) {
      result[i].isPast = true;
    } else {
      // First future prayer is the next one
      if (!result.some((p) => p.isNext)) {
        result[i].isNext = true;
      }
    }
  }

  // If all prayers passed today, next is tomorrow's Fajr
  if (!result.some((p) => p.isNext) && result.length > 0) {
    result[0].isNext = true;
  }

  return result;
}

/**
 * Get next prayer (dengan countdown)
 */
export function getNextPrayer(
  schedule: PrayerSchedule,
  now: Date = new Date(),
): { prayer: PrayerTime; countdownMs: number } | null {
  const list = getPrayerList(schedule, now);
  const next = list.find((p) => p.isNext);
  if (!next) return null;

  // If next is Fajr but all today passed, tomorrow
  const allPast = list.every((p) => p.isPast);
  let countdownMs = next.timestamp - now.getTime();

  if (allPast) {
    // Tomorrow's Fajr
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    countdownMs = timeToTimestamp(schedule.timings.Fajr, tomorrow) - now.getTime();
  }

  return { prayer: next, countdownMs };
}

/**
 * Format countdown: "02:30:15" atau "0d 2h 30m" jika > 1 hari
 */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/**
 * Format Hijri date ke bahasa Indonesia
 */
export function formatHijriId(hijri: PrayerSchedule["hijriDate"]): string {
  const monthId: Record<string, string> = {
    "Muharram": "Muharram",
    "Safar": "Safar",
    "Rabi' al-Awwal": "Rabiul Awal",
    "Rabi' al-Thani": "Rabiul Akhir",
    "Jumada al-Awwal": "Jumadil Awal",
    "Jumada al-Thani": "Jumadil Akhir",
    "Rajab": "Rajab",
    "Sha'ban": "Syaban",
    "Ramadan": "Ramadan",
    "Shawwal": "Syawal",
    "Dhu al-Qi'dah": "Dzulqa'dah",
    "Dhu al-Hijjah": "Dzulhijjah",
  };
  return `${hijri.day} ${monthId[hijri.month.en] || hijri.month.en} ${hijri.year} H`;
}

/**
 * List calculation methods (untuk UI dropdown nanti)
 */
export const PRAYER_METHODS: Array<{ id: number; name: string; region: string }> = [
  { id: 1, name: "University of Islamic Sciences, Karachi", region: "Pakistan" },
  { id: 2, name: "Islamic Society of North America (ISNA)", region: "Amerika Utara" },
  { id: 3, name: "Muslim World League (MWL)", region: "Eropa" },
  { id: 4, name: "Umm al-Qura, Makkah", region: "Arab Saudi" },
  { id: 5, name: "Egyptian General Authority", region: "Mesir" },
  { id: 7, name: "Institute of Geophysics, Tehran", region: "Iran" },
  { id: 8, name: "Gulf Region", region: "Teluk" },
  { id: 9, name: "Kuwait", region: "Kuwait" },
  { id: 10, name: "Qatar", region: "Qatar" },
  { id: 11, name: "Majelis Ulama Indonesia (KEMENAG)", region: "Indonesia" },
  { id: 12, name: "Union Organization Islamic de France", region: "Prancis" },
  { id: 13, name: "Diyanet İşleri Başkanlığı", region: "Turki" },
];