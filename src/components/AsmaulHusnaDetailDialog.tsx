import { ChevronLeft, ChevronRight, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { AsmaulHusna } from "@/types/asmaul-husna";
import { showSuccess } from "@/utils/toast";

interface AsmaulHusnaDetailDialogProps {
  asma: AsmaulHusna | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export function AsmaulHusnaDetailDialog({
  asma,
  open,
  onOpenChange,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: AsmaulHusnaDetailDialogProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [asma?.number, open]);

  if (!asma) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${asma.arabic} (${asma.latin}) - ${asma.meaningId}`);
      setCopied(true);
      showSuccess("Tersalin ke clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-md w-[calc(100%-2rem)] p-0 overflow-hidden border-primary/20">
        <div className="relative">
          {/* Hero gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-amber-500/10" />
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="asma-pattern" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M16 0 L32 16 L16 32 L0 16 Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-emerald-700" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#asma-pattern)" />
            </svg>
          </div>

          <div className="relative p-6 sm:p-8">
            {/* Number badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 text-[10px] font-bold text-primary uppercase tracking-wider">
                Asma # {asma.number} / 99
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="rounded-full h-8 w-8"
                aria-label="Copy"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            {/* Arabic large */}
            <div className="text-center py-4">
              <p
                className="font-arabic text-5xl sm:text-6xl text-foreground leading-tight"
                dir="rtl"
                lang="ar"
              >
                {asma.arabic}
              </p>
            </div>

            {/* Latin */}
            <div className="text-center mb-4">
              <p className="text-xl sm:text-2xl font-bold text-primary">
                {asma.latin}
              </p>
              <p className="text-base text-foreground/90 font-medium mt-1">
                {asma.meaningId}
              </p>
              <p className="text-xs text-muted-foreground italic mt-0.5">
                {asma.meaningEn}
              </p>
            </div>

            {/* Benefit */}
            <div className="rounded-2xl bg-card/80 backdrop-blur border border-border/40 p-4 mt-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                ✨ Keutamaan
              </p>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {asma.benefit}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-2 mt-6">
              <Button
                variant="outline"
                onClick={onPrev}
                disabled={!hasPrev}
                className="rounded-full gap-1.5"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                onClick={onNext}
                disabled={!hasNext}
                className="rounded-full gap-1.5"
                size="sm"
              >
                Selanjutnya
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogTitle className="sr-only">{asma.latin} - {asma.meaningId}</DialogTitle>
        <DialogDescription className="sr-only">
          {asma.arabic} - {asma.meaningEn}. {asma.benefit}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}