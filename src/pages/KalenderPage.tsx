import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useDocumentTitle } from "@/hooks/use-document-title";
import {
  getTodayInfo,
  GREGORIAN_MONTH_NAMES,
  INDONESIAN_WEEKDAYS_SHORT,
  gregorianToJDN,
  jdnToHijri,
} from "@/lib/date";
import {
  ISLAMIC_HOLIDAYS,
  type IslamicHoliday,
  type HolidayType,
  HOLIDAY_TYPE_LABELS,
  getHolidayOnDate,
} from "@/data/islamic-holidays";
import { cn } from "@/lib/utils";

interface KalenderPageProps {
  onMenuClick: () => void;
}

const HIJRI_MONTH_NAMES_ID: Record<number, string> = {
  1: "Muharram", 2: "Safar", 3: "Rabi'ul Awal", 4: "Rabi'ul Akhir",
  5: "Jumadil Awal", 6: "Jumadil Akhir", 7: "Rajab", 8: "Syaban",
  9: "Ramadan", 10: "Syawal", 11: "Dzulka'dah", 12: "Dzulhijjah",
};

// --- Calendar grid: angka saja (Hijriah & Masehi side-by-side) ---

function gregorianMonthInfo(year: number, month: number) {
  // month: 0-11 (JS Date convention)
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();
  return { daysInMonth, startWeekday };
}

function getHijriMonthInfo(hijriYear: number, hijriMonth: number) {
  // 1 Muharram year Y → JDN = 1948440 + floor((10631*Y - 10646) / 30)
  const yearStartJDN = 1948440 + Math.floor((10631 * hijriYear - 10646) / 30);
  const r = hijriYear % 30;
  const isLeap = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29].includes(r);
  const monthLengths = isLeap
    ? [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 30]
    : [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];

  // Day-of-year untuk hijriMonth
  let dayOfYear = 1;
  for (let i = 0; i < hijriMonth - 1; i++) {
    dayOfYear += monthLengths[i];
  }
  const monthStartJDN = yearStartJDN + dayOfYear - 1;

  // JDN → Date (Gregorian)
  const jdnToDate = (jdn: number): Date => {
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
  };

  const monthStart = jdnToDate(monthStartJDN);
  return {
    daysInMonth: monthLengths[hijriMonth - 1],
    startWeekday: monthStart.getDay(),
  };
}

