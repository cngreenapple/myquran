import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  ListMusic,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Repeat1,
  X,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Loader2,
  List,
  Search,
  Volume2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAudio } from "@/contexts/audio-context";
import { useSurahList } from "@/hooks/use-surah-list";
import { useAudioQueue } from "@/hooks/use-audio-queue";
import { cn } from "@/lib/utils";

interface FullQuranPlayerProps {
  className?: string;
}

interface QueueDropdownItem {
  nomor: number;
  namaLatin: string;
  nama: string;
  tempatTurun: string;
  jumlahAyat: number;
  queueIndex: number;
  isCurrent: boolean;
}

export function FullQuranPlayer({ className }: FullQuranPlayerProps) {
  const audio = useAudio();
  const { data: surahList } = useSurahList();

  const queue = useAudioQueue({
    surahList,
    onPlaySurah: audio.play,
    onStop: audio.stop,
  });

  useEffect(() => {
    const unsubscribe = audio.onSurahEnded((surahNumber) => {
      return queue.onSurahEnded(surahNumber);
    });
    return unsubscribe;
  }, [audio, queue]);

  const [expanded, setExpanded] = useState(false);
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [fromNomor, setFromNomor] = useState(1);
  const [toNomor, setToNomor] = useState(30);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 288 });
  const [queueSearch, setQueueSearch] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const queueItems: QueueDropdownItem[] = useMemo(() => {
    if (!surahList) return [];
    return queue.queue.map((nomor, idx) => {
      const surah = surahList.find((s) => s.nomor === nomor);
      return {
        nomor,
        namaLatin: surah?.namaLatin || `Surah ${nomor}`,
        nama: surah?.nama || "",
        tempatTurun: surah?.tempatTurun || "",
        jumlahAyat: surah?.jumlahAyat || 0,
        queueIndex: idx,
        isCurrent: idx === queue.currentIndex,
      };
    });
  }, [queue.queue, queue.currentIndex, surahList]);

  const filteredQueueItems = useMemo(() => {
    if (!queueSearch.trim()) return queueItems;
    const q = queueSearch.toLowerCase();
    return queueItems.filter(
      (item) =>
        item.namaLatin.toLowerCase().includes(q) ||
        item.nomor.toString().includes(q) ||
        item.tempatTurun.toLowerCase().includes(q) ||
        item.nama.includes(q),
    );
  }, [queueItems, queueSearch]);

  const currentSurahInfo = useMemo(() => {
    if (queue.currentSurah === null || !surahList) return null;
    return surahList.find((s) => s.nomor === queue.currentSurah) ?? null;
  }, [queue.currentSurah, surahList]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        triggerRef.current?.contains(target) ||
        target.closest("[data-queue-dropdown]")
      ) {
        return;
      }
      setDropdownOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    if (dropdownOpen) {
      setQueueSearch("");
      requestAnimationFrame(() => {
        if (!listRef.current) return;
        const currentEl = listRef.current.querySelector(
          '[data-current="true"]',
        ) as HTMLElement | null;
        if (!currentEl) return;
        const listRect = listRef.current.getBoundingClientRect();
        const itemRect = currentEl.getBoundingClientRect();
        const offset = itemRect.top - listRect.top;
        const targetScroll =
          listRef.current.scrollTop +
          offset -
          listRect.height / 2 +
          itemRect.height / 2;
        listRef.current.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: "smooth",
        });
      });
    }
  }, [dropdownOpen]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleReposition = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const dropdownWidth = Math.min(288, window.innerWidth - 16);
        let left = rect.right - dropdownWidth;
        if (left < 8) left = 8;
        if (left + dropdownWidth > window.innerWidth - 8) {
          left = window.innerWidth - dropdownWidth - 8;
        }
        setDropdownPos({ top: rect.bottom + 8, left, width: dropdownWidth });
      }
    };
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [dropdownOpen]);

  const handleToggleDropdown = useCallback(() => {
    if (!dropdownOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownWidth = Math.min(288, window.innerWidth - 16);
      let left = rect.right - dropdownWidth;
      if (left < 8) left = 8;
      if (left + dropdownWidth > window.innerWidth - 8) {
        left = window.innerWidth - dropdownWidth - 8;
      }
      setDropdownPos({ top: rect.bottom + 8, left, width: dropdownWidth });
    }
    setDropdownOpen((v) => !v);
  }, [dropdownOpen]);

  const handleJumpTo = useCallback(
    (queueIndex: number) => {
      queue.jumpTo(queueIndex);
      setDropdownOpen(false);
    },
    [queue],
  );

  const handlePlayFull = useCallback(() => {
    queue.playAll();
    setShowRangePicker(false);
  }, [queue]);

  const handlePlayRange = useCallback(() => {
    queue.playRange(fromNomor, toNomor);
    setShowRangePicker(false);
  }, [queue, fromNomor, toNomor]);

  const handleStop = useCallback(() => {
    queue.stop();
  }, [queue]);

  const RepeatIcon = queue.repeatMode === "single" ? Repeat1 : Repeat;

  if (!queue.isActive && !expanded) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setExpanded(true)}
        className={cn(
          "rounded-full gap-1.5 h-8 text-xs font-semibold",
          "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10",
          className,
        )}
        aria-label="Buka mode baca Al-Qur'an full"
      >
        <ListMusic className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Baca Full</span>
      </Button>
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden border-emerald-500/30 bg-gradient-to-br from-emerald-500/8 via-emerald-500/3 to-transparent shadow-sm",
        className,
      )}
    >
      <CardContent className="p-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/30">
              <BookOpen className="w-3.5 h-3.5 text-white" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider leading-none">
                Mode Baca Full
              </p>
              <p className="text-[11px] text-foreground font-semibold truncate leading-tight mt-0.5">
                {queue.isActive && currentSurahInfo
                  ? `${currentSurahInfo.nomor}. ${currentSurahInfo.namaLatin} (${queue.currentIndex + 1}/${queue.totalInQueue})`
                  : "Pilih surah untuk mulai"}
              </p>
              {queue.isActive && currentSurahInfo && (
                <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                  {currentSurahInfo.arti} • {currentSurahInfo.tempatTurun} • {currentSurahInfo.jumlahAyat} ayat
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            {queue.isActive && (
              <Button
                ref={triggerRef}
                variant="ghost"
                size="icon"
                onClick={handleToggleDropdown}
                className={cn(
                  "rounded-full h-7 w-7",
                  dropdownOpen &&
                    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
                )}
                aria-label="Lihat daftar antrian surah"
                aria-expanded={dropdownOpen}
                aria-haspopup="listbox"
              >
                <List className="w-3.5 h-3.5" aria-hidden="true" />
              </Button>
            )}
            {queue.isActive && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleStop}
                className="rounded-full h-7 w-7 text-muted-foreground hover:text-destructive"
                aria-label="Hentikan mode baca full"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpanded((v) => !v)}
              className="rounded-full h-7 w-7"
              aria-label={expanded ? "Ciutkan panel" : "Buka panel play"}
              aria-expanded={expanded}
            >
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {queue.isActive && (
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-[10px]">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                {queue.progressPercent}%
              </span>
              <span className="text-muted-foreground tabular-nums">
                {queue.remaining} surah tersisa
              </span>
            </div>
            <div
              className="h-1 bg-emerald-500/20 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={queue.progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progress baca full: ${queue.progressPercent} persen`}
            >
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
                style={{ width: `${queue.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {queue.isActive && (
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={queue.prev}
              disabled={queue.currentIndex === 0}
              className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Surah sebelumnya dalam antrian"
            >
              <SkipBack className="w-3.5 h-3.5" aria-hidden="true" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={queue.toggleShuffle}
              className={cn(
                "rounded-full h-8 w-8",
                queue.isShuffled
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/15"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label={queue.isShuffled ? "Matikan shuffle" : "Aktifkan shuffle"}
              aria-pressed={queue.isShuffled}
            >
              <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={queue.cycleRepeat}
              className={cn(
                "rounded-full h-8 w-8 relative",
                queue.repeatMode !== "off"
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/15"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label={`Mode repeat: ${queue.repeatMode === "off" ? "mati" : queue.repeatMode === "queue" ? "ulangi antrian" : "ulangi surah"}`}
            >
              <RepeatIcon className="w-3.5 h-3.5" aria-hidden="true" />
              {queue.repeatMode === "single" && (
                <span className="absolute -top-0.5 -right-0.5 text-[8px] font-bold leading-none">1</span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={audio.togglePlay}
              className="rounded-full h-9 w-9 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-800"
              aria-label={audio.isPlaying ? "Jeda" : "Putar"}
            >
              {audio.isLoadingAudio ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : audio.isPlaying ? (
                <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" aria-hidden="true" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={queue.next}
              disabled={queue.currentIndex >= queue.queue.length - 1 && queue.repeatMode !== "queue"}
              className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Surah berikutnya dalam antrian"
            >
              <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
            </Button>
          </div>
        )}

        {expanded && (
          <div className="pt-2 border-t border-emerald-500/20 space-y-2 animate-fade-in">
            {!showRangePicker ? (
              <div className="grid grid-cols-2 gap-1.5">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handlePlayFull}
                  className="rounded-full h-8 text-xs gap-1.5 bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800"
                  disabled={!surahList}
                >
                  <ListMusic className="w-3.5 h-3.5" aria-hidden="true" />
                  Full 1-114
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRangePicker(true)}
                  className="rounded-full h-8 text-xs gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                  Pilih Range
                </Button>
              </div>
            ) : (
              <RangePicker
                fromNomor={fromNomor}
                toNomor={toNomor}
                onFromChange={setFromNomor}
                onToChange={setToNomor}
                onPlay={handlePlayRange}
                onCancel={() => setShowRangePicker(false)}
                surahList={surahList}
              />
            )}

            {queue.isActive && (
              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                Audio akan otomatis lanjut ke surah berikutnya. Tap X untuk berhenti.
              </p>
            )}
          </div>
        )}
      </CardContent>

      {dropdownOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            data-queue-dropdown
            className="fixed z-[60] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
            style={{
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
            }}
            role="listbox"
            aria-label="Antrian surah"
          >
            <div className="px-3 py-2.5 border-b border-border/60 bg-gradient-to-br from-emerald-500/8 to-transparent">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Antrian Baca
                </p>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {queue.totalInQueue} surah
                </span>
              </div>
              <div className="relative">
                <Search
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={queueSearch}
                  onChange={(e) => setQueueSearch(e.target.value)}
                  placeholder="Cari surah..."
                  className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-border/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  aria-label="Cari surah dalam antrian"
                  autoFocus
                />
              </div>
            </div>

            <div
              ref={listRef}
              className="overflow-y-auto p-1.5"
              style={{ maxHeight: "min(60vh, 480px)" }}
            >
              {filteredQueueItems.length === 0 ? (
                <div className="text-center py-8 px-4 text-muted-foreground">
                  <Search
                    className="w-5 h-5 mx-auto mb-2 opacity-50"
                    aria-hidden="true"
                  />
                  <p className="text-xs font-medium">Tidak ada surah yang cocok</p>
                  <p className="text-[10px] mt-0.5">Coba kata kunci lain</p>
                </div>
              ) : (
                filteredQueueItems.map((item) => {
                  const isPlayingThis =
                    item.isCurrent &&
                    audio.isPlaying &&
                    audio.currentSurah === item.nomor;
                  return (
                    <button
                      key={item.nomor}
                      data-current={item.isCurrent}
                      onClick={() => handleJumpTo(item.queueIndex)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors",
                        item.isCurrent
                          ? "bg-emerald-500/15"
                          : "hover:bg-muted active:scale-[0.99]",
                      )}
                      role="option"
                      aria-selected={item.isCurrent}
                      aria-label={`${item.nomor}. ${item.namaLatin}${
                        item.isCurrent ? " (sedang diputar)" : ""
                      }`}
                    >
                      <span
                        className={cn(
                          "shrink-0 w-7 h-7 rounded-md text-[10px] font-bold tabular-nums flex items-center justify-center",
                          item.isCurrent
                            ? "bg-emerald-500 text-white shadow-sm"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {item.nomor}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-xs font-medium truncate",
                            item.isCurrent
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-foreground",
                          )}
                        >
                          {item.namaLatin}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {item.tempatTurun} • {item.jumlahAyat} ayat
                        </p>
                      </div>
                      {item.isCurrent && (
                        <div className="shrink-0">
                          {isPlayingThis ? (
                            <Volume2
                              className="w-3.5 h-3.5 text-emerald-600 animate-pulse"
                              aria-hidden="true"
                            />
                          ) : (
                            <Check
                              className="w-3.5 h-3.5 text-emerald-600"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body,
        )}
    </Card>
  );
}

// ============================================================================
// Sub-komponen: RangePicker dengan tampilan nama latin
// ============================================================================

interface RangePickerProps {
  fromNomor: number;
  toNomor: number;
  onFromChange: (n: number) => void;
  onToChange: (n: number) => void;
  onPlay: () => void;
  onCancel: () => void;
  surahList: { nomor: number; namaLatin: string; tempatTurun?: string; jumlahAyat?: number }[] | undefined;
}

function RangePicker({ fromNomor, toNomor, onFromChange, onToChange, onPlay, onCancel, surahList }: RangePickerProps) {
  // Lookup nama latin dari nomor
  const fromSurah = useMemo(
    () => surahList?.find((s) => s.nomor === fromNomor),
    [surahList, fromNomor],
  );
  const toSurah = useMemo(
    () => surahList?.find((s) => s.nomor === toNomor),
    [surahList, toNomor],
  );

  const totalCount = Math.abs(toNomor - fromNomor) + 1;
  // Determine direction: dari ≤ sampai atau sebaliknya
  const isReversed = fromNomor > toNomor;
  const displayFrom = Math.min(fromNomor, toNomor);
  const displayTo = Math.max(fromNomor, toNomor);

  return (
    <div className="space-y-2 animate-fade-in">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        Pilih rentang surah
      </p>
      <div className="grid grid-cols-2 gap-2">
        <RangeStepper
          label="Dari"
          value={fromNomor}
          namaLatin={fromSurah?.namaLatin}
          onChange={onFromChange}
        />
        <RangeStepper
          label="Sampai"
          value={toNomor}
          namaLatin={toSurah?.namaLatin}
          onChange={onToChange}
        />
      </div>

      {/* Ringkasan rentang */}
      <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/20 px-2.5 py-2 space-y-0.5">
        <p className="text-[10px] text-muted-foreground leading-tight">
          Akan memutar {totalCount} surah:
        </p>
        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 leading-tight">
          {displayFrom}. {fromNomor === displayFrom ? fromSurah?.namaLatin : toSurah?.namaLatin}
          {displayFrom !== displayTo && (
            <>
              {" → "}
              {displayTo}. {toNomor === displayTo ? toSurah?.namaLatin : fromSurah?.namaLatin}
            </>
          )}
        </p>
        {isReversed && (
          <p className="text-[9px] text-amber-600 dark:text-amber-400 leading-tight italic">
            ⚠️ Urutan terbalik — akan diputar dari {displayTo} ke {displayFrom}
          </p>
        )}
      </div>

      <div className="flex gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="rounded-full flex-1 h-8 text-xs"
        >
          Batal
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onPlay}
          className="rounded-full flex-1 h-8 text-xs gap-1.5 bg-gradient-to-br from-emerald-500 to-emerald-700"
        >
          <Play className="w-3 h-3 fill-current" aria-hidden="true" />
          Mulai
        </Button>
      </div>
    </div>
  );
}

interface RangeStepperProps {
  label: string;
  value: number;
  /** Nama latin surah — tampil di bawah angka supaya user tahu yang dipilih */
  namaLatin?: string;
  onChange: (n: number) => void;
}

function RangeStepper({ label, value, namaLatin, onChange }: RangeStepperProps) {
  const decrement = () => onChange(Math.max(1, value - 1));
  const increment = () => onChange(Math.min(114, value + 1));

  return (
    <div className="rounded-xl border border-border/60 bg-card p-2">
      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1 text-center">
        {label}
      </p>
      <div className="flex items-center justify-between gap-1">
        <button
          onClick={decrement}
          disabled={value <= 1}
          className="w-7 h-7 rounded-full hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-muted-foreground shrink-0"
          aria-label={`Kurangi ${label}`}
        >
          <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <span className="text-base font-bold text-foreground tabular-nums">{value}</span>
        <button
          onClick={increment}
          disabled={value >= 114}
          className="w-7 h-7 rounded-full hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-muted-foreground shrink-0"
          aria-label={`Tambah ${label}`}
        >
          <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
      {namaLatin && (
        <p
          className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium truncate text-center mt-1 px-0.5"
          title={namaLatin}
        >
          {namaLatin}
        </p>
      )}
    </div>
  );
}