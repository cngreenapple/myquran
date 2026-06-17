import { useState, useMemo } from "react";
import {
  StickyNote,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  BookOpen,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNotes, type NoteItem } from "@/hooks/use-notes";
import { showSuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";
import type { Ayat } from "@/types/quran";

type NoteColor = NoteItem["color"];

const COLOR_OPTIONS: Array<{
  value: NoteColor;
  label: string;
  bg: string;
  border: string;
  ring: string;
}> = [
  {
    value: "emerald",
    label: "Hijau",
    bg: "bg-emerald-500",
    border: "border-emerald-500/40",
    ring: "ring-emerald-500/30",
  },
  {
    value: "amber",
    label: "Kuning",
    bg: "bg-amber-500",
    border: "border-amber-500/40",
    ring: "ring-amber-500/30",
  },
  {
    value: "sky",
    label: "Biru",
    bg: "bg-sky-500",
    border: "border-sky-500/40",
    ring: "ring-sky-500/30",
  },
  {
    value: "rose",
    label: "Merah",
    bg: "bg-rose-500",
    border: "border-rose-500/40",
    ring: "ring-rose-500/30",
  },
  {
    value: "violet",
    label: "Ungu",
    bg: "bg-violet-500",
    border: "border-violet-500/40",
    ring: "ring-violet-500/30",
  },
];

const colorClasses: Record<NoteColor, {
  border: string;
  bg: string;
  text: string;
}> = {
  emerald: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  amber: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    text: "text-amber-700 dark:text-amber-400",
  },
  sky: {
    border: "border-sky-500/30",
    bg: "bg-sky-500/5",
    text: "text-sky-700 dark:text-sky-400",
  },
  rose: {
    border: "border-rose-500/30",
    bg: "bg-rose-500/5",
    text: "text-rose-700 dark:text-rose-400",
  },
  violet: {
    border: "border-violet-500/30",
    bg: "bg-violet-500/5",
    text: "text-violet-700 dark:text-violet-400",
  },
};

interface AyatNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surahNumber: number;
  surahName: string;
  ayat: Ayat;
}

