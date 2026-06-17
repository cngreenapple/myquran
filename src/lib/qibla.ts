/**
 * Qibla direction calculator
 * - Hitung arah dari lokasi user ke Ka'bah
 * - Pakai rumus great-circle pada sphere
 */

import { calculateDistance } from "./location";

const KAABA_LAT = 21.4225; // 21°25'21.2"N
const KAABA_LNG = 39.8262; // 39°49'34.0"E

export interface QiblaInfo {
  bearing: number; // 0-360° dari utara (searah jarum jam)
  distance: number; // km
  kaabaLat: number;
  kaabaLng: number;
}

/**
 * Hitung arah Qibla (bearing) dari lokasi user
 * Menggunakan rumus spherical law of cosines + atan2
 */
export function calculateQiblaBearing(lat: number, lng: number): QiblaInfo {
  const lat1 = (lat * Math.PI) / 180;
  const lat2 = (KAABA_LAT * Math.PI) / 180;
  const dLng = ((KAABA_LNG - lng) * Math.PI) / 180;

  // Formula: θ = atan2(sin(Δλ)·cos(φ2), cos(φ1)·sin(φ2) − sin(φ1)·cos(φ2)·cos(Δλ))
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  // Normalize ke 0-360
  bearing = (bearing + 360) % 360;

  return {
    bearing,
    distance: calculateDistance(lat, lng, KAABA_LAT, KAABA_LNG),
    kaabaLat: KAABA_LAT,
    kaabaLng: KAABA_LNG,
  };
}

/**
 * Determine arah mata angin dari bearing
 */
export function getCompassDirection(bearing: number): string {
  const directions = [
    { name: "Utara", short: "U" },
    { name: "Timur Laut", short: "TL" },
    { name: "Timur", short: "T" },
    { name: "Tenggara", short: "TG" },
    { name: "Selatan", short: "S" },
    { name: "Barat Daya", short: "BD" },
    { name: "Barat", short: "B" },
    { name: "Barat Laut", short: "BL" },
  ];
  // 360° / 8 = 45° per arah
  const index = Math.round(bearing / 45) % 8;
  return directions[index].name;
}

/**
 * Format jarak ke Ka'bah (km)
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  if (km < 1000) {
    return `${km.toFixed(1)} km`;
  }
  return `${Math.round(km).toLocaleString("id-ID")} km`;
}

/**
 * Tentukan apakah device perlu koreksi declinasi magnetik
 * iOS Safari & Android Chrome modern: webkitDeviceOrientationEvent.webkitCompassHeading
 * sudah include magnetic declination (heading = true north)
 *
 * Android (non-webkit) memberikan magnetic heading, perlu koreksi.
 */
export interface DeviceOrientation {
  alpha: number | null; // rotation z (0-360)
  // Untuk iOS webkit
  webkitCompassHeading?: number;
  webkitCompassAccuracy?: number;
}

/**
 * Normalize device orientation ke bearing utara sejati (0-360)
 * - iOS Safari: pakai webkitCompassHeading (sudah corrected)
 * - Android: pakai alpha (magnetic, perlu koreksi declination)
 */
export function normalizeDeviceHeading(orientation: DeviceOrientation): number | null {
  if (typeof orientation.webkitCompassHeading === "number") {
    return orientation.webkitCompassHeading;
  }
  if (typeof orientation.alpha === "number") {
    // Android: alpha = 0 saat device pointing north (tapi magnetic, bukan true)
    // Untuk koreksi magnetic declination, idealnya pakai API geolocation
    // Tapi sederhana-nya kita pakai asumsi declination = 0
    return (360 - orientation.alpha) % 360;
  }
  return null;
}

/**
 * Hitung angle antara device heading dan arah Qibla
 * Returns: 0 = tepat menghadap, 90 = 90° ke kanan
 */
export function getRotationToQibla(
  qiblaBearing: number,
  deviceHeading: number,
): number {
  return (qiblaBearing - deviceHeading + 360) % 360;
}