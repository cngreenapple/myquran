import type { ColorVariant } from "@/types/quran";

export type HolidayType = "date" | "range" | "observasi";

export interface IslamicHoliday {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  type: HolidayType;
  /** Hijri month (1-12) */
  month: number;
  /** Hijri day (for type: date) or start day (for type: range) */
  day: number;
  /** For type: range — end day in same month */
  endDay?: number;
  emoji: string;
  color: ColorVariant;
  /** For type: observasi — note about variance */
  note?: string;
}

export const HIJRI_HOLIDAYS: IslamicHoliday[] = [
  {
    id: "islamic-new-year",
    name: "Tahun Baru Islam",
    arabicName: "رأس السنة الهجرية",
    description: "Peringatan 1 Muharram, awal tahun dalam kalender Hijriah. Momentum untuk muhasabah dan resolusi kebaikan.",
    type: "date",
    month: 1,
    day: 1,
    emoji: "🌙",
    color: "emerald",
  },
  {
    id: "ashura",
    name: "Puasa Asyura",
    arabicName: "صيام عاشوراء",
    description: "Puasa sunnah pada tanggal 10 Muharram. Dianjurkan juga berpuasa tanggal 9 (Tasu'a) untuk menyelisihi Ahli Kitab.",
    type: "date",
    month: 1,
    day: 10,
    emoji: "🤲",
    color: "emerald",
    note: "Disunnahkan berpuasa 9-10 Muharram",
  },
  {
    id: "maulid-nabi",
    name: "Maulid Nabi Muhammad ﷺ",
    arabicName: "المولد النبوي",
    description: "Peringatan kelahiran Nabi Muhammad ﷺ pada 12 Rabi'ul Awal. Momentum untuk bershalawat dan meneladani akhlak Rasulullah.",
    type: "date",
    month: 3,
    day: 12,
    emoji: "🌹",
    color: "rose",
  },
  {
    id: "isra-miraj",
    name: "Isra & Mi'raj",
    arabicName: "الإسراء والمعراج",
    description: "Peringatan perjalanan Nabi ﷺ dari Masjidil Haram ke Masjidil Aqsha, lalu naik ke langit ketujuh. Di sinilah perintah shalat 5 waktu diturunkan.",
    type: "date",
    month: 7,
    day: 27,
    emoji: "✨",
    color: "violet",
  },
  {
    id: "nisfu-syaban",
    name: "Nisfu Sya'ban",
    arabicName: "ليلة النصف من شعبان",
    description: "Malam pertengahan bulan Sya'ban. Dianjurkan memperbanyak doa, dzikir, dan istighfar.",
    type: "date",
    month: 8,
    day: 15,
    emoji: "🌃",
    color: "sky",
  },
  {
    id: "ramadan-start",
    name: "Awal Ramadan",
    arabicName: "بداية رمضان",
    description: "Bulan Ramadan — bulan penuh berkah, ampunan, dan rahmat. Puasa wajib bagi setiap Muslim yang mampu.",
    type: "observasi",
    month: 9,
    day: 1,
    emoji: "🌙",
    color: "emerald",
    note: "Tergantung pengamatan hilal & keputusan Kemenag",
  },
  {
    id: "laylatul-qadr",
    name: "Malam Lailatul Qadar",
    arabicName: "ليلة القدر",
    description: "Malam yang lebih baik dari 1000 bulan. Dianjurkan menghidupkan 10 hari terakhir Ramadan dengan dzikir, doa, dan Al-Qur'an.",
    type: "range",
    month: 9,
    day: 21,
    endDay: 29,
    emoji: "⭐",
    color: "amber",
    note: "Malam ghaib — biasanya jatuh di 10 malam ganjil terakhir",
  },
  {
    id: "eid-fitr",
    name: "Hari Raya Idul Fitri",
    arabicName: "عيد الفطر",
    description: "Hari kemenangan setelah sebulan berpuasa. Disunnahkan takbir, tahmid, dan tahlil sebelum shalat Ied.",
    type: "observasi",
    month: 10,
    day: 1,
    emoji: "🎉",
    color: "emerald",
    note: "Tergantung pengamatan hilal",
  },
  {
    id: "syawal-puasa",
    name: "Puasa 6 Hari Syawal",
    arabicName: "صيام ست من شوال",
    description: "Puasa sunnah 6 hari di bulan Syawal. Dianjurkan setelah Idul Fitri, boleh tidak berturut-turut.",
    type: "range",
    month: 10,
    day: 2,
    endDay: 7,
    emoji: "🌅",
    color: "amber",
  },
  {
    id: "arafah-puasa",
    name: "Puasa Arafah",
    arabicName: "صيام يوم عرفة",
    description: "Puasa pada 9 Dzulhijjah (bagi yang tidak menunaikan haji). Menghapuskan dosa 2 tahun.",
    type: "date",
    month: 12,
    day: 9,
    emoji: "🕋",
    color: "amber",
  },
  {
    id: "eid-adha",
    name: "Hari Raya Idul Adha",
    arabicName: "عيد الأضحى",
    description: "Hari raya haji dan kurban. Momentum untuk berkurban, dzikir, dan meneladani ketaatan Nabi Ibrahim AS.",
    type: "observasi",
    month: 12,
    day: 10,
    emoji: "🐑",
    color: "rose",
    note: "Tergantung pengamatan hilal",
  },
  {
    id: "tasyrik-days",
    name: "Hari Tasyrik",
    arabicName: "أيام التشريق",
    description: "Tiga hari setelah Idul Adha (11-13 Dzulhijjah). Disunnahkan memperbanyak dzikir, takbir, dan tahmid.",
    type: "range",
    month: 12,
    day: 11,
    endDay: 13,
    emoji: "🌾",
    color: "amber",
  },
];

