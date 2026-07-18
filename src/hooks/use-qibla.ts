import { useState, useEffect, useCallback, useRef } from "react";
import { calculateQiblaBearing, normalizeDeviceHeading, type QiblaInfo, type DeviceOrientation } from "@/lib/qibla";
import type { Location } from "@/lib/location";

export type PermissionState = "unknown" | "granted" | "denied" | "unsupported" | "prompt";

interface UseQiblaReturn {
  qibla: QiblaInfo | null;
  deviceHeading: number | null;
  rotation: number;
  isAligned: boolean;
  permission: PermissionState;
  requestPermission: () => Promise<PermissionState>;
  startTracking: () => void;
  stopTracking: () => void;
  isTracking: boolean;
  /** Apakah sensor orientation mengirim data */
  hasSignal: boolean;
  /** Apakah sedang dalam periode deteksi signal */
  isWaitingForSignal: boolean;
  /** Apakah heading masih null karena butuh kalibrasi */
  needsCalibration: boolean;
}

const ALIGN_TOLERANCE = 5; // degrees
const SIGNAL_TIMEOUT_MS = 10000; // 10 detik timeout deteksi sensor (sensor kadang lambat)

export function useQibla(location: Location | null): UseQiblaReturn {
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [permission, setPermission] = useState<PermissionState>("unknown");
  const [isTracking, setIsTracking] = useState(false);
  const [hasSignal, setHasSignal] = useState(false);
  const [isWaitingForSignal, setIsWaitingForSignal] = useState(false);
  const [needsCalibration, setNeedsCalibration] = useState(false);

 // Counter untuk logging — berapa banyak event orientation diterima
  const eventCountRef = useRef(0);

  // Ref untuk handler orientation — stabil, tidak pernah berubah referensinya
  const handleOrientationRef = useRef<(e: DeviceOrientationEvent) => void>((e: DeviceOrientationEvent) => {
    eventCountRef.current++;
    const orient: DeviceOrientationEvent = e;
    const heading = normalizeDeviceHeading({
      alpha: orient.alpha,
      webkitCompassHeading: (orient as unknown as { webkitCompassHeading?: number }).webkitCompassHeading,
      webkitCompassAccuracy: (orient as unknown as { webkitCompassAccuracy?: number }).webkitCompassAccuracy,
    });
    // Signal diterima = sensor aktif (meski heading null karena kalibrasi)
    setHasSignal(true);

    if (heading !== null) {
      setDeviceHeading(heading);
      setNeedsCalibration(false);
    } else if (eventCountRef.current <= 5) {
      console.log("[Qibla] Orientation event - heading null (kalibrasi?):", {
        alpha: orient.alpha,
        webkitCompassHeading: (orient as unknown as { webkitCompassHeading?: number }).webkitCompassHeading,
      });
      // Setelah beberapa event tanpa heading, tandai perlu kalibrasi
      if (eventCountRef.current >= 3) {
        setNeedsCalibration(true);
      }
    }
  });

  // Compute qibla info
  const qibla = location
    ? calculateQiblaBearing(location.lat, location.lng)
    : null;

  // Compute rotation
  const rotation = qibla && deviceHeading !== null
    ? (qibla.bearing - deviceHeading + 360) % 360
    : 0;

  const isAligned = qibla !== null && deviceHeading !== null && Math.abs(rotation) <= ALIGN_TOLERANCE;

  // Check support
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasDeviceOrientation = "DeviceOrientationEvent" in window;
    const hasPermissionApi = typeof (DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    }).requestPermission === "function";

    if (!hasDeviceOrientation) {
      setPermission("unsupported");
    } else if (!hasPermissionApi) {
      // Android: granted by default, no prompt needed
      setPermission("granted");
    }
  }, []);

  const requestPermissionAction = useCallback(async (): Promise<PermissionState> => {
    if (typeof window === "undefined") return "unsupported";

    const eventClass = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };

    if (typeof eventClass.requestPermission === "function") {
      try {
        const result = await eventClass.requestPermission();
        const state = result === "granted" ? "granted" : "denied";
        setPermission(state);
        return state;
      } catch (err) {
        console.error("[Qibla] Permission request failed", err);
        setPermission("denied");
        return "denied";
      }
    }

    setPermission("granted");
    return "granted";
  }, []);

  // Cek HTTPS saat mount
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";

  const startTracking = useCallback(() => {
    if (isTracking) return;

    console.log("[Qibla] Starting tracking...", {
      protocol: window.location.protocol,
      isHttps,
      permission,
    });

    if (!isHttps && typeof window !== "undefined") {
      console.warn("[Qibla] WARNING: Orientation sensor may not work over HTTP!");
    }

    // Reset counter
    eventCountRef.current = 0;

    const handler = handleOrientationRef.current;
    window.addEventListener("deviceorientation", handler, true);

    // Reset signal state
    setDeviceHeading(null);
    setHasSignal(false);
    setIsWaitingForSignal(true);
    setIsTracking(true);

    // Timeout: kalau SIGNAL_TIMEOUT_MS tidak ada signal, beri tahu user
    const timeoutId = setTimeout(() => {
      setIsWaitingForSignal(false);
      // Kalau masih belum ada signal, set hasSignal = false (tetap)
    }, SIGNAL_TIMEOUT_MS);

    (window as any).__qiblaTimeoutId = timeoutId;
  }, [isTracking, isHttps, permission]);

  const stopTracking = useCallback(() => {
    if (!isTracking) return;

    const handler = handleOrientationRef.current;
    window.removeEventListener("deviceorientation", handler, true);

    // Clear timeout
    const timeoutId = (window as any).__qiblaTimeoutId;
    if (timeoutId) {
      clearTimeout(timeoutId);
      (window as any).__qiblaTimeoutId = null;
    }

    setIsTracking(false);
    setIsWaitingForSignal(false);
    setDeviceHeading(null);
    setHasSignal(false);
    setNeedsCalibration(false);
  }, [isTracking]);

  // Cleanup on unmount
  useEffect(() => {
    const handler = handleOrientationRef.current;
    return () => {
      window.removeEventListener("deviceorientation", handler, true);
      const timeoutId = (window as any).__qiblaTimeoutId;
      if (timeoutId) {
        clearTimeout(timeoutId);
        (window as any).__qiblaTimeoutId = null;
      }
    };
  }, []);

  return {
    qibla,
    deviceHeading,
    rotation,
    isAligned,
    permission,
    requestPermission: requestPermissionAction,
    startTracking,
    stopTracking,
    isTracking,
    hasSignal,
    isWaitingForSignal,
    needsCalibration,
  };
}