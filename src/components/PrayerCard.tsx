import { memo } from "react";
import { Check, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PrayerTime } from "@/lib/prayer-times";

interface PrayerCardProps {
  prayer: PrayerTime;
  isNext?: boolean;
  onNotify?: () => void;
}

export const PrayerCard = memo(function PrayerCard({ prayer, isNext, onNotify }: PrayerCardProps) {
  return (
    <div
      className={cn(
        "relative flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all",
        isNext
          ? "bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/40 shadow-sm shadow-emerald-500/10"
          : prayer.isPast
            ? "bg-muted/30 border-border/40 opacity-60"
            : "bg-card border-border/60",
      )}
    >
      {/* Indicator */}
      <div className="shrink-0">
        {prayer.isPast ? (
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <Check className="w-4 h-4 text-muted-foreground" />
          </div>
        ) : isNext ? (
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-30" />
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md shadow-emerald-500/30">
              <Bell className="w-4 h-4 text-white" />
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full border-2 border-border bg-background flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-muted-foreground" />
          </div>
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "font-semibold text-sm",
            isNext ? "text-emerald-700 dark:text-emerald-400" : "text-foreground",
          )}
        >
          {prayer.name}
        </p>
        <p
          className="font-arabic text-xs text-muted-foreground"
          dir="rtl"
        >
          {prayer.nameArabic}
        </p>
      </div>

      {/* Time */}
      <div className="shrink-0 text-right">
        <p
          className={cn(
            "text-base font-bold tabular-nums",
            isNext ? "text-emerald-700 dark:text-emerald-400" : "text-foreground",
          )}
        >
          {prayer.time}
        </p>
        {isNext && onNotify && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNotify();
            }}
            className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium hover:underline mt-0.5"
          >
            Aktifkan alarm
          </button>
        )}
      </div>
    </div>
  );
});