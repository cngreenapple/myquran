import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CalendarDay } from "@/types/hijri-calendar";

interface HijriCalendarProps {
  year: number;
  month: number;
  days: CalendarDay[];
  onPrev: () => void;
  onNext: () => void;
}

const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const WEEKDAYS_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const HIJRI_MONTH_NAMES = ["Muharram", "Safar", "Rabiul Awal", "Rabiul Akhir", "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban", "Ramadan", "Syawal", "Dzulqa'dah", "Dzulhijjah"];
const HIJRI_MONTH_SHORT = ["Muh", "Saf", "Rab1", "Rab2", "Jum1", "Jum2", "Raj", "Sya", "Ram", "Syw", "Dhuq", "Dhuh"];

const HOLIDAY_STYLES: Record<string, { bg: string; text: string; ring: string }> = {
  emerald: { bg: "bg-emerald-500/15", text: "text-emerald-700 dark:text-emerald-300", ring: "ring-emerald-500/40" },
  amber: { bg: "bg-amber-500/15", text: "text-amber-700 dark:text-amber-300", ring: "ring-amber-500/40" },
  rose: { bg: "bg-rose-500/15", text: "text-rose-700 dark:text-rose-300", ring: "ring-rose-500/40" },
  sky: { bg: "bg-sky-500/15", text: "text-sky-700 dark:text-sky-300", ring: "ring-sky-500/40" },
  violet: { bg: "bg-violet-500/15", text: "text-violet-700 dark:text-violet-300", ring: "ring-violet-500/40" },
};
const PUASA_BAR: Record<string, string> = { emerald: "bg-emerald-500", amber: "bg-amber-500", sky: "bg-sky-500", rose: "bg-rose-500", violet: "bg-violet-500" };

