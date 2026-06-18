import { useQuery } from "@tanstack/react-query";
import { ISLAMIC_HOLIDAYS, HIJRI_MONTHS, WEEKDAYS_ID } from "@/data/islamic-holidays";
import { getPuasaSunnahForDate } from "@/data/puasa-sunnah-dates";
import type { CalendarDay } from "@/types/hijri-calendar";

interface AladhanCalendarDay {
  gregorian: {
    date: string;
    day: string;
    month: { number: number; en: string };
    year: string;
    weekday: { en: string };
  };
  hijri: {
    date: string;
    day: string;
    month: { number: number; en: string; ar: string };
    year: string;
    weekday: { en: string; ar: string };
  };
}

interface AladhanCalendarResponse {
  code: number;
  status: string;
  data: AladhanCalendarDay[];
}

/**
 * Fetch data kalender Hijriah untuk 1 bulan Gregorian dari Aladhan API.
 *
 * Endpoint: GET https://api.aladhan.com/v1/calendar/{year}/{month}
 *
 * Returns array hari dengan data lengkap (gregorian + hijri), kemudian kita
 * enrich dengan metadata lokal: holidays, puasa sunnah, flags today/weekend/jumat.
 *
 * Mengapa pakai Aladhan:
 * - Reliable, proven, no API key required
 * - Akurasi tinggi (Umm al-Qura + other methods available)
 * - Gratis, rate limit reasonable
 *
 * Strategy fallback: jika Aladhan down, return local calculation via getMonthCalendar()
 */
export async function fetchHijriMonthFromAladhan(
  gYear: number,
  gMonth: number,
): Promise<CalendarDay[]> {
  // calendarMethod=UAQ → Umm al-Qura (standar Saudi, umum dipakai)
  const url = `https://api.aladhan.com/v1/calendar/${gYear}/${gMonth}?calendarMethod=UAQ`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Aladhan calendar API: ${res.status}`);
    const json = (await res.json()) as AladhanCalendarResponse;

    if (!json.data || !Array.isArray(json.data)) {
      throw new Error("Invalid Aladhan calendar response");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return json.data.map((entry, idx) => {
      const gregDate = new Date(gYear, gMonth - 1, idx + 1);
      gregDate.setHours(0, 0, 0, 0);
      const weekday = gregDate.getDay();

      // Parse Hijri values safely (Aladhan returns as strings, sometimes with leading zeros)
      const hijriDay = parseInt(entry.hijri.day, 10) || 1;
      const hijriMonth = entry.hijri.month.number || 1;
      const hijriYear = parseInt(entry.hijri.year, 10) || 1446;

      const monthInfo = HIJRI_MONTHS.find((m) => m.number === hijriMonth);

      // Find holidays on this Hijri date
      const holidays = ISLAMIC_HOLIDAYS.filter(
        (h) => h.type === "fixed" && h.hijriDay === hijriDay && h.hijriMonth === hijriMonth,
      );

      // Find puasa sunnah markers (Senin/Kamis, Ayyamul Bidh, etc)
      const puasaList = getPuasaSunnahForDate(hijriDay, hijriMonth, weekday);
      const puasaSunnah = puasaList.map(({ puasa, note, isRecurring }) => ({
        id: puasa.id,
        title: puasa.title,
        emoji: puasa.emoji,
        color: puasa.color,
        note,
        isRecurring,
      }));

      return {
        gregorian: {
          date: gregDate,
          day: idx + 1,
          month: gMonth,
          year: gYear,
          weekday: WEEKDAYS_ID[weekday],
        },
        hijri: {
          day: hijriDay,
          month: hijriMonth,
          year: hijriYear,
          monthName: monthInfo?.name || entry.hijri.month.en || "",
          monthArabic: monthInfo?.nameArabic || entry.hijri.month.ar || "",
        },
        isToday: gregDate.getTime() === today.getTime(),
        isWeekend: weekday === 0 || weekday === 6,
        isJumat: weekday === 5,
        holidays,
        puasaSunnah,
      };
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Request timeout — periksa koneksi internet Anda");
    }
    throw err;
  }
}

/**
 * React Query hook untuk fetch kalender Hijriah per bulan.
 *
 * staleTime 24 jam — tanggal Hijriah tidak berubah dalam 1 hari, jadi cache agresif OK.
 * gcTime 7 hari — keep cached data supaya navigasi balik instant.
 */
export function useHijriCalendar(gYear: number, gMonth: number) {
  return useQuery({
    queryKey: ["hijri-calendar", gYear, gMonth],
    queryFn: () => fetchHijriMonthFromAladhan(gYear, gMonth),
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}