export function getHolidaysForMonth(month: number): IslamicHoliday[] {
  return HIJRI_HOLIDAYS.filter((h) => h.month === month);
}

export function isHoliday(month: number, day: number): IslamicHoliday | undefined {
  return HIJRI_HOLIDAYS.find(
    (h) =>
      h.month === month &&
      (h.type === "date"
        ? h.day === day
        : h.type === "range"
          ? day >= h.day && day <= (h.endDay ?? h.day)
          : h.day === day),
  );
}

export interface UpcomingHoliday {
  holiday: IslamicHoliday;
  /** Hijri date label, e.g. "15 Sya'ban 1446 H" */
  hijriLabel: string;
  /** Gregorian date */
  gregorianDate: Date;
  /** Days until (can be negative if past) */
  daysUntil: number;
}

export function getUpcomingHolidays(
  currentHijri: { year: number; month: number; day: number },
  count = 6,
): UpcomingHoliday[] {
  // Use the same jdnToHijri / gregorianToJDN algorithm from lib/date
  // for accurate conversion. We import locally to avoid circular deps.
  const events: Array<{ holiday: IslamicHoliday; hijriYear: number }> = [];
  for (const h of HIJRI_HOLIDAYS) {
    events.push({ holiday: h, hijriYear: currentHijri.year });
    // If event already passed this year, queue for next year
    if (
      h.month < currentHijri.month ||
      (h.month === currentHijri.month && h.day < currentHijri.day)
    ) {
      events.push({ holiday: h, hijriYear: currentHijri.year + 1 });
    }
  }

  // Convert each to gregorian and sort by date
  const todayJdn = gregorianToJDN(new Date());
  const mapped = events.map((e) => {
    const jdn = hijriDateToJDN(e.hijriYear, e.holiday.month, e.holiday.day);
    const gregorian = jdnToGregorian(jdn);
    return {
      holiday: e.holiday,
      hijriLabel: `${e.holiday.day} ${HIJRI_MONTHS[e.holiday.month - 1]} ${e.hijriYear} H`,
      gregorianDate: gregorian,
      daysUntil: jdn - todayJdn,
    };
  });

  return mapped
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, count);
}

// --- Hijri <-> Gregorian conversion (mirror of lib/date.ts) ---

const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah",
];

function isHijriLeapYear(year: number): boolean {
  const r = year % 30;
  return [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29].includes(r);
}

function getHijriMonthLengths(year: number): number[] {
  return isHijriLeapYear(year)
    ? [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 30]
    : [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
}

function gregorianToJDN(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function hijriYearToJDN(year: number): number {
  return 1948440 + Math.floor((10631 * year - 10646) / 30);
}

function hijriDateToJDN(year: number, month: number, day: number): number {
  const start = hijriYearToJDN(year);
  const monthLengths = getHijriMonthLengths(year);
  let dayOfYear = day;
  for (let i = 0; i < month - 1; i++) {
    dayOfYear += monthLengths[i];
  }
  return start + dayOfYear - 1;
}

function jdnToGregorian(jdn: number): Date {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 1461);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = b * 100 + d - 4800 + Math.floor(m / 10);
  return new Date(year, month - 1, day);
}