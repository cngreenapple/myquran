import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Calendar, ChevronRight, Sparkles, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getTodayInfo, GREGORIAN_MONTH_NAMES } from "@/lib/date";
import { ISLAMIC_HOLIDAYS, type IslamicHoliday, getHolidayOnDate, HOLIDAY_TYPE_LABELS } from "@/data/islamic-holidays";
import { cn } from "@/lib/utils";

function daysUntilNextHoliday(now: Date): { holiday: IslamicHoliday; days: number } | null {
  // Compute current Hijri date
  const info = getTodayInfo(now);
  const todayMonth = info.hijri.month;
  const todayDay = info.hijri.day;

  // Cari hari besar yang akan datang (termasuk hari ini)
  const all = ISLAMIC_HOLIDAYS.map((h) => {
    let days = 0;
    if (h.hijriMonth > todayMonth) {
      // Bulan masih di depan tahun ini
      days = (h.hijriMonth - todayMonth) * 30 + (h.hijriDay - todayDay);
    } else if (h.hijriMonth === todayMonth && h.hijriDay >= todayDay) {
      // Bulan sama, hari belum lewat
      days = h.hijriDay - todayDay;
    } else {
      // Sudah lewat, hitung ke tahun depan
      const remainingInYear = (12 - todayMonth) * 30 + (30 - todayDay);
      const fullYear = 354; // 1 tahun Hijriah
      days = remainingInYear + (h.hijriMonth - 1) * 30 + h.hijriDay - 30;
      // Approximation: gunakan selisih bulan + hari
      days = (12 - todayMonth) * 30 + (h.hijriMonth - 1) * 30 + (h.hijriDay - todayDay);
      // Fix untuk negative day
      if (days < 0) days += 354;
    }
    return { holiday: h, days };
  });

  // Sort by days ascending, exclude negative (already passed this year)
  const upcoming = all.filter((x) => x.days >= 0).sort((a, b) => a.days - b.days);
  return upcoming[0] || null;
}

function getUpcomingHolidays(limit = 3): Array<{ holiday: IslamicHoliday; days: number }> {
  const now = new Date();
  const all = ISLAMIC_HOLIDAYS.map((h) => {
    const info = getTodayInfo(now);
    const todayMonth = info.hijri.month;
    const todayDay = info.hijri.day;

    let days: number;
    if (h.hijriMonth > todayMonth) {
      days = (h.hijriMonth - todayMonth) * 30 + (h.hijriDay - todayDay);
    } else if (h.hijriMonth === todayMonth && h.hijriDay >= todayDay) {
      days = h.hijriDay - todayDay;
    } else {
      // Tahun depan
      const monthDiff = 12 - todayMonth + h.hijriMonth;
      const dayDiff = h.hijriDay - todayDay;
      days = monthDiff * 30 + dayDiff;
    }
    return { holiday: h, days };
  });
  return all.filter((x) => x.days >= 0).sort((a, b) => a.days - b.days).slice(0, limit);
}

const colorClasses: Record<IslamicHoliday["color"], { bg: string; text: string; emojiBg: string; ring: string }> = {
  emerald: { bg: "bg-emerald-500/8", text: "text-emerald-700 dark:text-emerald-400", emojiBg: "bg-emerald-500/15", ring: "ring-emerald-500/30" },
  amber: { bg: "bg-amber-500/8", text: "text-amber-700 dark:text-amber-400", emojiBg: "bg-amber-500/15", ring: "ring-amber-500/30" },
  rose: { bg: "bg-rose-500/8", text: "text-rose-700 dark:text-rose-400", emojiBg: "bg-rose-500/15", ring: "ring-rose-500/30" },
  sky: { bg: "bg-sky-500/8", text: "text-sky-700 dark:text-sky-400", emojiBg: "bg-sky-500/15", ring: "ring-sky-500/30" },
  violet: { bg: "bg-violet-500/8", text: "text-violet-700 dark:text-violet-400", emojiBg: "bg-violet-500/15", ring: "ring-violet-500/30" },
};

export function IslamicCalendarCard() {
  const todayInfo = useMemo(() => getTodayInfo(), []);
  const upcoming = useMemo(() => getUpcomingHolidays(3), []);
  const todayHoliday = useMemo(
    () => getHolidayOnDate(todayInfo.hijri.month, todayInfo.hijri.day),
    [todayInfo.hijri.month, todayInfo.hijri.day],
  );

  return (
    <Link
      to="/kalender"
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
    >
      <Card className="overflow-hidden border-violet-500/25 bg-gradient-to-r from-violet-500/8 via-violet-500/3 to-transparent hover:border-violet-500/40 transition-all active:scale-[0.99]">
        <CardContent className="p-3.5 relative">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Calendar className="w-2.5 h-2.5 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-[9px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                Kalender Islam
              </p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2.5">
            {/* Hijriah */}
            <div className="px-2.5 py-2 rounded-xl bg-card/60 border border-border/40">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                {todayInfo.hijri.monthName} H
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-foreground tabular-nums leading-none">
                  {todayInfo.hijri.day}
                </span>
                <span className="text-[9px] text-muted-foreground font-medium">
                  {todayInfo.hijri.year} H
                </span>
              </div>
            </div>
            {/* Masehi */}
            <div className="px-2.5 py-2 rounded-xl bg-card/60 border border-border/40">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                {GREGORIAN_MONTH_NAMES[todayInfo.gregorian.month - 1]}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-foreground tabular-nums leading-none">
                  {todayInfo.gregorian.day}
                </span>
                <span className="text-[9px] text-muted-foreground font-medium">
                  {todayInfo.gregorian.year}
                </span>
              </div>
            </div>
          </div>

          {/* Today is a holiday? */}
          {todayHoliday && (
            <div className={cn("flex items-center gap-2 px-2.5 py-2 rounded-xl", colorClasses[todayHoliday.color].bg, "ring-1", colorClasses[todayHoliday.color].ring)}>
              <span className="text-base" aria-hidden="true">{todayHoliday.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={cn("text-[10px] font-bold leading-tight", colorClasses[todayHoliday.color].text)}>
                  HARI INI
                </p>
                <p className="text-[11px] font-semibold text-foreground truncate leading-tight">
                  {todayHoliday.name}
                </p>
              </div>
              <Sparkles className={cn("w-3.5 h-3.5 shrink-0", colorClasses[todayHoliday.color].text)} aria-hidden="true" />
            </div>
          )}

          {/* Upcoming holidays list */}
          {!todayHoliday && upcoming.length > 0 && (
            <div className="space-y-1.5">
              {upcoming.slice(0, 2).map(({ holiday, days }) => {
                const c = colorClasses[holiday.color];
                return (
                  <div key={holiday.id} className="flex items-center gap-2">
                    <span className="text-sm shrink-0" aria-hidden="true">{holiday.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-foreground truncate leading-tight">
                        {holiday.name}
                      </p>
                    </div>
                    <span className={cn("text-[9px] font-bold tabular-nums shrink-0", c.text)}>
                      {days === 0 ? "Hari ini" : days === 1 ? "Besok" : `${days} hari`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}