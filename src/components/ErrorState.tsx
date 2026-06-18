import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Terjadi Kesalahan",
  message = "Gagal memuat data. Periksa koneksi internet Anda dan coba lagi.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in"
      role="alert"
      aria-live="assertive"
    >
      <div
        className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4"
        aria-hidden="true"
      >
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="default" aria-label="Coba memuat ulang">
          Coba Lagi
        </Button>
      )}
    </div>
  );
}