function holidayShortName(name: string): string {
  return name
    .replace(/Hari Raya /, "HR ")
    .replace(/Tahun Baru /, "TB ")
    .replace(/Maulid Nabi Muhammad ﷺ/, "Maulid Nabi")
    .replace(/Isra' & Mi'raj/, "Isra Mi'raj")
    .replace(/Nuzulul Qur'an/, "Nuzul Quran")
    .replace(/Malam Lailatul Qadar/, "Lailatul Qadar")
    .replace(/Hari Arafah/, "Arafah");
}

function puasaShortName(puasa: { title: string; note?: string }): string {
  if (puasa.note === "Puasa Senin") return "Senin";
  if (puasa.note === "Puasa Kamis") return "Kamis";
  if (puasa.title === "Puasa Ayyamul Bidh") return "Ayyamul Bidh";
  if (puasa.title === "Puasa Arafah") return "Arafah";
  if (puasa.title === "Puasa Asyura") return "Asyura";
  if (puasa.title === "Puasa Tasu'a") return "Tasu'a";
  if (puasa.title === "Puasa 9 Hari Pertama Dzulhijjah") return "Awal Dzulhijjah";
  if (puasa.title === "Puasa 6 Hari di Bulan Syawal") return "Syawal";
  if (puasa.title === "Puasa Senin & Kamis") return "";
  return puasa.title.length > 14 ? puasa.title.slice(0, 12) + "…" : puasa.title;
}

export function HijriCalendar({ year, month, days, onPrev, onNext }: HijriCalendarProps) {
  const firstDayOfWeek = useMemo(() => new Date(year, month, 1).getDay(), [year, month]);
  const cells: (CalendarDay | null)[] = useMemo(
    () => [...Array(firstDayOfWeek).fill(null), ...days].concat(
      Array(Math.max(0, 42 - firstDayOfWeek - days.length)).fill(null)
    ),
    [firstDayOfWeek, days]
  );

  const hijriMonthInfo = useMemo(() => {
    if (days.length === 0) return { month: 1, year: 0 };
    const monthCounts: Record<number, number> = {};
    const yearByMonth: Record<number, Set<number>> = {};
    for (const d of days) {
      monthCounts[d.hijri.month] = (monthCounts[d.hijri.month] || 0) + 1;
      if (!yearByMonth[d.hijri.month]) yearByMonth[d.hijri.month] = new Set();
      yearByMonth[d.hijri.month].add(d.hijri.year);
    }
    let majorityMonth = days[0].hijri.month;
    let maxCount = 0;
    for (const [m, c] of Object.entries(monthCounts)) {
      if (c > maxCount) { maxCount = c; majorityMonth = Number(m); }
    }
    const years = yearByMonth[majorityMonth] || new Set();
    const hijriYear = years.size > 0 ? Array.from(years).sort()[0] : 0;
    return { month: majorityMonth, year: hijriYear };
  }, [days]);

  const holidayCount = days.filter((d) => d.holidays.length > 0).length;
  const puasaCount = days.reduce((s, d) => s + d.puasaSunnah.length, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Button variant="ghost" size="icon" onClick={onPrev} className="rounded-full" aria-label="Bulan sebelumnya">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="text-center px-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground leading-tight">{MONTH_NAMES[month]} {year}</h2>
          {hijriMonthInfo.year > 0 && (
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{HIJRI_MONTH_NAMES[hijriMonthInfo.month - 1]} {hijriMonthInfo.year} H</p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onNext} className="rounded-full" aria-label="Bulan berikutnya">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS_SHORT.map((wd) => (
          <div key={wd} className={cn("text-center text-[10px] font-bold uppercase tracking-wider py-1", wd === "Jum" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
            {wd}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className="min-h-[90px] sm:min-h-[100px]" aria-hidden="true" />;

          const hasHoliday = day.holidays.length > 0;
          const hasPuasa = day.puasaSunnah.length > 0;
          const holiday = hasHoliday ? day.holidays[0] : null;
          const puasa = hasPuasa ? day.puasaSunnah[0] : null;

          const containerClass = day.isToday
            ? "bg-gradient-to-br from-primary to-emerald-700 text-primary-foreground shadow-md shadow-primary/30 ring-2 ring-primary/50"
            : hasHoliday
              ? cn(HOLIDAY_STYLES[holiday!.color].bg, HOLIDAY_STYLES[holiday!.color].text, "ring-1", HOLIDAY_STYLES[holiday!.color].ring)
              : day.isJumat
                ? "bg-emerald-50/70 dark:bg-emerald-950/25 text-foreground"
                : day.isWeekend
                  ? "bg-muted/40 text-muted-foreground"
                  : "bg-card border border-border/40 text-foreground";

          const holidayLabel = holiday ? holidayShortName(holiday.name) : "";
          const puasaLabel = puasa ? puasaShortName(puasa) : "";

          return (
            <div
              key={day.gregorian.date.toISOString()}
              className={cn(
                "relative min-h-[90px] sm:min-h-[100px] rounded-xl p-1.5",
                "flex flex-col cursor-pointer transition-all duration-150",
                "hover:scale-[1.04] hover:shadow-md active:scale-[0.97] overflow-hidden",
                containerClass,
              )}
              title={[
                `${day.gregorian.weekday}, ${day.gregorian.day} ${MONTH_NAMES[day.gregorian.month - 1]} ${day.gregorian.year}`,
                `${day.hijri.day} ${day.hijri.monthName} ${day.hijri.year} H`,
                hasHoliday ? `🎉 ${holiday!.name}` : "",
                hasPuasa ? `${puasa!.emoji} ${puasa!.title}` : "",
              ].filter(Boolean).join("\n")}
              aria-label={[
                day.gregorian.weekday,
                day.gregorian.day,
                MONTH_NAMES[day.gregorian.month - 1],
                day.gregorian.year,
                `${day.hijri.day} ${HIJRI_MONTH_NAMES[day.hijri.month - 1]} ${day.hijri.year} H`,
                hasHoliday ? holiday!.name : "",
                hasPuasa ? `Puasa: ${puasa!.title}` : "",
                day.isJumat ? "Jumat" : "",
                day.isToday ? "hari ini" : "",
              ].filter(Boolean).join(", ")}
            >
              {/* Baris 1: hari pendek + emoji holiday */}
              <div className="flex items-center justify-between leading-none">
                <span className={cn("text-[9px] font-bold uppercase tracking-wide", day.isJumat && !day.isToday ? "text-emerald-700 dark:text-emerald-400" : "opacity-60", day.isToday && "opacity-100")}>
                  {WEEKDAYS_SHORT[day.gregorian.date.getDay()]}
                </span>
                {hasHoliday && <span className="text-[10px] leading-none">{holiday!.emoji}</span>}
              </div>

              {/* Baris 2: tanggal Gregorian (besar) */}
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-bold leading-none tabular-nums">
                  {day.gregorian.day}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold leading-none opacity-50 tabular-nums">
                  {day.hijri.day}
                </span>
              </div>

              {/* Baris 3: label holiday/puasa (atau spacer) */}
              <div className="mt-auto text-center text-[8px] sm:text-[9px] font-semibold leading-tight line-clamp-2 min-h-[14px]">
                {holidayLabel && <div className="truncate">{holidayLabel}</div>}
                {!holidayLabel && puasaLabel && <div className="truncate opacity-80">{puasaLabel}</div>}
                {day.puasaSunnah.length > 1 && (
                  <div className="text-[7px] opacity-60">+{day.puasaSunnah.length - 1}</div>
                )}
              </div>

              {/* Vertical accent bar untuk puasa saja (bukan holiday) */}
              {hasPuasa && !hasHoliday && (
                <div className={cn("absolute right-0 top-2 bottom-2 w-1 rounded-l-full", PUASA_BAR[puasa!.color] || "bg-violet-500")} aria-hidden="true" />
              )}
            </div>
          );
        })}
      </div>

      {/* Caption ringkas */}
      <p className="mt-3 text-center text-[10px] text-muted-foreground">
        {HIJRI_MONTH_SHORT[hijriMonthInfo.month - 1]} {hijriMonthInfo.year} H • Hari besar: <span className="font-semibold text-foreground">{holidayCount}</span> • Puasa: <span className="font-semibold text-foreground">{puasaCount}</span>
      </p>
    </div>
  );
}