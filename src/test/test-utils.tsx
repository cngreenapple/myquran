import { type ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { BookmarkProvider } from "@/hooks/use-bookmarks";
import { NotesProvider } from "@/hooks/use-notes";
import { DzikirProvider } from "@/hooks/use-dzikir-counter";
import { ReadingStatsProvider } from "@/hooks/use-reading-stats";
import { LastReadProvider } from "@/hooks/use-last-read";
import { AppSettingsProvider } from "@/hooks/use-app-settings";
import { AudioProvider } from "@/contexts/audio-context";
import { AyatAudioProvider } from "@/contexts/ayat-audio-context";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

/**
 * Test wrapper yang wrap component dengan semua provider yang dibutuhkan.
 *
 * Pakai: render(<Component />, { wrapper: TestProviders })
 *
 * Includes:
 * - All Context Providers (Bookmark, Notes, Dzikir, etc)
 * - Audio providers (untuk test audio button behavior)
 * - TanStack Query (untuk components yang pakai useQuery)
 * - React Router (untuk Link, useNavigate, useLocation)
 * - Toast/Toaster (untuk showSuccess/showError)
 */
export function TestProviders({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AppSettingsProvider>
        <ReadingStatsProvider>
          <LastReadProvider>
            <BookmarkProvider>
              <NotesProvider>
                <DzikirProvider>
                  <AudioProvider>
                    <AyatAudioProvider>
                      <TooltipProvider>
                        <Toaster />
                        <Sonner />
                        <BrowserRouter>
                          {children}
                        </BrowserRouter>
                      </TooltipProvider>
                    </AyatAudioProvider>
                  </AudioProvider>
                </DzikirProvider>
              </NotesProvider>
            </BookmarkProvider>
          </LastReadProvider>
        </AppSettingsProvider>
      </AppSettingsProvider>
    </QueryClientProvider>
  );
}

export * from "@testing-library/react";

/**
 * Re-export render dengan default wrapper untuk test yang butuh
 * full provider stack. Untuk test yang tidak butuh semua provider,
 * import langsung dari @testing-library/react.
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: TestProviders, ...options });
}