export function AyatNotesDialog({
  open,
  onOpenChange,
  surahNumber,
  surahName,
  ayat,
}: AyatNotesDialogProps) {
  const { addNote, updateNote, removeNote, getNotesForAyat } = useNotes();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [color, setColor] = useState<NoteColor>("emerald");

  const notes = useMemo(
    () => getNotesForAyat(surahNumber, ayat.nomorAyat),
    [getNotesForAyat, surahNumber, ayat.nomorAyat],
  );

  const isEditing = editingId !== null;

  const resetForm = () => {
    setTitle("");
    setBody("");
    setColor("emerald");
    setEditingId(null);
  };

  const handleStartEdit = (note: NoteItem) => {
    setEditingId(note.id);
    setTitle(note.title);
    setBody(note.body);
    setColor(note.color);
    // Scroll to top of dialog
    requestAnimationFrame(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const scrollContainer = dialog?.querySelector(".overflow-y-auto");
      scrollContainer?.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleSave = () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      showSuccess("Judul catatan tidak boleh kosong");
      return;
    }

    if (isEditing && editingId) {
      updateNote(editingId, {
        title: cleanTitle,
        body: body.trim(),
        color,
      });
      showSuccess("Catatan diperbarui");
    } else {
      addNote({
        surahNumber,
        surahName,
        ayatNumber: ayat.nomorAyat,
        title: cleanTitle,
        body: body.trim(),
        color,
      });
      showSuccess("Catatan disimpan");
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    removeNote(id);
    showSuccess("Catatan dihapus");
    if (editingId === id) {
      resetForm();
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Small delay to allow animation to play before reset
      setTimeout(resetForm, 200);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-3xl max-w-md w-[calc(100%-2rem)] p-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="relative px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-border/60 shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/8 via-violet-500/3 to-transparent pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <StickyNote className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                  {isEditing ? "Edit Catatan" : "Catatan Ayat"}
                </p>
                <DialogTitle className="text-base font-bold text-foreground truncate">
                  QS. {surahName}:{ayat.nomorAyat}
                </DialogTitle>
              </div>
            </div>

            {/* Ayat preview */}
            <div className="rounded-xl bg-muted/40 p-3 mt-2 border border-border/40">
              <p
                className="font-arabic text-right text-lg leading-[2.2] text-foreground/85"
                dir="rtl"
                lang="ar"
              >
                {ayat.teksArab.slice(0, 120)}
                {ayat.teksArab.length > 120 ? "…" : ""}
              </p>
              <p className="text-xs text-foreground/70 leading-relaxed mt-1.5 line-clamp-2 italic">
                {ayat.teksIndonesia}
              </p>
            </div>
          </div>
        </div>

        {/* Form (add/edit) */}
        <div className="px-5 sm:px-6 py-4 border-b border-border/60 shrink-0">
          <div className="space-y-3">
            <div>
              <label
                htmlFor="note-title"
                className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block"
              >
                Judul <span className="text-rose-500">*</span>
              </label>
              <input
                id="note-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                placeholder="Cth: Pelajaran tentang tawakal"
                className="w-full px-3 py-2 text-sm rounded-xl border border-border/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-right">
                {title.length}/100
              </p>
            </div>

            <div>
              <label
                htmlFor="note-body"
                className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block"
              >
                Isi Catatan
              </label>
              <textarea
                id="note-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                placeholder="Tulis refleksi, tafsir, atau pertanyaan Anda tentang ayat ini..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-border/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
              />
            </div>

            {/* Color picker */}
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Warna
              </p>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setColor(opt.value)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all border-2",
                      opt.bg,
                      color === opt.value
                        ? "border-foreground scale-110 shadow-md"
                        : "border-transparent opacity-60 hover:opacity-100",
                    )}
                    aria-label={opt.label}
                    aria-pressed={color === opt.value}
                  >
                    {color === opt.value && (
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Form actions */}
            <div className="flex items-center gap-2 pt-1">
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  size="sm"
                  className="rounded-full"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Batal
                </Button>
              )}
              <Button
                type="button"
                onClick={handleSave}
                size="sm"
                className="rounded-full flex-1"
                disabled={!title.trim()}
              >
                {isEditing ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Simpan Perubahan
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Tambah Catatan
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Catatan untuk ayat ini ({notes.length})
            </p>
          </div>

          {notes.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <StickyNote className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                Belum ada catatan
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tulis refleksi pribadi Anda tentang ayat ini
              </p>
            </div>
          ) : (
            <ul className="space-y-2.5" role="list">
              {notes.map((note) => {
                const colors = colorClasses[note.color];
                const isCurrentlyEditing = editingId === note.id;

                return (
                  <li
                    key={note.id}
                    className={cn(
                      "rounded-2xl border p-3.5 transition-all",
                      colors.border,
                      colors.bg,
                      isCurrentlyEditing && "ring-2 ring-primary/40",
                    )}
                  >
                    <div className="flex items-start gap-2 mb-1.5">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-foreground truncate">
                          {note.title}
                        </h4>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(note.updatedAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            isCurrentlyEditing
                              ? handleCancelEdit()
                              : handleStartEdit(note)
                          }
                          className="w-7 h-7 rounded-lg hover:bg-background/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={
                            isCurrentlyEditing ? "Batal edit" : "Edit catatan"
                          }
                        >
                          {isCurrentlyEditing ? (
                            <X className="w-3.5 h-3.5" />
                          ) : (
                            <Edit3 className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(note.id)}
                          className="w-7 h-7 rounded-lg hover:bg-destructive/15 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Hapus catatan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {note.body && (
                      <p className="text-xs text-foreground/85 leading-relaxed whitespace-pre-wrap line-clamp-4">
                        {note.body}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {/* Link to full notes page */}
          {notes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/40 text-center">
              <a
                href="/catatan"
                onClick={(e) => {
                  e.preventDefault();
                  handleOpenChange(false);
                  setTimeout(() => {
                    window.location.href = "/catatan";
                  }, 150);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Lihat semua catatan
              </a>
            </div>
          )}
        </div>

        <DialogDescription className="sr-only">
          Kelola catatan pribadi untuk QS. {surahName} ayat {ayat.nomorAyat}.
          Anda dapat menambah, mengedit, dan menghapus catatan.
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}