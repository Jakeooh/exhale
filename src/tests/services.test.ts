import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchAirQuality } from '@/services/airquality';
import { searchCities } from '@/services/geocoding';
import { generateExhalePlan, streamAskExhale } from '@/services/gemini';
import { SAMPLE_PROFILES, SAMPLE_AIR_QUALITY_DATA } from '@/shared/lib/constants';

describe('Air Quality Service (with mocked fetch)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('successfully fetches and parses live air quality payload', async () => {
    const mockPayload = {
      latitude: 28.61,
      longitude: 77.21,
      current: {
        time: '2026-11-18T12:00',
        us_aqi: 185,
        pm2_5: 122.5,
        pm10: 180.0,
        nitrogen_dioxide: 42.0,
        ozone: 28.0,
      },
      hourly: {
        time: ['2026-11-18T00:00', '2026-11-18T01:00'],
        us_aqi: [190, 185],
        pm2_5: [130.0, 122.5],
        pm10: [190.0, 180.0],
      },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPayload,
    } as unknown as Response);

    const res = await fetchAirQuality(28.61, 77.21, { forceRefresh: true });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.aqi).toBe(185);
      expect(res.data.pm25).toBe(122.5);
      expect(res.data.category).toBe('unhealthy');
      expect(res.data.isSampleData).toBe(false);
    }
  });

  it('gracefully handles network HTTP errors', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    } as unknown as Response);

    const res = await fetchAirQuality(28.61, 77.21, { forceRefresh: true });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.message).toContain('failed');
    }
  });

  it('gracefully handles network abort / timeout', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new DOMException('The operation was aborted', 'AbortError'));

    const res = await fetchAirQuality(28.61, 77.21, { forceRefresh: true, timeoutMs: 10 });
    expect(res.ok).toBe(false);
  });
});

describe('Geocoding Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns matching cities from geocoding API', async () => {
    const mockGeoPayload = {
      results: [
        {
          name: 'London',
          latitude: 51.51,
          longitude: -0.13,
          country: 'United Kingdom',
        },
      ],
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockGeoPayload,
    } as unknown as Response);

    const res = await searchCities('London');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data[0].name).toContain('London');
      expect(res.data[0].latitude).toBe(51.51);
    }
  });

  it('falls back to popular city list when offline or fetch fails', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));

    const res = await searchCities('Delhi');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data[0].name).toContain('Delhi');
    }
  });
});

describe('Gemini Plan & Chat Assistant Service', () => {
  it('generates high-quality fallback plan when no API key is provided', async () => {
    const profile = SAMPLE_PROFILES[0].profile;
    const airQuality = SAMPLE_AIR_QUALITY_DATA;

    const res = await generateExhalePlan(profile, airQuality, { forceRefresh: true });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.plan.dayPlan.length).toBe(5);
      expect(res.data.plan.indoorHacks.length).toBeGreaterThanOrEqual(3);
      expect(res.data.plan.swaps.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('streams safe conversational advice token-by-token with safety disclaimer', async () => {
    const chunks: string[] = [];
    const airQuality = SAMPLE_AIR_QUALITY_DATA;
    const profile = SAMPLE_PROFILES[0].profile;

    const res = await streamAskExhale(
      'Is it OK for my kid to cycle to school today?',
      profile,
      airQuality,
      (chunk) => chunks.push(chunk)
    );

    expect(res.ok).toBe(true);
    expect(chunks.length).toBeGreaterThan(5);
    if (res.ok) {
      expect(res.data.toLowerCase()).toContain('cycling');
      expect(res.data.toLowerCase()).toContain('not medical advice');
    }
  });
});
