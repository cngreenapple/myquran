import { useState } from "react";
import { Video, Sparkles, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { AudioPlayer } from "@/components/AudioPlayer";
import { LiveStreamSelector } from "@/components/MakkahLiveStream";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { cn } from "@/lib/utils";

export default function LiveMakkahPage() {
  useDocumentTitle("Live Makkah & Madinah");

  return (
    <div className="min-h-dvh bg-background">
      <Header />

      <main
        className="container mx-auto px-4 py-6 pb-32 md:pb-12 max-w-4xl"
        aria-labelledby="live-title"
      >
        <section className="mb-6">
          <h1
            id="live-title"
            className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2"
          >
            <Video className="w-7 h-7 text-rose-500" aria-hidden="true" />
            Live Makkah & Madinah
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Siaran langsung 24 jam dari Masjidil Haram & Masjid Nabawi
          </p>
        </section>

        {/* Info card */}
        <Card className="border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent mb-5">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div
                className="shrink-0 w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center"
                aria-hidden="true"
              >
                <Sparkles className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground mb-1">
                  Saksikan Keindahan Tanah Suci
                </p>
                <p className="text-sm text-foreground/85 leading-relaxed">
                  Streaming langsung dari Masjidil Haram (Makkah) dan Masjid Nabawi
                  (Madinah). Gunakan untuk tafakkur, menyimak khutbah, atau melihat
                  suasana thawaf dan shalat berjamaah.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live stream selector */}
        <LiveStreamSelector />

        {/* Note */}
        <div className="mt-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-3">
          <Info
            className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="text-xs text-foreground/80 leading-relaxed">
            <p className="font-semibold text-foreground mb-1">Catatan</p>
            <p>
              Streaming disediakan oleh channel YouTube resmi. Koneksi internet yang
              stabil diperlukan untuk kualitas terbaik. Aplikasi tidak menyimpan
              konten streaming.
            </p>
          </div>
        </div>
      </main>

      <AudioPlayer />
    </div>
  );
}