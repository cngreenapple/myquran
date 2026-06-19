import { Flame, BookOpen, Star, TrendingUp } from "lucide-react";
import { useReadingStats } from "@/hooks/use-reading-stats";
import { cn } from "@/lib/utils";

export function StatsCard() {
  const { stats, getTodayCount } = useReadingStats();
  const todayCount = getTodayCount();

  const items = [
    { icon: Flame, label: "Streak", value: stats.streakDays, suffix: "h", accent: stats.streakDays > 0 },
    { icon: TrendingUp, label: "Hari ini", value: todayCount, suffix: "ayat" },
    { icon: BookOpen, label: "Surat", value: stats.surahsOpened.length, suffix: null },
    { icon: Star, label: "Total", value: stats.totalAyatRead, suffix: "ayat" },
  ];

  return (
    <div className="flex items-stretch gap-1.5 p-1.5 rounded-2xl border border-border/60 bg-card">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={cn(
              "flex-1 min-w-0 flex flex-col items-center justify-center gap-1 px-1.5 py-2 rounded-xl text-center",
              item.accent ? "bg-orange-500/8" : "bg-muted/40",
            )}
          >
            {/* Icon — top, centered */}
            <div
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                item.accent ? "bg-orange-500/15 text-orange-600 dark:text-orange-400" : "bg-primary/10 text-primary",
              )}
              aria-hidden="true"
            >
              <Icon className="w-3.5 h-3.5" />
            </div>

            {/* Value + suffix — single line, no wrap */}
            <p className="text-sm font-bold tabular-nums leading-none flex items-baseline justify-center gap-0.5">
              <span>{item.value}</span>
              {item.suffix && (
                <span className="text-[9px] text-muted-foreground font-medium whitespace-nowrap shrink-0">
                  {item.suffix}
                </span>
              )}
            </p>

            {/* Label — full width, truncate if needed */}
            <p className="text-[9px] text-muted-foreground leading-none uppercase tracking-wide font-semibold truncate w-full">
              {item.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}