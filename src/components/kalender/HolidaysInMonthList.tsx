import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ChevronDown, ChevronUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { colorClasses } from "./constants";
import {
  ISLAMIC_HOLIDAYS,
  HOLIDAY_TYPE_LABELS,
  type IslamicHoliday,
} from "@/data/islamic-holidays";

interface HolidaysInMonthListProps {
  /** Daftar holiday di bulan Hijriah yang sedang dilihat (sudah di-filter) */
  holidays: IslamicHoliday[];
  /** Nama bulan Hijriah dalam bahasa Indonesia (untuk subtitle) */
  hijriMonthName: string;
  /** Tahun Hijriah (untuk subtitle) */
  hijriYear: number;
}

/**
 * Section "Hari Besar Bulan Ini" di bawah CalendarGrid.
 *
 * Tampilan:
 * - Header: icon + "Hari Besar Bulan Ini" + jumlah item
 * - List item: emoji, nama Indonesia, nama Arab, tanggal (day/month H)
 * - Tap item untuk expand dan lihat deskripsi + tipe
 * - Empty state: friendly message kalau bulan ini tidak ada hari besar
 *
 * Expandable inline (bukan modal) supaya user bisa baca cepat tanpa
 * hilang konteks kalender.
 */
export function HolidaysInMonthList({
  holidays,
  hijriMonthName,
  hijriYear,
}: HolidaysInMonthListProps) {
  // Track which holiday is expanded by id
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Sort by day ascending supaya urut tanggal
  const sorted = [...holidays].sort((a, b) => a.hijriDay - b.hijriDay);

  return (
    <Card className="border-violet-500/25 bg-gradient-to-br from-violet-500/5 via-violet-500/2 to-transparent overflow-hidden">
      <CardContent className="p-3.5">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-violet-600 dark:text-violet-400" />
            </div>
            <p className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
              Hari Besar Bulan Ini
            </p>
          </div>
          <span className="text-[10px] text-muted-foreground font-medium tabular-nums">
            {sorted.length} dari {ISLAMIC_HOLIDAYS.length}
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground font-medium mb-2.5">
          Daftar hari besar & istimewa pada {hijriMonthName} {hijriYear} H
        </p>

        {sorted.length === 0 ? (
          <EmptyState hijriMonthName={hijriMonthName} />
        ) : (
          <ul className="space-y-1.5" role="list" aria-label={`Hari besar ${hijriMonthName} ${hijriYear} H`}>
            {sorted.map((holiday) => (
              <HolidayItem
                key={holiday.id}
                holiday={holiday}
                expanded={expandedId === holiday.id}
                onToggle={() =>
                  setExpandedId((prev) => (prev === holiday.id ? null : holiday.id))
                }
              />
            ))}
          </ul>
        )}

        {sorted.length > 0 && (
          <p className="text-[9px] text-muted-foreground italic mt-2.5 pt-2 border-t border-violet-500/15 leading-relaxed">
            ⚠️ Tanggal mengikuti kalender Hijriah tabular (perkiraan). Penetapan resmi menunggu keputusan Kemenag berdasarkan rukyatul hilal.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// --- Sub-komponen ---

interface HolidayItemProps {
  holiday: IslamicHoliday;
  expanded: boolean;
  onToggle: () => void;
}

function HolidayItem({ holiday, expanded, onToggle }: HolidayItemProps) {
  const c = colorClasses[holiday.color];
  const typeMeta = HOLIDAY_TYPE_LABELS[holiday.type];

  return (
    <li>
      <button
        onClick={onToggle}
        className={cn(
          "w-full text-left rounded-xl border transition-all overflow-hidden",
          expanded
            ? `${c.emojiBg} ${c.ring} border-current shadow-sm`
            : "border-border/60 bg-card hover:border-violet-500/40 hover:bg-muted/40",
        )}
        aria-expanded={expanded}
        aria-controls={`holiday-desc-${holiday.id}`}
        aria-label={`${holiday.name} - ${holiday.hijriDay} ${holiday.nameArabic} - ${typeMeta.label}. Tekan untuk ${
          expanded ? "menyembunyikan" : "melihat"
        } deskripsi.`}
      >
        {/* Collapsed header */}
        <div className="flex items-center gap-2.5 p-2.5">
          <span
            className={cn(
              "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base",
              c.emojiBg,
            )}
            aria-hidden="true"
          >
            {holiday.emoji}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p
                className={cn(
                  "text-xs font-bold truncate",
                  expanded ? c.text : "text-foreground",
                )}
              >
                {holiday.name}
              </p>
              <span
                className={cn(
                  "inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shrink-0",
                  holiday.type === "libur"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : holiday.type === "besar"
                    ? "bg-violet-500/15 text-violet-700 dark:text-violet-400"
                    : "bg-sky-500/15 text-sky-700 dark:text-sky-400",
                )}
              >
                {typeMeta.emoji} {typeMeta.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="font-arabic text-[11px] text-muted-foreground leading-none" dir="rtl" lang="ar">
                {holiday.nameArabic}
              </p>
              <span className="text-[9px] text-muted-foreground/60">•</span>
              <span className="text-[10px] text-muted-foreground font-medium tabular-nums">
                {holiday.hijriDay} {HIJRI_MONTH_SHORT[holiday.hijriMonth]} H
              </span>
            </div>
          </div>

          <div className="shrink-0">
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div
            id={`holiday-desc-${holiday.id}`}
            className="px-2.5 pb-2.5 pt-0 animate-fade-in"
          >
            <div className="rounded-lg bg-card/80 border border-border/60 p-2.5 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-[11px] text-foreground/85 leading-relaxed">
                {holiday.description}
              </p>
            </div>
          </div>
        )}
      </button>
    </li>
  );
}

function EmptyState({ hijriMonthName }: { hijriMonthName: string }) {
  return (
    <div className="text-center py-6 px-3 rounded-xl bg-muted/30 border border-dashed border-border/60">
      <Sparkles className="w-5 h-5 mx-auto mb-2 text-muted-foreground/50" aria-hidden="true" />
      <p className="text-xs font-semibold text-foreground mb-0.5">
        Tidak ada hari besar di {hijriMonthName}
      </p>
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Bulan ini tetap baik untuk memperbanyak ibadah sunnah dan dzikir harian.
      </p>
    </div>
  );
}

// --- Helpers (lokal) ---

const HIJRI_MONTH_SHORT: Record<number, string> = {
  1: "Muharram",
  2: "Safar",
  3: "Rabi'ul Awal",
  4: "Rabi'ul Akhir",
  5: "Jumadil Awal",
  6: "Jumadil Akhir",
  7: "Rajab",
  8: "Syaban",
  9: "Ramadan",
  10: "Syawal",
  11: "Dzulka'dah",
  12: "Dzulhijjah",
};