import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSurahList, getAudioUrl } from "@/lib/api";

interface AudioContextValue {
  currentSurah: number | null;
  currentSurahName: string;
  audioUrl: string;
  isPlaying: boolean;
  progress: number;
  duration: number;
  error: string | null;
  play: (surahNumber: number, surahName: string) => void;
  togglePlay: () => void;
  stop: () => void;
  seek: (time: number) => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

function getAudioErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === "NotAllowedError") {
      return "Klik tombol play untuk memulai audio (browser memerlukan interaksi).";
    }
    if (error.name === "NotSupportedError") {
      return "Format audio tidak didukung oleh browser.";
    }
    if (error.name === "AbortError") {
      return "Pemutaran audio dibatalkan.";
    }
    return error.message || "Gagal memutar audio.";
  }
  return "Gagal memutar audio. Silakan coba lagi.";
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSurah, setCurrentSurah] = useState<number | null>(null);
  const [currentSurahName, setCurrentSurahName] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { data: surahList } = useQuery({
    queryKey: ["surah-list"],
    queryFn: fetchSurahList,
    staleTime: Infinity,
  });

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMetadata = () => {
      if (isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onDurationChange = () => {
      if (isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onPlay = () => {
      setIsPlaying(true);
      setError(null);
    };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      // Auto-next surah
      setCurrentSurah((prev) => {
        if (prev && prev < 114) {
          const next = prev + 1;
          const nextSurahInfo = surahList?.find((s) => s.nomor === next);
          const nextName = nextSurahInfo?.namaLatin || `Surah ${next}`;
          // Use setTimeout to avoid setState during render
          setTimeout(() => play(next, nextName), 0);
          return prev; // Keep current until play() updates it
        }
        setTimeout(() => stop(), 0);
        return prev;
      });
    };
    const onError = () => {
      const mediaError = audio.error;
      let message = "Gagal memuat audio.";
      if (mediaError) {
        switch (mediaError.code) {
          case 1: // MEDIA_ERR_ABORTED
            message = "Pemutaran audio dibatalkan.";
            break;
          case 2: // MEDIA_ERR_NETWORK
            message = "Gagal memuat audio. Periksa koneksi internet Anda.";
            break;
          case 3: // MEDIA_ERR_DECODE
            message = "Format audio tidak dapat diputar.";
            break;
          case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
            message = "Sumber audio tidak didukung atau tidak ditemukan.";
            break;
        }
      }
      console.error("[Audio Error]", { code: mediaError?.code, message });
      setError(message);
      setIsPlaying(false);
    };
    const onStalled = () => {
      // Audio stalled - buffering
    };
    const onCanPlay = () => {
      setError(null);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("stalled", onStalled);
    audio.addEventListener("canplay", onCanPlay);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("stalled", onStalled);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeAttribute("src");
      audio.load();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surahList]);

  const play = useCallback((surahNumber: number, surahName: string) => {
    const audio = audioRef.current;
    if (!audio) {
      console.error("[Audio] Audio element not initialized");
      return;
    }
    const url = getAudioUrl(surahNumber);
    console.log(`[Audio] Playing surah ${surahNumber}: ${surahName}`, url);
    setCurrentSurah(surahNumber);
    setCurrentSurahName(surahName);
    setAudioUrl(url);
    setProgress(0);
    setDuration(0);
    setError(null);

    // Set src and load
    audio.src = url;
    audio.load();

    // Attempt to play - must be in response to user interaction
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log(`[Audio] Successfully started surah ${surahNumber}`);
        })
        .catch((err) => {
          console.error("[Audio play failed]", {
            name: err?.name,
            message: err?.message,
            code: err?.code,
            surah: surahNumber,
          });
          setError(getAudioErrorMessage(err));
          setIsPlaying(false);
        });
    }
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.error("[Audio togglePlay failed]", err);
          setError(getAudioErrorMessage(err));
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.removeAttribute("src");
    audio.load();
    setCurrentSurah(null);
    setCurrentSurahName("");
    setAudioUrl("");
    setProgress(0);
    setDuration(0);
    setIsPlaying(false);
    setError(null);
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio || !isFinite(time)) return;
    audio.currentTime = Math.max(0, Math.min(time, audio.duration || 0));
    setProgress(audio.currentTime);
  }, []);

  return (
    <AudioContext.Provider
      value={{
        currentSurah,
        currentSurahName,
        audioUrl,
        isPlaying,
        progress,
        duration,
        error,
        play,
        togglePlay,
        stop,
        seek,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}