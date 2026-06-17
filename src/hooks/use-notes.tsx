import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface NoteItem {
  id: string;
  surahNumber: number;
  surahName: string;
  ayatNumber: number;
  title: string;
  body: string;
  color: "emerald" | "amber" | "sky" | "rose" | "violet";
  timestamp: number;
  updatedAt: number;
}

const STORAGE_KEY = "quran-notes";

interface NotesContextValue {
  notes: NoteItem[];
  addNote: (note: Omit<NoteItem, "id" | "timestamp" | "updatedAt">) => NoteItem;
  updateNote: (id: string, updates: Partial<Omit<NoteItem, "id">>) => void;
  removeNote: (id: string) => void;
  clearNotes: () => void;
  getNotesForAyat: (surahNumber: number, ayatNumber: number) => NoteItem[];
}

const NotesContext = createContext<NotesContextValue | null>(null);

function loadNotes(): NoteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as NoteItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<NoteItem[]>(loadNotes);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (err) {
      console.error("[Notes] Failed to save", err);
    }
  }, [notes]);

  const addNote = useCallback<NotesContextValue["addNote"]>((data) => {
    const newNote: NoteItem = {
      ...data,
      id: `${data.surahNumber}-${data.ayatNumber}-${Date.now()}`,
      timestamp: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
    return newNote;
  }, []);

  const updateNote = useCallback<NotesContextValue["updateNote"]>(
    (id, updates) => {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n,
        ),
      );
    },
    [],
  );

  const removeNote = useCallback<NotesContextValue["removeNote"]>((id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearNotes = useCallback(() => {
    setNotes([]);
  }, []);

  const getNotesForAyat = useCallback(
    (surahNumber: number, ayatNumber: number) =>
      notes.filter(
        (n) => n.surahNumber === surahNumber && n.ayatNumber === ayatNumber,
      ),
    [notes],
  );

  const value = useMemo<NotesContextValue>(
    () => ({
      notes,
      addNote,
      updateNote,
      removeNote,
      clearNotes,
      getNotesForAyat,
    }),
    [notes, addNote, updateNote, removeNote, clearNotes, getNotesForAyat],
  );

  return (
    <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
  );
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used within NotesProvider");
  return ctx;
}