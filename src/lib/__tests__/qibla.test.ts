import { describe, it, expect } from "vitest";
import {
  calculateQiblaBearing,
  calculateDistance,
  getCompassDirection,
  normalizeDeviceHeading,
  getRotationToQibla,
} from "@/lib/qibla";

describe("calculateDistance (Haversine)", () => {
  it("returns 0 for same point", () => {
    expect(calculateDistance(0, 0, 0, 0)).toBe(0);
  });

  it("calculates Jakarta to Makkah distance ~8500km", () => {
    // Jakarta: -6.2088, 106.8456
    // Makkah: 21.4225, 39.8262
    const distance = calculateDistance(-6.2088, 106.8456, 21.4225, 39.8262);
    // Reference: ~8537 km
    expect(distance).toBeGreaterThan(8000);
    expect(distance).toBeLessThan(9000);
  });

  it("is symmetric (a→b == b→a)", () => {
    const a = calculateDistance(0, 0, 10, 10);
    const b = calculateDistance(10, 10, 0, 0);
    expect(a).toBeCloseTo(b, 10);
  });
});

describe("calculateQiblaBearing", () => {
  it("returns bearing for Jakarta (should be ~295° = Barat-Barat-Laut)", () => {
    const result = calculateQiblaBearing(-6.2088, 106.8456);
    // Jakarta ke Makkah: ~295° (WNW)
    expect(result.bearing).toBeGreaterThan(290);
    expect(result.bearing).toBeLessThan(300);
  });

  it("returns bearing for Makkah itself (~0° variation)", () => {
    // If you're in Makkah, qibla is in any direction since you're already there
    // Bearing calculation still returns a value, but it should be relatively stable
    const result = calculateQiblaBearing(21.4225, 39.8262);
    expect(result.bearing).toBeGreaterThanOrEqual(0);
    expect(result.bearing).toBeLessThan(360);
  });

  it("returns bearing for Sydney (~277° = West)", () => {
    const result = calculateQiblaBearing(-33.8688, 151.2093);
    // Sydney to Makkah: ~277° (West)
    expect(result.bearing).toBeGreaterThan(270);
    expect(result.bearing).toBeLessThan(285);
  });

  it("includes distance to Ka'bah", () => {
    const result = calculateQiblaBearing(-6.2088, 106.8456);
    expect(result.distance).toBeGreaterThan(8000);
    expect(result.kaabaLat).toBe(21.4225);
    expect(result.kaabaLng).toBe(39.8262);
  });
});

describe("getCompassDirection", () => {
  it("returns Utara for 0°", () => {
    expect(getCompassDirection(0)).toBe("Utara");
  });

  it("returns Timur for 90°", () => {
    expect(getCompassDirection(90)).toBe("Timur");
  });

  it("returns Selatan for 180°", () => {
    expect(getCompassDirection(180)).toBe("Selatan");
  });

  it("returns Barat for 270°", () => {
    expect(getCompassDirection(270)).toBe("Barat");
  });

  it("handles intermediate directions", () => {
    expect(getCompassDirection(45)).toBe("Timur Laut");
    expect(getCompassDirection(135)).toBe("Tenggara");
    expect(getCompassDirection(225)).toBe("Barat Daya");
    expect(getCompassDirection(315)).toBe("Barat Laut");
  });
});

describe("normalizeDeviceHeading", () => {
  it("prefers webkitCompassHeading (iOS) when available", () => {
    const result = normalizeDeviceHeading({
      alpha: 0,
      webkitCompassHeading: 123,
    });
    expect(result).toBe(123);
  });

  it("uses alpha for Android (magnetic)", () => {
    const result = normalizeDeviceHeading({ alpha: 90 });
    // (360 - 90) % 360 = 270
    expect(result).toBe(270);
  });

  it("returns null if no heading available", () => {
    expect(normalizeDeviceHeading({ alpha: null })).toBeNull();
  });

  it("prefers webkitCompassHeading even if alpha also present", () => {
    const result = normalizeDeviceHeading({
      alpha: 90,
      webkitCompassHeading: 45,
    });
    expect(result).toBe(45);
  });
});

describe("getRotationToQibla", () => {
  it("returns 0 when device already facing qibla", () => {
    expect(getRotationToQibla(180, 180)).toBe(0);
  });

  it("returns positive rotation for clockwise", () => {
    // Qibla at 90°, device at 0° → need to rotate 90° clockwise
    expect(getRotationToQibla(90, 0)).toBe(90);
  });

  it("wraps around 360", () => {
    // Qibla at 30°, device at 350° → 40° clockwise (not 320°)
    expect(getRotationToQibla(30, 350)).toBe(40);
  });
});