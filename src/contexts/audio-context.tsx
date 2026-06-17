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

// Daftar CDN fallback untuk audio murottal
const AUDIO_FALLBACK_URLS = [
  // equran.id - biasanya paling reliable untuk Indonesia
  (n: number) => `https://equran.id/media/audio/full/ar.alafasy/${n}.mp3`,
  // Islamic Network
  (n: number) => `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${n}.mp3`,
  // Archive.org
  (n: number) => `https://archive.org/download/Alafasy_128/${n.toString().padStart(3, "0")}.mp3`,
];

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fallbackIndexRef = useRef(0);
  const playPromiseRef = useRef<Promise<void> | null>(null);
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
          setTimeout(() => play(next, nextName), 0);
          return prev;
        }
        setTimeout(() => stop(), 0);
        return prev;
      });
    };
    const onError = () => {
      const mediaError = audio.error;
      console.error("[Audio Error]", {
        code: mediaError?.code,
        message: mediaError?.message,
        surah: currentSurah,
        src: audio.src,
      });

      // Try fallback URLs if not exhausted
      if (currentSurah && fallbackIndexRef.current < AUDIO_FALLBACK_URLS.length - 1) {
        fallbackIndexRef.current += 1;
        const nextUrl = AUDIO_FALLBACK_URLS[fallbackIndexRef.current](currentSurah);
        console.log(`[Audio] Trying fallback ${fallbackIndexRef.current}: ${nextUrl}`);
        setAudioUrl(nextUrl);
        audio.src = nextUrl;
        audio.load();
        audio.play().catch((err) => {
          console.error("[Audio fallback play failed]", err);
        });
        return;
      }

      let message = "Gagal memuat audio.";
      if (mediaError) {
        switch (mediaError.code) {
          case 1:
            message = "Pemutaran audio dibatalkan.";
            break;
          case 2:
            message = "Gagal memuat audio. Periksa koneksi internet Anda.";
            break;
          case 3:
            message = "Format audio tidak dapat diputar.";
            break;
          case 4:
            message = "Sumber audio tidak didukung atau tidak ditemukan.";
            break;
        }
      }
      setError(message);
      setIsPlaying(false);
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
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeAttribute("src");
      audio.load();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSurah, surahList]);

  const play = useCallback((surahNumber: number, surahName: string) => {
    const audio = audioRef.current;
    if (!audio) {
      console.error("[Audio] Audio element not initialized");
      return;
    }
    fallbackIndexRef.current = 0;
    const url = AUDIO_FALLBACK_URLS[0](surahNumber);
    console.log(`[Audio] Playing surah ${surahNumber}: ${surahName}`, url);
    setCurrentSurah(surahNumber);
    setCurrentSurahName(surahName);
    setAudioUrl(url);
    setProgress(0);
    setDuration(0);
    setError(null);

    audio.src = url;
    audio.load();

    const playPromise = audio.play();
    playPromiseRef.current = playPromise;
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
      playPromiseRef.current = playPromise;
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