/**
 * @file Open-Meteo Air Quality Service
 * Fetches current AQI, pollutants, and hourly forecasts with 15-minute caching,
 * AbortController timeouts, Zod validation, and graceful offline fallback.
 */

import { AirQualityData, Result } from '@/types';
import { OpenMeteoAirQualitySchema } from '@/shared/lib/schemas';
import { getAQICategory, calculateWhoComparison, evaluateBestOutdoorWindow } from '@/shared/lib/aqi';
import { SAMPLE_AIR_QUALITY_DATA, STORAGE_KEYS } from '@/shared/lib/constants';
import { getStorageItem, setStorageItem } from '@/shared/lib/storage';
import { roundLocationCoords } from '@/shared/lib/sanitize';

interface CacheEntry {
  data: AirQualityData;
  timestamp: number;
  lat: number;
  lon: number;
}

let memoryCache: CacheEntry | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Fetches live air quality data from Open-Meteo API.
 */
export async function fetchAirQuality(
  latitude: number,
  longitude: number,
  options: { timeoutMs?: number; forceRefresh?: boolean } = {}
): Promise<Result<AirQualityData>> {
  const { timeoutMs = 8000, forceRefresh = false } = options;
  const rounded = roundLocationCoords(latitude, longitude);

  // Check in-memory and localStorage cache
  if (!forceRefresh) {
    const now = Date.now();
    if (
      memoryCache &&
      memoryCache.lat === rounded.latitude &&
      memoryCache.lon === rounded.longitude &&
      now - memoryCache.timestamp < CACHE_TTL_MS
    ) {
      return { ok: true, data: memoryCache.data };
    }

    const diskCache = getStorageItem<CacheEntry | null>(STORAGE_KEYS.AIR_CACHE, null);
    if (
      diskCache &&
      diskCache.lat === rounded.latitude &&
      diskCache.lon === rounded.longitude &&
      now - diskCache.timestamp < CACHE_TTL_MS
    ) {
      memoryCache = diskCache;
      return { ok: true, data: diskCache.data };
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${rounded.latitude}&longitude=${rounded.longitude}&current=us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone&hourly=us_aqi,pm2_5,pm10&forecast_days=2&timezone=auto`;

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`Open-Meteo responded with status ${response.status}`);
    }

    const json = await response.json();
    const parseResult = OpenMeteoAirQualitySchema.safeParse(json);

    if (!parseResult.success) {
      throw new Error(`Open-Meteo payload validation failed: ${parseResult.error.message}`);
    }

    const payload = parseResult.data;
    const current = payload.current || {};
    const currentAqi = Math.round(current.us_aqi ?? 50);
    const pm25 = Math.round((current.pm2_5 ?? 15) * 10) / 10;
    const pm10 = Math.round((current.pm10 ?? 25) * 10) / 10;
    const no2 = Math.round((current.nitrogen_dioxide ?? 10) * 10) / 10;
    const o3 = Math.round((current.ozone ?? 30) * 10) / 10;

    // Hourly forecast parsing (next 24 hours)
    const hourlyTimes = payload.hourly?.time || [];
    const hourlyAqi = payload.hourly?.us_aqi || [];
    const hourlyPm25 = payload.hourly?.pm2_5 || [];
    const hourlyPm10 = payload.hourly?.pm10 || [];

    const parsedHourly = hourlyTimes.slice(0, 24).map((timeStr, idx) => {
      const aqiVal = Math.round(hourlyAqi[idx] ?? currentAqi);
      const pm25Val = Math.round((hourlyPm25[idx] ?? pm25) * 10) / 10;
      const pm10Val = Math.round((hourlyPm10[idx] ?? pm10) * 10) / 10;

      // Extract hour label (e.g., "2 PM")
      const date = new Date(timeStr);
      let hourLabel = `${date.getHours()}:00`;
      if (!isNaN(date.getTime())) {
        const hours = date.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        hourLabel = `${displayHours} ${ampm}`;
      }

      return {
        time: timeStr.includes('T') ? timeStr.split('T')[1].slice(0, 5) : timeStr,
        hourLabel,
        aqi: aqiVal,
        pm25: pm25Val,
        pm10: pm10Val,
      };
    });

    const bestWindow = evaluateBestOutdoorWindow(parsedHourly);
    const category = getAQICategory(currentAqi);
    const whoComparison = calculateWhoComparison(pm25);

    const resultData: AirQualityData = {
      aqi: currentAqi,
      category,
      categoryLabel: category.replace('_', ' ').toUpperCase(),
      mainPollutant: 'pm2_5',
      pm25,
      pm10,
      no2,
      o3,
      whoPm25Multiplier: whoComparison.multiplier,
      whoComparison: whoComparison.text,
      hourly: parsedHourly,
      bestOutdoorWindow: bestWindow,
      isSampleData: false,
      fetchedAt: new Date().toISOString(),
    };

    // Cache the result
    const cacheEntry: CacheEntry = {
      data: resultData,
      timestamp: Date.now(),
      lat: rounded.latitude,
      lon: rounded.longitude,
    };
    memoryCache = cacheEntry;
    setStorageItem(STORAGE_KEYS.AIR_CACHE, cacheEntry);

    return { ok: true, data: resultData };
  } catch (err: unknown) {
    clearTimeout(timer);
    const errorMsg = err instanceof Error ? err.message : 'Unknown air quality fetch error';

    return {
      ok: false,
      error: new Error(`Air quality live request failed (${errorMsg}). Activated sample data fallback.`),
    };
  }
}

/**
 * Returns default sample data immediately without network call.
 */
export function getSampleAirData(): AirQualityData {
  return {
    ...SAMPLE_AIR_QUALITY_DATA,
    isSampleData: true,
    fetchedAt: new Date().toISOString(),
  };
}
