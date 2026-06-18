import { describe, it, expect, vi, beforeEach } from "vitest";
import { broadcastStop, subscribeToStop } from "@/lib/audio-coordinator";

describe("audio-coordinator", () => {
  beforeEach(() => {
    // Clean up window listeners
    vi.restoreAllMocks();
  });

  it("broadcastStop dispatches custom event", () => {
    const listener = vi.fn();
    window.addEventListener("quran-audio-coordination-stop", listener);

    broadcastStop("surah", "1");

    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual({ mode: "surah", id: "1" });

    window.removeEventListener("quran-audio-coordination-stop", listener);
  });

  it("subscribeToStop receives broadcast events", () => {
    const callback = vi.fn();
    const unsubscribe = subscribeToStop(callback);

    broadcastStop("ayat", "1:1");
    expect(callback).toHaveBeenCalledWith({ mode: "ayat", id: "1:1" });

    broadcastStop("surah", "2");
    expect(callback).toHaveBeenCalledWith({ mode: "surah", id: "2" });

    unsubscribe();
  });

  it("unsubscribe removes event listener", () => {
    const callback = vi.fn();
    const unsubscribe = subscribeToStop(callback);

    unsubscribe();

    broadcastStop("surah", "1");
    expect(callback).not.toHaveBeenCalled();
  });

  it("multiple subscribers all receive events", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const unsub1 = subscribeToStop(callback1);
    const unsub2 = subscribeToStop(callback2);

    broadcastStop("surah", "1");

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);

    unsub1();
    unsub2();
  });
});