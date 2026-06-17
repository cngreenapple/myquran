import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { showSuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";
import type { Ayat } from "@/types/quran";

interface BookmarkButtonProps {
  surahNumber: number;
  surahName: string;
  ayat: Ayat;
  variant?: "default" | "compact";
}

export function BookmarkButton({
  surahNumber,
  surahName,
  ayat,
  variant = "default",
}: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();

  if (!surahNumber || !ayat || !ayat.nomorAyat) {
    return null;
  }

  const bookmarked = isBookmarked(surahNumber, ayat.nomorAyat);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      toggleBookmark({
        surahNumber,
        surahName: surahName || "",
        ayatNumber: ayat.nomorAyat,
        teksArab: ayat.teksArab || "",
        teksIndonesia: ayat.teksIndonesia || "",
      });
      showSuccess(bookmarked ? "Bookmark dihapus" : "Ayat disimpan ke bookmark");
    } catch (err) {
      console.error("[BookmarkButton] Error toggling bookmark", err);
    }
  };

  if (variant === "compact") {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center w-9 h-9 rounded-full transition-all active:scale-90",
          bookmarked
            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
            : "bg-muted text-muted-foreground hover:bg-muted/70",
        )}
        aria-label={bookmarked ? "Hapus bookmark" : "Tambah bookmark"}
        type="button"
      >
        {bookmarked ? (
          <BookmarkCheck className="w-4 h-4 fill-current" />
        ) : (
          <Bookmark className="w-4 h-4" />
        )}
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      type="button"
      className={cn(
        "gap-1.5 rounded-full",
        bookmarked &&
          "text-amber-600 hover:text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30",
      )}
    >
      {bookmarked ? (
        <BookmarkCheck className="w-4 h-4 fill-current" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
      <span className="text-xs font-medium">
        {bookmarked ? "Tersimpan" : "Bookmark"}
      </span>
    </Button>
  );
}