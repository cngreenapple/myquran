import { useEffect, useState } from "react";
import { Compass, Loader2, Compass as CompassIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQibla } from "@/hooks/use-qibla";
import type { Location } from "@/lib/location";
import { cn } from "@/lib/utils";

interface QiblaCompassProps {
  location: Location | null;
}

export function QiblaCompass({ location }: QiblaCompassProps) {
  const {
    qibla,
    deviceHeading,
    rotation,
    isAligned,
    permission,
    requestPermission,
    startTracking,
    stopTracking,
    isTracking,
  } = useQibla(location);

  // Smooth rotation transition
  const [displayRotation, setDisplayRotation] = useState(0);

  useEffect(() => {
    let raf: number;
    const animate = () => {
      setDisplayRotation((prev) => {
        // Smoothly approach target rotation
        const target = rotation;
        const diff = ((target - prev + 540) % 360) - 180;
        if (Math.abs(diff) < 0.1) return target;
        return (prev + diff * 0.15 + 360) % 360;
      });
      raf = requestAnimationFrame(animate);
    };
    if (isTracking) {
      raf = requestAnimationFrame(animate);
    } else {
      setDisplayRotation(0);
    }
    return () => cancelAnimationFrame(raf);
  }, [rotation, isTracking]);

  const handleStart = async () => {
    if (permission === "prompt" || permission === "denied") {
      const result = await requestPermission();
      if (result === "granted") {
        startTracking();
      }
    } else if (permission === "granted") {
      startTracking();
    }
  };

  if (!location) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Compass Dial */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 mb-6">
        {/* Outer ring */}
        <div
          className={cn(
            "absolute inset-0 rounded-full border-4 transition-colors duration-500",
            isAligned
              ? "border-emerald-500 shadow-2xl shadow-emerald-500/30"
              : "border-border/60",
          )}
        />

        {/* Compass face */}
        <div
          className="absolute inset-2 rounded-full bg-gradient-to-br from-card to-muted shadow-inner overflow-hidden"
          style={{
            transform: isTracking ? `rotate(${-displayRotation}deg)` : undefined,
            transition: isTracking ? "none" : "transform 0.5s ease-out",
          }}
        >
          {/* Cardinal directions */}
          <div className="absolute inset-0">
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-foreground">
              U
            </span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground">
              S
            </span>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
              B
            </span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
              T
            </span>
          </div>

          {/* Tick marks */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
            {Array.from({ length: 72 }).map((_, i) => {
              const angle = i * 5;
              const isMajor = angle % 30 === 0;
              const isMid = angle % 10 === 0;
              const length = isMajor ? 12 : isMid ? 8 : 4;
              const opacity = isMajor ? 0.7 : isMid ? 0.4 : 0.2;
              return (
                <line
                  key={i}
                  x1="100"
                  y1="20"
                  x2="100"
                  y2={20 + length}
                  stroke="currentColor"
                  strokeWidth={isMajor ? 1.5 : 1}
                  opacity={opacity}
                  className="text-foreground"
                  transform={`rotate(${angle} 100 100)`}
                />
              );
            })}
            {/* Ka'bah indicator (qibla direction) */}
            <g transform={`rotate(${qibla?.bearing || 0} 100 100)`}>
              <path
                d="M 95 15 L 100 5 L 105 15 L 100 10 Z"
                fill="#059669"
                stroke="#047857"
                strokeWidth="0.5"
              />
              <text
                x="100"
                y="0"
                textAnchor="middle"
                className="fill-emerald-700 dark:fill-emerald-400"
                fontSize="8"
                fontWeight="bold"
                transform="rotate(0 100 0)"
              >
                Ka'bah
              </text>
            </g>
          </svg>

          {/* Center marker (device pointing direction) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>
        </div>

        {/* Fixed top pointer (device's "forward") */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[16px] border-t-emerald-600 dark:border-t-emerald-400" />
        </div>
      </div>

      {/* Status Text */}
      <div className="text-center mb-4 px-4">
        {isAligned ? (
          <div className="space-y-1">
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2">
              <Compass className="w-5 h-5" />
              Anda menghadap Ka'bah
            </p>
            <p className="text-xs text-muted-foreground">
              Arah sudah tepat
            </p>
          </div>
        ) : isTracking && qibla ? (
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {rotation < 180 ? `Putar ${Math.round(rotation)}° ke kanan` : `Putar ${Math.round(360 - rotation)}° ke kiri`}
            </p>
            <p className="text-xs text-muted-foreground">
              Arahkan perangkat Anda
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Arah Kiblat: {qibla?.bearing.toFixed(1)}°
            </p>
            <p className="text-xs text-muted-foreground">
              Jarak ke Ka'bah: {qibla ? (qibla.distance < 1000 ? `${qibla.distance.toFixed(0)} km` : `${(qibla.distance / 1000).toFixed(0)} ribu km`) : "-"}
            </p>
          </div>
        )}
      </div>

      {/* Action Button */}
      {!isTracking && (
        <Button
          onClick={handleStart}
          disabled={permission === "unsupported" || permission === "denied"}
          className="rounded-full gap-2"
          size="sm"
        >
          {permission === "prompt" || permission === "denied" ? (
            <>
              <AlertCircle className="w-4 h-4" />
              Izinkan Sensor
            </>
          ) : permission === "unsupported" ? (
            <>
              <CompassIcon className="w-4 h-4" />
              Sensor Tidak Didukung
            </>
          ) : (
            <>
              <Compass className="w-4 h-4" />
              Mulai Kompas
            </>
          )}
        </Button>
      )}

      {isTracking && (
        <Button
          onClick={stopTracking}
          variant="outline"
          className="rounded-full"
          size="sm"
        >
          Hentikan
        </Button>
      )}
    </div>
  );
}