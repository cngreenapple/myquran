import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQari } from "@/hooks/use-qari";
import type { QariInfo } from "@/lib/api";

interface QariSelectorProps {
  className?: string;
}

/**
 * Qari selector — list radio-style untuk memilih qari/reciter.
 * Bisa dipakai di Settings atau di mana saja.
 */
export function QariSelector({ className }: QariSelectorProps) {
  const { qariId, setQariId, qariList } = useQari();

  return (
    <div className={cn("space-y-1.5", className)} role="radiogroup" aria-label="Pilih qari (pembaca)">
      {qariList.map((qari) => (
        <QariOption
          key={qari.id}
          qari={qari}
          selected={qari.id === qariId}
          onSelect={() => setQariId(qari.id)}
        />
      ))}
    </div>
  );
}

interface QariOptionProps {
  qari: QariInfo;
  selected: boolean;
  onSelect: () => void;
}

function QariOption({ qari, selected, onSelect }: QariOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      role="radio"
      aria-checked={selected}
      aria-label={`${qari.name}${selected ? " (aktif)" : ""}`}
      className={cn(
        "w-full flex items-center gap-2.5 p-2.5 rounded-xl border-2 transition-all text-left",
        selected
          ? "border-primary bg-primary/10"
          : "border-border/60 bg-card hover:border-primary/30 hover:bg-muted/40",
      )}
    >
      {/* Radio indicator */}
      <div
        className={cn(
          "shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all",
          selected
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-muted text-muted-foreground",
        )}
      >
        {selected ? (
          <Check className="w-3.5 h-3.5" strokeWidth={3} aria-hidden="true" />
        ) : (
          <span className="w-2.5 h-2.5 rounded-full border-2 border-current" aria-hidden="true" />
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-semibold truncate",
            selected ? "text-primary" : "text-foreground",
          )}
        >
          {qari.name}
        </p>
      </div>
    </button>
  );
}