const colorClasses: Record<IslamicHoliday["color"], { bg: string; text: string; ring: string; emojiBg: string; dot: string }> = {
  emerald: { bg: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500/40", emojiBg: "bg-emerald-500/15", dot: "bg-emerald-500" },
  amber: { bg: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-500/40", emojiBg: "bg-amber-500/15", dot: "bg-amber-500" },
  rose: { bg: "bg-rose-500", text: "text-rose-600 dark:text-rose-400", ring: "ring-rose-500/40", emojiBg: "bg-rose-500/15", dot: "bg-rose-500" },
  sky: { bg: "bg-sky-500", text: "text-sky-600 dark:text-sky-400", ring: "ring-sky-500/40", emojiBg: "bg-sky-500/15", dot: "bg-sky-500" },
  violet: { bg: "bg-violet-500", text: "text-violet-600 dark:text-violet-400", ring: "ring-violet-500/40", emojiBg: "bg-violet-500/15", dot: "bg-violet-500" },
};

function CalendarGrid() {
  const today = useMemo(() => getTodayInfo(), []);

  const [hijriYear, setHijriYear] = useState(today.hijri.year);
  const [hijriMonth, setHijriMonth] = useState(today.hijri.month);
  const [gregYear, setGregYear] = useState(today.gregorian.year);
  const [gregMonth, setGregMonth] = useState(today.gregorian.month - 1); // 0-indexed

  // Hijri grid
  const hijri = useMemo(() => getHijriMonthInfo(hijriYear, hijriMonth), [hijriYear, hijriMonth]);
  const hijriGrid = useMemo(() => {
    const cells: Array<{ day: number; isToday: boolean; holiday?: IslamicHoliday }> = [];
    for (let i = 0; i < hijri.startWeekday; i++) {
      cells.push({ day: 0, isToday: false });
    }
    for (let d = 1; d <= hijri.daysInMonth; d++) {
      const holiday = getHolidayOnDate(hijriMonth, d);
      const isToday =
        hijriYear === today.hijri.year &&
        hijriMonth === today.hijri.month &&
        d === today.hijri.day;
      cells.push({ day: d, isToday, holiday });
    }
    return cells;
  }, [hijri, hijriYear, hijriMonth, today]);

  // Greg grid
  const greg = useMemo(() => gregorianMonthInfo(gregYear, gregMonth), [gregYear, gregMonth]);
  const gregGrid = useMemo(() => {
    const cells: Array<{ day: number; hijriDay: number; isToday: boolean; holiday?: IslamicHoliday }> = [];
    for (let i = 0; i < greg.startWeekday; i++) {
      cells.push({ day: 0, hijriDay: 0, isToday: false });
    }
    for (let d = 1; d <= greg.daysInMonth; d++) {
      const jdn = gregorianToJDN(gregYear, gregMonth + 1, d);
      const h = jdnToHijri(jdn);
      const holiday = getHolidayOnDate(h.month, h.day);
      const isToday =
        gregYear === today.gregorian.year &&
        gregMonth + 1 === today.gregorian.month &&
        d === today.gregorian.day;
      cells.push({ day: d, hijriDay: h.day, isToday, holiday });
    }
    return cells;
  }, [greg, gregYear, gregMonth, today]);

  // Navigation handlers
  const goPrev = () => {
    if (hijriMonth === 1) {
      setHijriMonth(12);
      setHijriYear(hijriYear - 1);
    } else {
      setHijriMonth(hijriMonth - 1);
    }
    if (gregMonth === 0) {
      setGregMonth(11);
      setGregYear(gregYear - 1);
    } else {
      setGregMonth(gregMonth - 1);
    }
  };

  const goNext = () => {
    if (hijriMonth === 12) {
      setHijriMonth(1);
      setHijriYear(hijriYear + 1);
    } else {
      setHijriMonth(hijriMonth + 1);
    }
    if (gregMonth === 11) {
      setGregMonth(0);
      setGregYear(gregYear + 1);
    } else {
      setGregMonth(gregMonth + 1);
    }
  };

  const goToday = () => {
    setHijriYear(today.hijri.year);
    setHijriMonth(today.hijri.month);
    setGregYear(today.gregorian.year);
    setGregMonth(today.gregorian.month - 1);
  };

  const renderGrid = (
    cells: Array<{ day: number; isToday: boolean; holiday?: IslamicHoliday }>,
    isHijri: boolean,
  ) => (
    <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Kalender">
      {cells.map((cell, idx) => {
        if (cell.day === 0) return <div key={idx} aria-hidden="true" />;
        const c = cell.holiday ? colorClasses[cell.holiday.color] : null;
        return (
          <div
            key={idx}
            className={cn(
              "relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-semibold transition-all",
              cell.isToday
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                : c
                ? `${c.text} ${c.emojiBg} ring-1 ${c.ring}`
                : "text-foreground hover:bg-muted",
            )}
            role="gridcell"
            aria-label={
              cell.holiday
                ? `${cell.day} ${isHijri ? "Hijriah" : "Masehi"} - ${cell.holiday.name}`
                : `${cell.day}`
            }
            title={cell.holiday?.name}
          >
            <span className={cn("tabular-nums leading-none", cell.isToday ? "text-sm font-bold" : "text-xs")}>
              {cell.day}
            </span>
            {cell.holiday && (
              <span className="text-[8px] leading-none mt-0.5" aria-hidden="true">
                {cell.holiday.emoji}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Hijri Calendar */}
      <Card className="border-border/60 overflow-hidden">
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <button
              onClick={goPrev}
              className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <div className="text-center flex-1 min-w-0">
              <p className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                🌙 Hijriah
              </p>
              <p className="text-sm font-bold text-foreground truncate">
                {HIJRI_MONTH_NAMES_ID[hijriMonth]} {hijriYear} H
              </p>
            </div>
            <button
              onClick={goNext}
              className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {INDONESIAN_WEEKDAYS_SHORT.map((d) => (
              <div key={d} className="text-center text-[10px] font-bold text-muted-foreground uppercase py-1">
                {d}
              </div>
            ))}
          </div>
          {renderGrid(hijriGrid, true)}
        </CardContent>
      </Card>

      {/* Greg Calendar */}
      <Card className="border-border/60 overflow-hidden">
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="w-8" />
            <div className="text-center flex-1 min-w-0">
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                📅 Masehi
              </p>
              <p className="text-sm font-bold text-foreground truncate">
                {GREGORIAN_MONTH_NAMES[gregMonth]} {gregYear}
              </p>
            </div>
            <button
              onClick={goToday}
              className="text-[10px] text-primary font-semibold hover:underline px-2 py-1 rounded-md hover:bg-muted"
            >
              Hari ini
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {INDONESIAN_WEEKDAYS_SHORT.map((d) => (
              <div key={d} className="text-center text-[10px] font-bold text-muted-foreground uppercase py-1">
                {d}
              </div>
            ))}
          </div>
          {renderGrid(gregGrid, false)}
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="px-2">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
          Hari Besar:
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          {ISLAMIC_HOLIDAYS.map((h) => {
            const c = colorClasses[h.color];
            return (
              <div key={h.id} className="flex items-center gap-1.5">
                <span className={cn("w-2.5 h-2.5 rounded shrink-0", c.dot)} />
                <span className="text-[10px] text-foreground/80 font-medium whitespace-nowrap">
                  {h.emoji} {h.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- Tabel Hari Besar Islam ---

function HolidaysTable() {
  const [filter, setFilter] = useState<HolidayType | "all">("all");
  const filtered = useMemo(() => {
    if (filter === "all") return ISLAMIC_HOLIDAYS;
    return ISLAMIC_HOLIDAYS.filter((h) => h.type === filter);
  }, [filter]);

  // Group by Hijri month
  const grouped = useMemo(() => {
    const map = new Map<number, IslamicHoliday[]>();
    filtered.forEach((h) => {
      if (!map.has(h.hijriMonth)) map.set(h.hijriMonth, []);
      map.get(h.hijriMonth)!.push(h);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [filtered]);

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className="rounded-full h-7 text-xs shrink-0"
        >
          ✨ Semua
        </Button>
        {(Object.keys(HOLIDAY_TYPE_LABELS) as HolidayType[]).map((t) => {
          const info = HOLIDAY_TYPE_LABELS[t];
          return (
            <Button
              key={t}
              variant={filter === t ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(t)}
              className="rounded-full h-7 text-xs shrink-0"
            >
              {info.emoji} {info.label}
            </Button>
          );
        })}
      </div>

      {grouped.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Tidak ada hari besar untuk filter ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([month, holidays]) => (
            <div key={month}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Bulan {HIJRI_MONTH_NAMES_ID[month]}
                </p>
                <div className="flex-1 h-px bg-border/60" />
                <p className="text-[10px] text-muted-foreground tabular-nums">
                  {holidays.length} hari
                </p>
              </div>

              <Card className="border-border/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/40">
                        <th className="px-2.5 py-2 text-left text-[9px] font-bold text-muted-foreground uppercase tracking-wider w-12">
                          Tanggal
                        </th>
                        <th className="px-2.5 py-2 text-left text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                          Hari Besar
                        </th>
                        <th className="px-2.5 py-2 text-left text-[9px] font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell w-32">
                          Tipe
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {holidays.map((h) => {
                        const c = colorClasses[h.color];
                        return (
                          <tr
                            key={h.id}
                            className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-2.5 py-2.5 align-top">
                              <div className="flex flex-col items-start gap-0.5">
                                <span className="text-base font-bold text-foreground tabular-nums leading-none">
                                  {h.hijriDay}
                                </span>
                                <span className="text-[9px] text-muted-foreground font-medium uppercase">
                                  {HIJRI_MONTH_NAMES_ID[h.hijriMonth].slice(0, 3)}
                                </span>
                              </div>
                            </td>
                            <td className="px-2.5 py-2.5 align-top">
                              <div className="flex items-start gap-2">
                                <span className="text-base shrink-0" aria-hidden="true">{h.emoji}</span>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-foreground leading-tight">
                                    {h.name}
                                  </p>
                                  <p className="font-arabic text-[10px] text-muted-foreground leading-tight" dir="rtl" lang="ar">
                                    {h.nameArabic}
                                  </p>
                                  <p className="text-[10px] text-foreground/75 leading-relaxed mt-1 line-clamp-3">
                                    {h.description}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-2.5 py-2.5 align-top hidden sm:table-cell">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap",
                                  c.emojiBg,
                                  c.text,
                                )}
                              >
                                {HOLIDAY_TYPE_LABELS[h.type].emoji} {HOLIDAY_TYPE_LABELS[h.type].label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 p-3 rounded-2xl bg-muted/40 border border-border/40 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Tanggal Hijriah bersifat perkiraan berdasarkan kalender tabular. Penetapan resmi menunggu keputusan Kemenag berdasarkan rukyatul hilal (observasi bulan sabit) sehingga dapat bergeser ±1-2 hari.
        </p>
      </div>
    </div>
  );
}

export default function KalenderPage({ onMenuClick }: KalenderPageProps) {
  useDocumentTitle("Kalender Islam");
  const today = useMemo(() => getTodayInfo(), []);
  const todayHoliday = useMemo(
    () => getHolidayOnDate(today.hijri.month, today.hijri.day),
    [today.hijri.month, today.hijri.day],
  );

  return (
    <div className="min-h-dvh bg-background">
      <Header onMenuClick={onMenuClick} />
      <main className="container mx-auto px-3 py-3 pb-32 md:pb-12 max-w-3xl" aria-labelledby="kalender-title">
        <Button variant="ghost" asChild className="mb-2.5 -ml-2 rounded-full h-8" size="sm">
          <Link to="/">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            <span className="text-xs">Kembali</span>
          </Link>
        </Button>

        <section className="mb-4">
          <h1 id="kalender-title" className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6 text-violet-600" aria-hidden="true" />
            Kalender Islam
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Konversi Masehi ↔ Hijriah & hari besar Islam</p>
        </section>

        <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-violet-500/4 to-transparent mb-4 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-0.5">
                  {today.gregorian.weekday}
                </p>
                <p className="text-base font-bold text-foreground truncate">
                  {today.gregorian.day} {GREGORIAN_MONTH_NAMES[today.gregorian.month - 1]} {today.gregorian.year}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {today.hijri.day} {today.hijri.monthName} {today.hijri.year} H
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-arabic text-2xl text-violet-600 dark:text-violet-400 leading-none" dir="rtl" lang="ar">
                  {today.hijri.monthArabic}
                </p>
                <p className="text-[9px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">
                  Hijriah
                </p>
              </div>
            </div>
            {todayHoliday && (
              <div className="mt-3 pt-3 border-t border-violet-500/20 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
                <p className="text-[11px] text-foreground font-medium">
                  Hari ini: <span className="font-bold text-violet-700 dark:text-violet-300">{todayHoliday.name}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList className="grid w-full max-w-sm mx-auto grid-cols-2 h-10 rounded-full bg-muted p-0.5" aria-label="Pilihan tampilan kalender">
            <TabsTrigger value="calendar" className="rounded-full gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              Kalender
            </TabsTrigger>
            <TabsTrigger value="holidays" className="rounded-full gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              Hari Besar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="animate-fade-in">
            <CalendarGrid />
          </TabsContent>

          <TabsContent value="holidays" className="animate-fade-in">
            <HolidaysTable />
          </TabsContent>
        </Tabs>
      </main>
      <AudioPlayer />
    </div>
  );
}