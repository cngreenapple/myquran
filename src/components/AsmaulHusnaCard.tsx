import { memo } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AsmaulHusna } from "@/types/asmaul-husna";

interface AsmaulHusnaCardProps {
  asma: AsmaulHusna;
  onClick?: () => void;
  variant?: "default" | "compact";
}

const cardGradients = [
  "from-emerald-500/8 via-emerald-500/3 to-transparent",
  "from-amber-500/8 via-amber-500/3 to-transparent",
  "from-sky-500/8 via-sky-500/3 to-transparent",
  "from-violet-500/8 via-violet-500/3 to-transparent",
  "from-rose-500/8 via-rose-500/3 to-transparent",
];

function AsmaulHusnaCardComponent({
  asma,
  onClick,
  variant = "default",
}: AsmaulHusnaCardProps) {
  const gradient = cardGradients[asma.number % cardGradients.length];

  if (variant === "compact") {
    return (
      <button
        onClick={onClick}
        className={cn(
          "aspect-square rounded-2xl border border-border/60 bg-card hover:border-primary/40 transition-all p-2 flex flex-col items-center justify-center text-center group active:scale-95",
          `bg-gradient-to-br ${gradient}`,
        )}
      >
        <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary mb-1.5 group-hover:scale-110 transition-transform">
          {asma.number}
        </div>
        <p
          className="font-arabic text-lg sm:text-xl text-foreground leading-tight mb-0.5"
          dir="rtl"
        >
          {asma.arabic}
        </p>
        <p className="text-[10px] text-muted-foreground font-medium truncate w-full">
          {asma.meaningId}
        </p>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-2xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all p-4 group active:scale-[0.99] overflow-hidden relative",
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br pointer-events-none", gradient)} />
      <div className="relative flex items-center gap-3">
        {/* Number */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20 shrink-0">
          {asma.number}
        </div>

        {/* Arabic & Latin */}
        <div className="flex-1 min-w-0">
          <p
            className="font-arabic text-2xl sm:text-3xl text-foreground leading-tight"
            dir="rtl"
          >
            {asma.arabic}
          </p>
          <p className="text-sm font-semibold text-primary mt-0.5">
            {asma.latin}
          </p>
        </div>

        <Sparkles className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
      </div>

      <p className="relative text-sm text-foreground/80 mt-2.5 line-clamp-2 leading-relaxed">
        {asma.meaningId}
      </p>
    </button>
  );
}

export const AsmaulHusnaCard = memo(AsmaulHusnaCardComponent);