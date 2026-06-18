import { Link } from "react-router-dom";
import { Flame, BookOpen, Star, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useReadingStats } from "@/hooks/use-reading-stats";
import { cn } from "@/lib/utils";

export function StatsCard() {
  const { stats, getTodayCount } = useReadingStats();
  const todayCount = getTodayCount();

  const stats_items = [
    {
      icon: Flame,
      label: "Streak",
      value: stats.streakDays,
      suffix: "hari",
      color: stats.streakDays > 0 ? "text-orange-500" : "text-muted-foreground",
      bg: stats.streakDays > 0 ? "bg-orange-500/10" : "bg-muted/50",
    },
    {
      icon: TrendingUp,
      label: "Hari Ini",
      value: todayCount,
      suffix: "ayat",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: BookOpen,
      label: "Surat",
      value: stats.surahsOpened.length,
      suffix: "dibuka",
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-500/10",
    },
    {
      icon: Star,
      label: "Total",
      value: stats.totalAyatRead,
      suffix: "ayat",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <Card className="border-border/60 overflow-hidden">
      <CardContent className="p-4">
        <div className="grid grid-cols-4 gap-2">
          {stats_items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex flex-col items-center text-center p-2 rounded-xl"
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center mb-1.5",
                    item.bg,
                  )}
                >
                  <Icon className={cn("w-4 h-4", item.color)} />
                </div>
                <p
                  className={cn(
                    "text-lg font-bold tabular-nums leading-none",
                    item.value > 0 ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.value}
                </p>
                <p className="text-[9px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wider">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
        {stats.streakDays >= 7 && (
          <div className="mt-2 pt-3 border-t border-border/40 flex items-center justify-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              🔥 {stats.streakDays} hari berturut! Teruskan!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}