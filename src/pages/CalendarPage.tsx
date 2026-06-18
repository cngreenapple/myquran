import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalIcon,
  Sparkles, Info, Star, Sun, Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useDocumentTitle } from "@/hooks/use-document-title";
import {
  getTodayInfo,
  getDateKey,
  GREGORIAN_MONTH_NAMES,
  GREGORIAN_MONTH_NAMES_SHORT,
  INDONESIAN_WEEKDAYS,
} from "@/lib/date";
import {
  HIJRI_HOLIDAYS,
  isHoliday,
  getUpcomingHolidays,
  type IslamicHoliday,
} from "@/data/hijri-holidays";
import { cn } from "@/lib/utils";

interface CalendarPageProps {
  onMenuClick: () => void;
}

const colorClasses: Record<IslamicHoliday["color"], { bg: string; text: string; ring: string; emoji: string }> = {
  emerald: { bg: "bg-emerald-500/12", text: "text-emerald-700 dark:text-emerald-400", ring: "ring-emerald-500/40", emoji: "🟢" },
  amber: { bg: "bg-amber-500/12", text: "text-amber-700 dark:text-amber-400", ring: "ring-amber-500/40", emoji: "🟡" },
  sky: { bg: "bg-sky-500/12", text: "text-sky-700 dark:text-sky-400", ring: "ring-sky-500/40", emoji: "🔵" },
  rose: { bg: "bg-rose-500/12", text: "text-rose-700 dark:text-rose-400", ring: "ring-rose-500/40", emoji: "🔴" },
  violet: { bg: "bg-violet-500/12", text: "text-violet-700 dark:text-violet-400", ring: "ring-violet-500/40", emoji: "🟣" },
};

