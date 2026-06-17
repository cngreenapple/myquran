import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Sparkles, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSurahList } from "@/hooks/use-surah-list";

export function VerseOfTheDay() {
  const { data: surahList } = useSurahList();

  // Generate stable "verse of the day" based on current date
  const verseInfo = useMemo(() => {
    if (!surahList || surahList.length === 0) return null;

    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    // Pick a random surah, weighted toward earlier surahs (more commonly read)
    const totalSurahs = surahList.length;
    const surahIdx = (dayOfYear * 7 + 13) % totalSurahs;
    const surah = surahList[surahIdx];

    // Pick a random ayat within the surah
    const ayatNum = ((dayOfYear * 3 + 7) % surah.jumlahAyat) + 1;

    return { surah, ayatNum };
  }, [surahList]);

  if (!verseInfo) return null;

  const { surah, ayatNum } = verseInfo;
  const arabicName = surah.nama.replace(/^سُورَةُ\s*/, "");

  return (
    <Link
      to={`/surat/${surah.nomor}#ayat-${ayatNum}`}
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-3xl"
    >
      <Card className="overflow-hidden border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-violet-500/3 to-transparent hover:shadow-lg hover:shadow-violet-500/10 transition-all group-active:scale-[0.99]">
        <CardContent className="p-5 relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                Ayat Hari Ini
              </p>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">
              {surah.namaLatin} • Ayat {ayatNum}
            </span>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p
                className="font-arabic text-right text-2xl sm:text-3xl text-foreground leading-[2] line-clamp-2"
                dir="rtl"
                lang="ar"
              >
                {/* Placeholder: akan di-replace oleh actual data ketika user click */}
                ﴿ {surah.arti} ﴾
              </p>
            </div>
            <div
              className="font-arabic text-2xl text-violet-500/40 shrink-0"
              dir="rtl"
            >
              {arabicName}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-violet-500/20 flex items-center justify-between">
            <p className="text-xs text-muted-foreground line-clamp-1 flex-1">
              {surah.deskripsi}
            </p>
            <BookOpen className="w-3.5 h-3.5 text-violet-500/60 shrink-0 ml-2" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}