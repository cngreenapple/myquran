import { useState } from "react";
import { Moon, Sparkles, Calendar as CalendarIcon, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { PUASA_SUNNAH, CATEGORY_INFO, type FastingCategory, type FastingItem } from "@/data/puasa-sunnah";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { cn } from "@/lib/utils";

const colorClasses: Record<FastingItem["color"], {
  bg: string;
  border: string;
  text: string;
  emojiBg: string;
}> = {
  emerald: {
    bg: "bg-emerald-500/5",
    border: "border-emerald-500/30",
    text: "text-emerald-700 dark:text-emerald-400",
    emojiBg: "bg-emerald-500/15",
  },
  amber: {
    bg: "bg-amber-500/5",
    border: "border-amber-500/30",
    text: "text-amber-700 dark:text-amber-400",
    emojiBg: "bg-amber-500/15",
  },
  sky: {
    bg: "bg-sky-500/5",
    border: "border-sky-500/30",
    text: "text-sky-700 dark:text-sky-400",
    emojiBg: "bg-sky-500/15",
  },
  rose: {
    bg: "bg-rose-500/5",
    border: "border-rose-500/30",
    text: "text-rose-700 dark:text-rose-400",
    emojiBg: "bg-rose-500/15",
  },
  violet: {
    bg: "bg-violet-500/5",
    border: "border-violet-500/30",
    text: "text-violet-700 dark:text-violet-400",
    emojiBg: "bg-violet-500/15",
  },
};

export default function PuasaSunnahPage() {
  useDocumentTitle("Puasa Sunnah");

  const [filter, setFilter] = useState<FastingCategory | "all">("all");

  const filtered = filter === "all"
    ? PUASA_SUNNAH
    : PUASA_SUNNAH.filter((p) => p.category === filter);

  return (
    <div className="min-h-dvh bg-background">
      <Header />

      <main
        className="container mx-auto px-4 py-6 pb-32 md:pb-12 max-w-3xl"
        aria-labelledby="puasa-title"
      >
        <section className="mb-6">
          <h1
            id="puasa-title"
            className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2"
          >
            <Moon className="w-7 h-7 text-violet-600" aria-hidden="true" />
            Puasa Sunnah
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Amalan puasa di luar Ramadan yang diajarkan Rasulullah ﷺ
          </p>
        </section>

        {/* Intro card */}
        <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent mb-5 overflow-hidden">
          <CardContent className="p-5 relative">
            <div
              className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-violet-500/10"
              aria-hidden="true"
            />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                <p className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                  Keutamaan
                </p>
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed">
                Puasa sunnah adalah amalan yang sangat dicintai Allah. Setiap amalan kebaikan
                akan dilipatgandakan pahalanya. Mari raih keberkahan dengan berpuasa di waktu-waktu
                utama.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Category filter */}
        <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar -mx-4 px-4">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border-2",
              filter === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/60 bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            📚 Semua ({PUASA_SUNNAH.length})
          </button>
          {(Object.keys(CATEGORY_INFO) as FastingCategory[]).map((cat) => {
            const info = CATEGORY_INFO[cat];
            const count = PUASA_SUNNAH.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border-2",
                  filter === cat
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/60 bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {info.emoji} {info.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Fasting items */}
        <ul className="space-y-3 animate-fade-in" role="list">
          {filtered.map((item) => {
            const colors = colorClasses[item.color];
            return (
              <li key={item.id}>
                <Card
                  className={cn(
                    "border-border/60 overflow-hidden",
                    colors.bg,
                  )}
                >
                  <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={cn(
                          "shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl",
                          colors.emojiBg,
                        )}
                        aria-hidden="true"
                      >
                        {item.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-foreground">
                          {item.title}
                        </h3>
                        {item.arabicName && (
                          <p
                            className="font-arabic text-sm text-muted-foreground"
                            dir="rtl"
                          >
                            {item.arabicName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Schedule */}
                    <div
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium mb-3",
                        colors.emojiBg,
                        colors.text,
                      )}
                    >
                      <CalendarIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{item.schedule}</span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-foreground/85 leading-relaxed mb-3">
                      {item.description}
                    </p>

                    {/* Benefit */}
                    <div
                      className={cn(
                        "rounded-xl p-3 mb-3 border-l-2",
                        colors.border,
                        "bg-card/60",
                      )}
                    >
                      <p
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider mb-1",
                          colors.text,
                        )}
                      >
                        ✨ Keutamaan
                      </p>
                      <p className="text-sm text-foreground/85 leading-relaxed italic">
                        {item.benefit}
                      </p>
                    </div>

                    {/* Source */}
                    {item.source && (
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                        <BookOpen className="w-3 h-3" aria-hidden="true" />
                        <span>{item.source}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      </main>

      <AudioPlayer />
    </div>
  );
}