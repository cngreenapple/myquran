import { useState, useMemo } from "react";
import { useNotes } from "@/hooks/use-notes";

export function useNotesPage() {
  const { notes, removeNote, clearNotes } = useNotes();
  const [query, setQuery] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return notes;
    const q = query.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        n.surahName.toLowerCase().includes(q),
    );
  }, [notes, query]);

  return {
    notes: filtered,
    totalCount: notes.length,
    query,
    setQuery,
    removeNote,
    clearNotes,
    confirming,
    setConfirming,
    editingId,
    setEditingId,
  };
}