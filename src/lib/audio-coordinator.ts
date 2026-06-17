/**
 * Audio Coordinator
 * - Menyinkronkan 2 audio context (full surah & per ayat) agar tidak saling bertabrakan
 * - Pakai custom event untuk decoupling antar context
 * - Saat satu mode mulai play, mode lain otomatis di-pause
 */

export type AudioMode = "surah" | "ayat";

export interface AudioCoordinationEvent {
  mode: AudioMode; // mode yang baru mulai play
  id: string; // identifier: "114" untuk surah, "114:6" untuk ayat
}

const STOP_EVENT = "quran-audio-coordination-stop";

/**
 * Broadcast event untuk memberitahu audio mode lain agar berhenti.
 * Dipanggil saat sebuah mode akan mulai play.
 */
export function broadcastStop(mode: AudioMode, id: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<AudioCoordinationEvent>(STOP_EVENT, {
      detail: { mode, id },
    }),
  );
}

/**
 * Subscribe ke stop event dari mode lain.
 * Callback dipanggil saat mode LAIN mulai play (mode yang sama diabaikan).
 * Returns cleanup function.
 */
export function subscribeToStop(
  callback: (event: AudioCoordinationEvent) => void,
): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<AudioCoordinationEvent>;
    callback(customEvent.detail);
  };

  window.addEventListener(STOP_EVENT, handler);
  return () => window.removeEventListener(STOP_EVENT, handler);
}