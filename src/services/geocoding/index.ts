/**
 * @file Geocoding service for city search with Open-Meteo and offline fallbacks
 */

import { LocationData, Result } from '@/types';
import { GeocodingResponseSchema } from '@/shared/lib/schemas';
import { POPULAR_CITIES } from '@/shared/lib/constants';
import { roundLocationCoords, sanitizeText } from '@/shared/lib/sanitize';

export async function searchCities(
  query: string,
  options: { timeoutMs?: number } = {}
): Promise<Result<LocationData[]>> {
  const cleanQuery = sanitizeText(query, 50);
  if (!cleanQuery || cleanQuery.length < 2) {
    return { ok: true, data: [] };
  }

  const { timeoutMs = 5000 } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    cleanQuery
  )}&count=6&language=en&format=json`;

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`Geocoding HTTP error ${res.status}`);
    }

    const json = await res.json();
    const parsed = GeocodingResponseSchema.safeParse(json);

    if (!parsed.success) {
      throw new Error('Invalid geocoding response structure');
    }

    const results = parsed.data.results || [];
    const locations: LocationData[] = results.map((item) => {
      const rounded = roundLocationCoords(item.latitude, item.longitude);
      const parts = [item.name, item.admin1, item.country].filter(Boolean);
      return {
        name: parts.join(', '),
        latitude: rounded.latitude,
        longitude: rounded.longitude,
        isSample: false,
      };
    });

    return { ok: true, data: locations };
  } catch {
    clearTimeout(timer);
    // Offline / error fallback to filtered popular cities
    const lower = cleanQuery.toLowerCase();
    const fallbackMatches = POPULAR_CITIES.filter((c) =>
      c.name.toLowerCase().includes(lower)
    ).map((c) => {
      const rounded = roundLocationCoords(c.latitude, c.longitude);
      return {
        name: c.name,
        latitude: rounded.latitude,
        longitude: rounded.longitude,
        isSample: true,
      };
    });

    return { ok: true, data: fallbackMatches };
  }
}
