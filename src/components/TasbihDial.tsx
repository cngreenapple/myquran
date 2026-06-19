import { memo, useState, useRef } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface TasbihDialProps {
  /** 0-100 percent */
  percent: number;
  /** Current count (e.g. 33 dari 33) */
  current: number;
  /** Target count */
  target: number;
  /** Color theme */
  color: "emerald" | "amber" | "sky" | "rose" | "violet";
  /** Tap handler — increment */
  onTap: () => void;
  /** Long-press handler — reset */
  onReset: () => void;
  /** True jika cycle sudah complete (visual cue) */
  isComplete: boolean;
}

const gradientMap: Record<TasbihDialProps["color"], { from: string; to: string; ring: string }> = {
  emerald: { from: "#10b981", to: "#047857", ring: "stroke-emerald-500" },
  amber: { from: "#f59e0b", to: "#b45309", ring: "stroke-amber-500" },
  sky: { from: "#0ea5e9", to: "#0369a1", ring: "stroke-sky-500" },
  rose: { from: "#f43f5e", to: "#9f1239", ring: "stroke-rose-500" },
  violet: { from: "#8b5cf6", to: "#5b21b6", ring: "stroke-violet-500" },
};

function TasbihDialComponent({
  percent,
  current,
  target,
  color,
  onTap,
  onReset,
  isComplete,
}: TasbihDialProps) {
  const [animating, setAnimating] = useState(false);
  const tapTimeoutRef = useRef<number | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const grad = gradientMap[color];

  // SVG ring geometry
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  const handleTapStart = () => {
    // Long-press detection (700ms) untuk reset
    longPressTimerRef.current = window.setTimeout(() => {
      onReset();
      if ("vibrate" in navigator) navigator.vibrate([30, 50, 30]);
    }, 700);
  };

  const handleTapEnd = (e: React.MouseEvent | React.TouchEvent) => {
    // Cancel long-press kalau release lebih awal
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    // Cegah event sintetis (jika onMouseDown trig onClick) di touch device
    const nativeEvent = e.nativeEvent as MouseEvent;
    if (nativeEvent && "pointerType" in nativeEvent) {
      const pt = (nativeEvent as PointerEvent).pointerType;
      if (pt === "touch") return; // touch sudah di-handle di onTouchEnd
    }

    onTap();
    if ("vibrate" in navigator) navigator.vibrate(15);

    setAnimating(true);
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = window.setTimeout(() => setAnimating(false), 180);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    onTap();
    if ("vibrate" in navigator) navigator.vibrate(15);
    setAnimating(true);
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = window.setTimeout(() => setAnimating(false), 180);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 select-none">
        {/* Outer pulse ring saat complete */}
        {isComplete && (
          <div className="absolute inset-0 rounded-full bg-emerald-500/15 animate-ping" aria-hidden="true" />
        )}

        {/* SVG progress ring */}
        <svg
          className="absolute inset-0 -rotate-90"
          viewBox="0 0 240 240"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`tasbih-grad-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={grad.from} />
              <stop offset="100%" stopColor={grad.to} />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-muted/40"
          />
          {/* Progress */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke={`url(#tasbih-grad-${color})`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.3s ease-out" }}
          />
        </svg>

        {/* Tap area */}
        <button
          type="button"
          onMouseDown={handleTapStart}
          onMouseUp={handleTapEnd}
          onMouseLeave={() => {
            if (longPressTimerRef.current) {
              clearTimeout(longPressTimerRef.current);
              longPressTimerRef.current = null;
            }
          }}
          onTouchStart={handleTapStart}
          onTouchEnd={handleTouchEnd}
          aria-label={`Tap untuk tambah counter. Saat ini ${current} dari ${target}. Tekan lama untuk reset.`}
          className={cn(
            "absolute inset-3 rounded-full flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-[0.98] transition-transform shadow-xl",
            `bg-gradient-to-br ${isComplete ? "from-emerald-500 to-emerald-700" : "from-card to-card"}`,
            animating && "scale-[0.98]",
          )}
        >
          {/* Counter angka besar */}
          <span
            className={cn(
              "text-6xl sm:text-7xl font-bold tabular-nums leading-none",
              isComplete ? "text-white" : "text-foreground",
            )}
          >
            {current}
          </span>

          {/* Target separator */}
          <span
            className={cn(
              "text-sm font-semibold tabular-nums",
              isComplete ? "text-emerald-50/90" : "text-muted-foreground",
            )}
          >
            dari {target}
          </span>

          {/* Instruction hint */}
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-wider mt-1",
              isComplete ? "text-emerald-50/80" : "text-muted-foreground/70",
            )}
          >
            {isComplete ? "✓ Selesai — Tap untuk mulai lagi" : "Tap untuk hitung"}
          </span>
        </button>
      </div>

      {/* Reset button (kecil, di bawah dial) */}
      <button
        type="button"
        onClick={onReset}
        className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1 rounded-full hover:bg-muted"
        aria-label="Reset counter"
      >
        <RotateCcw className="w-3 h-3" aria-hidden="true" />
        Reset counter
      </button>
      <p className="text-[9px] text-muted-foreground mt-1 italic">
        💡 Tekan lama tap area juga untuk reset
      </p>
    </div>
  );
}

export const TasbihDial = memo(TasbihDialComponent);