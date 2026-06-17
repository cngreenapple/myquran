import { useState, useMemo } from "react";
import { useBookmarks } from "@/hooks/use-bookmarks";

export function useBookmarksPage() {
  const { bookmarks, removeBookmark, clearBookmarks } = useBookmarks();
  const [query, setQuery] = useState("");
  const [confirming, setConfirming] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return bookmarks;
    const q = query.toLowerCase();
    return bookmarks.filter(
      (b) =>
        b.surahName?.toLowerCase().includes(q) ||
        b.note?.toLowerCase().includes(q) ||
        b.ayatNumber.toString().includes(q),
    );
  }, [bookmarks, query]);

  return {
    bookmarks: filtered,
    totalCount: bookmarks.length,
    query,
    setQuery,
    removeBookmark,
    clearBookmarks,
    confirming,
    setConfirming,
  };
}