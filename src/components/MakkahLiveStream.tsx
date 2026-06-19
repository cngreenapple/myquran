import { useState } from "react";
import { WifiOff, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Live stream Masjidil Haram — single embed dari video ID langsung.
 *
 * Embed dari video ID (`/embed/{videoId}`) lebih reliable dari
 * channel-based embed (`/live_stream?channel=`) karena:
 * - Tidak ada channel resolution (langsung ke video)
 * - Tidak ter-gate oleh status "live" channel
 * - Video spesifik `fZvuHkHYaXk` adalah live stream Ka'bah Saudi Quran TV
 *   yang aktif 24 jam
 *
 * Direct URL untuk fallback button (kalau embed gagal / disabled).
 */
const LIVE_STREAM = {
  id: "ka'bah-live",
  videoId: "fZvuHkHYaXk",
  name: "Masjidil Haram, Makkah",
  nameArabic: "المسجد الحرام",
  description:
    "Siaran langsung 24 jam dari Masjidil Haram dengan fokus utama Ka'bah dan area thawaf. Dilayani oleh channel Saudi Quran TV.",
  embedUrl: "https://www.youtube.com/embed/fZvuHkHYaXk?autoplay=1&mute=1",
  directUrl: "https://www.youtube.com/watch?v=fZvuHkHYaXk",
} as const;

interface LiveStreamProps {
  className?: string;
}

/**
 * Komponen live streaming Masjidil Haram.
 *
 * Simple — single embed iframe:
 * 1. Loading state (spinner) sampai iframe load event fire
 * 2. Playing state — iframe embed live
 * 3. Error state — kalau iframe error, tampilkan tombol "Buka YouTube"
 */
export function LiveStreamEmbed({ className }: LiveStreamProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleRetry = () => {
    setLoading(true);
    setError(false);
  };

  return (
    <Card
      className={cn(
        "overflow-hidden border-border/60",
        className,
      )}
    >
      <CardContent className="p-0">
        {/* Video container — 16:9 aspect ratio */}
        <div className="relative aspect-video bg-muted">
          {error ? (
            <ErrorState
              onRetry={handleRetry}
              directUrl={LIVE_STREAM.directUrl}
            />
          ) : (
            <>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                  <div className="text-center">
                    <Loader2
                      className="w-7 h-7 mx-auto animate-spin text-primary mb-2"
                      aria-hidden="true"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Memuat streaming...
                    </p>
                  </div>
                </div>
              )}
              <iframe
                key={LIVE_STREAM.id}
                src={LIVE_STREAM.embedUrl}
                title={LIVE_STREAM.name}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setError(true);
                }}
              />
            </>
          )}
        </div>

        {/* Stream info */}
        <div className="p-3.5">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  {error ? (
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground" />
                  ) : (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                    </>
                  )}
                </span>
                <span
                  className={cn(
                    "text-[9px] font-bold uppercase tracking-wider",
                    error
                      ? "text-muted-foreground"
                      : "text-rose-600 dark:text-rose-400",
                  )}
                >
                  {error ? "OFFLINE" : "LIVE 24 JAM"}
                </span>
              </div>
              <h3 className="font-bold text-foreground text-sm">
                {error ? "Streaming Tidak Tersedia" : LIVE_STREAM.name}
              </h3>
              <p
                className="font-arabic text-xs text-muted-foreground"
                dir="rtl"
                lang="ar"
              >
                {LIVE_STREAM.nameArabic}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="rounded-full shrink-0 h-8 w-8"
              aria-label="Buka di YouTube"
            >
              <a
                href={LIVE_STREAM.directUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {error
              ? "Streaming tidak dapat dimuat. Silakan buka di YouTube untuk menonton langsung."
              : LIVE_STREAM.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

interface ErrorStateProps {
  onRetry: () => void;
  directUrl: string;
}

function ErrorState({ onRetry, directUrl }: ErrorStateProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-5">
      <WifiOff
        className="w-9 h-9 text-muted-foreground mb-2.5"
        aria-hidden="true"
      />
      <p className="font-semibold text-foreground text-sm mb-1">
        Streaming tidak dapat dimuat
      </p>
      <p className="text-[11px] text-muted-foreground mb-3 max-w-xs">
        Buka di YouTube langsung untuk melihat live streaming Masjidil Haram.
      </p>
      <div className="flex gap-2 flex-wrap justify-center">
        <Button onClick={onRetry} variant="outline" size="sm" className="rounded-full h-8">
          <RefreshCw className="w-3 h-3 mr-1.5" aria-hidden="true" />
          Coba Lagi
        </Button>
        <Button asChild size="sm" className="rounded-full h-8">
          <a href={directUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3 h-3 mr-1.5" aria-hidden="true" />
            Buka YouTube
          </a>
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Backward-compatible exports
// ============================================================================

/**
 * @deprecated Gunakan `<LiveStreamEmbed />` langsung.
 */
export const MakkahLiveStream = LiveStreamEmbed;