export default function CalendarPage({ onMenuClick }: CalendarPageProps) {
  useDocumentTitle("Kalender Islam");

  const today = useMemo(() => new Date(), []);
  const todayInfo = useMemo(() => getTodayInfo(today), [today]);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-11

  const todayKey = getDateKey(today);

  // Build calendar grid: 6 weeks × 7 days
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: Array<{
      key: string;
      day: number;
      monthOffset: number; // -1 prev, 0 current, 1 next
      isToday: boolean;
      isWeekend: boolean;
    }> = [];

    // Previous month tail
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, d);
      cells.push({
        key: getDateKey(prevDate),
        day: d,
        monthOffset: -1,
        isToday: getDateKey(prevDate) === todayKey,
        isWeekend: prevDate.getDay() === 0 || prevDate.getDay() === 6,
      });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dDate = new Date(year, month, d);
      cells.push({
        key: getDateKey(dDate),
        day: d,
        monthOffset: 0,
        isToday: getDateKey(dDate) === todayKey,
        isWeekend: dDate.getDay() === 0 || dDate.getDay() === 6,
      });
    }

    // Next month head
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      cells.push({
        key: getDateKey(nextDate),
        day: d,
        monthOffset: 1,
        isToday: getDateKey(nextDate) === todayKey,
        isWeekend: nextDate.getDay() === 0 || nextDate.getDay() === 6,
      });
    }

    return cells;
  }, [year, month, todayKey]);

  // Map gregorian cells to hijri (full grid, both prev & next)
  const cellHijri = useMemo(() => {
    const map = new Map<string, { day: number; month: number; year: number; monthName: string }>();
    for (const cell of calendarGrid) {
      const [y, m, d] = cell.key.split("-").map(Number);
      const info = getTodayInfo(new Date(y, m - 1, d));
      map.set(cell.key, {
        day: info.hijri.day,
        month: info.hijri.month,
        year: info.hijri.year,
        monthName: info.hijri.monthName,
      });
    }
    return map;
  }, [calendarGrid]);

  // Holidays in this month (both current and adjacent, for visual continuity)
  const monthHolidays = useMemo(() => {
    const result: Array<{ key: string; holiday: IslamicHoliday; cellKey: string }> = [];
    for (const cell of calendarGrid) {
      const h = cellHijri.get(cell.key);
      if (!h) continue;
      const holiday = isHoliday(h.month, h.day);
      if (holiday) {
        result.push({ key: `${cell.key}-${holiday.id}`, holiday, cellKey: cell.key });
      }
    }
    return result;
  }, [calendarGrid, cellHijri]);

  // Holidays in current display month (for legend)
  const currentMonthHolidays = useMemo(() => {
    const seen = new Set<string>();
    const result: IslamicHoliday[] = [];
    for (const cell of calendarGrid) {
      if (cell.monthOffset !== 0) continue;
      const h = cellHijri.get(cell.key);
      if (!h) continue;
      const holiday = isHoliday(h.month, h.day);
      if (holiday && !seen.has(holiday.id)) {
        seen.add(holiday.id);
        result.push(holiday);
      }
    }
    return result;
  }, [calendarGrid, cellHijri]);

  // Upcoming holidays (next 5)
  const upcomingHolidays = useMemo(
    () => getUpcomingHolidays(
      { year: todayInfo.hijri.year, month: todayInfo.hijri.month, day: todayInfo.hijri.day },
      5,
    ),
    [todayInfo],
  );

  const handlePrevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else { setMonth(month - 1); }
  };

  const handleNextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else { setMonth(month + 1); }
  };

  const handleToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); };

  return (
    <div className="min-h-dvh bg-background">
      <Header onMenuClick={onMenuClick} />
      <main className="container mx-auto px-3 py-3 pb-32 md:pb-12 max-w-3xl" aria-labelledby="calendar-title">
        <Button variant="ghost" asChild className="mb-3 -ml-2 rounded-full h-8" size="sm">
          <Link to="/">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            <span className="text-xs">Kembali</span>
          </Link>
        </Button>

        <section className="mb-4">
          <h1 id="calendar-title" className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <CalIcon className="w-6 h-6 text-primary" aria-hidden="true" />
            Kalender Islam
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Konversi Masehi ↔ Hijriah dengan hari besar Islam
          </p>
        </section>

        {/* Today highlight card */}
        <section className="mb-4" aria-label="Hari ini">
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/8 via-primary/3 to-transparent p-4 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-primary/10" aria-hidden="true" />
            <div className="relative">
              <p className="text-[9px] font-bold text-primary uppercase tracking-wider mb-0.5">
                ✨ Hari Ini
              </p>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {INDONESIAN_WEEKDAYS[today.getDay()]}, {today.getDate()} {GREGORIAN_MONTH_NAMES[today.getMonth()]} {today.getFullYear()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {todayInfo.hijri.day} {todayInfo.hijri.monthName} {todayInfo.hijri.year} H
                  </p>
                </div>
                <p
                  className="font-arabic text-2xl sm:text-3xl text-primary leading-none"
                  dir="rtl"
                  lang="ar"
                >
                  {todayInfo.hijri.monthArabic}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Calendar grid */}
        <section className="mb-4" aria-label="Kalender">
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            {/* Month nav */}
            <div className="flex items-center justify-between p-2.5 border-b border-border/60">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                className="h-8 w-8 rounded-full"
                aria-label="Bulan sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </Button>
              <button
                onClick={handleToday}
                className="text-sm font-bold text-foreground hover:text-primary transition-colors px-3 py-1 rounded-lg"
                aria-label="Lompat ke hari ini"
              >
                {GREGORIAN_MONTH_NAMES[month]} {year}
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                className="h-8 w-8 rounded-full"
                aria-label="Bulan berikutnya"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>

            {/* Weekday header */}
            <div className="grid grid-cols-7 border-b border-border/60 bg-muted/30" role="row">
              {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((w) => (
                <div
                  key={w}
                  className="text-center py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  {w}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7" role="grid" aria-label={`${GREGORIAN_MONTH_NAMES[month]} ${year}`}>
              {calendarGrid.map((cell) => {
                const hijri = cellHijri.get(cell.key);
                const holiday = hijri ? isHoliday(hijri.month, hijri.day) : undefined;
                const isCurrentMonth = cell.monthOffset === 0;
                const showHijriLabel = hijri ? hijri.day === 1 || cell.day === 1 || holiday : false;
                const c = holiday ? colorClasses[holiday.color] : null;

                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => {
                      // No-op for now; bisa link ke detail nanti
                    }}
                    className={cn(
                      "relative aspect-square border-r border-b border-border/40 last:border-r-0 flex flex-col items-center justify-start pt-1.5 px-0.5 transition-colors",
                      "hover:bg-muted/60 focus:outline-none focus-visible:bg-primary/10 focus-visible:ring-1 focus-visible:ring-primary/50",
                      !isCurrentMonth && "opacity-35",
                      cell.isToday && "ring-2 ring-primary ring-inset bg-primary/5 z-10",
                      cell.isWeekend && isCurrentMonth && !cell.isToday && "bg-muted/20",
                      c && c.bg,
                    )}
                    aria-label={`${cell.day} ${GREGORIAN_MONTH_NAMES[month]} ${year}${holiday ? `, ${holiday.name}` : ""}`}
                    aria-current={cell.isToday ? "date" : undefined}
                  >
                    {cell.isToday ? (
                      <span className="text-[11px] sm:text-xs font-bold text-primary tabular-nums leading-none">
                        {cell.day}
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "text-[11px] sm:text-xs tabular-nums leading-none font-medium",
                          holiday ? c?.text : cell.isWeekend && isCurrentMonth ? "text-rose-600 dark:text-rose-400" : "text-foreground",
                        )}
                      >
                        {cell.day}
                      </span>
                    )}
                    {hijri && (
                      <span
                        className={cn(
                          "text-[8px] sm:text-[9px] tabular-nums leading-none mt-0.5 truncate max-w-full px-0.5",
                          cell.isToday ? "text-primary font-bold" : "text-muted-foreground",
                          hijri.month !== todayInfo.hijri.month && isCurrentMonth && "opacity-50",
                        )}
                        dir="rtl"
                      >
                        {hijri.day}
                      </span>
                    )}
                    {holiday && (
                      <span
                        className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs leading-none"
                        aria-hidden="true"
                        title={holiday.name}
                      >
                        {holiday.emoji}
                      </span>
                    )}
                    {showHijriLabel && hijri && (
                      <span className="hidden">
                        {hijri.monthName}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Legend: holidays in this month */}
        {currentMonthHolidays.length > 0 && (
          <section className="mb-4" aria-label="Hari besar di bulan ini">
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" aria-hidden="true" />
              Hari Besar Bulan Ini
            </h2>
            <ul className="space-y-2" role="list">
              {currentMonthHolidays.map((h) => {
                const c = colorClasses[h.color];
                return (
                  <li key={h.id}>
                    <div className={cn("rounded-2xl border p-3", c.bg, "border-border/60")}>
                      <div className="flex items-start gap-2.5">
                        <div className="shrink-0 w-9 h-9 rounded-xl bg-card flex items-center justify-center text-lg border border-border/60">
                          {h.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-foreground leading-tight">{h.name}</h3>
                          <p
                            className="font-arabic text-xs text-muted-foreground"
                            dir="rtl"
                            lang="ar"
                          >
                            {h.arabicName}
                          </p>
                          <p className="text-[11px] text-foreground/85 leading-relaxed mt-1.5">
                            {h.description}
                          </p>
                          {h.note && (
                            <p className="text-[10px] text-muted-foreground italic mt-1.5 flex items-start gap-1">
                              <Info className="w-2.5 h-2.5 shrink-0 mt-0.5" aria-hidden="true" />
                              <span>{h.note}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Upcoming holidays (Hijri-aware) */}
        <section className="mb-4" aria-label="Hari besar akan datang">
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
            <Star className="w-3 h-3" aria-hidden="true" />
            Mendatang
          </h2>
          <ul className="space-y-1.5" role="list">
            {upcomingHolidays.map((u) => {
              const c = colorClasses[u.holiday.color];
              const isToday = u.daysUntil === 0;
              const isSoon = u.daysUntil > 0 && u.daysUntil <= 7;
              return (
                <li key={`${u.holiday.id}-${u.hijriLabel}`}>
                  <div
                    className={cn(
                      "flex items-center gap-2.5 p-2.5 rounded-xl border transition-all",
                      c.bg,
                      isToday && "ring-2 ring-primary/50",
                      isSoon && "border-primary/40",
                    )}
                  >
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-card flex items-center justify-center text-base border border-border/60">
                      {u.holiday.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {u.holiday.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {u.hijriLabel} • {u.gregorianDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {isToday ? (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-primary">
                          Hari ini
                        </span>
                      ) : u.daysUntil > 0 ? (
                        <>
                          <p className="text-sm font-bold text-foreground tabular-nums leading-none">
                            {u.daysUntil}
                          </p>
                          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">
                            hari lagi
                          </p>
                        </>
                      ) : (
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                          Lewat
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Note */}
        <div className="p-3 rounded-2xl bg-muted/40 border border-border/40 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold text-foreground mb-0.5">Catatan</p>
            <p>
              Konversi kalender menggunakan algoritma tabular (Kuwati/civil). Selisih ±1-2 hari dengan metode observasi (Umm al-Qura). Penetapan awal Ramadan, Idul Fitri, dan Idul Adha tetap mengikuti keputusan resmi Kemenag.
            </p>
          </div>
        </div>
      </main>
      <AudioPlayer />
    </div>
  );
}