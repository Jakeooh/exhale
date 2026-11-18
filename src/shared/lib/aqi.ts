/**
 * @file AQI calculations, categorization, WHO comparison, and outdoor window evaluation
 */

import { AQICategory, HourlyForecastItem, BestOutdoorWindow } from '@/types';
import { AQI_THRESHOLDS, WHO_GUIDELINES, AQI_CATEGORY_CONFIG } from './constants';

/**
 * Maps numeric US AQI (0-500+) to AQICategory.
 */
export function getAQICategory(aqi: number): AQICategory {
  if (aqi <= AQI_THRESHOLDS.GOOD_MAX) return 'good';
  if (aqi <= AQI_THRESHOLDS.MODERATE_MAX) return 'moderate';
  if (aqi <= AQI_THRESHOLDS.SENSITIVE_MAX) return 'sensitive';
  if (aqi <= AQI_THRESHOLDS.UNHEALTHY_MAX) return 'unhealthy';
  if (aqi <= AQI_THRESHOLDS.VERY_UNHEALTHY_MAX) return 'very_unhealthy';
  return 'hazardous';
}

/**
 * Calculates PM2.5 ratio compared to the WHO 24-hour mean guideline (15 µg/m³).
 */
export function calculateWhoComparison(pm25UgM3: number): {
  multiplier: number;
  text: string;
} {
  if (pm25UgM3 <= 0) {
    return { multiplier: 0, text: 'Within WHO 24-hr guideline' };
  }

  const multiplier = Math.round((pm25UgM3 / WHO_GUIDELINES.PM25_DAILY_UG_M3) * 10) / 10;

  if (multiplier <= 1.0) {
    return {
      multiplier,
      text: 'Within WHO 24-hr guideline (≤ 15 µg/m³)',
    };
  }

  return {
    multiplier,
    text: `PM2.5 is ${multiplier}x the WHO 24-hr guideline`,
  };
}

/**
 * Evaluates 24-hour forecast data to determine the optimal window for outdoor activities.
 * Handles edge cases: all-bad days (smog inversion), all-good days, and sparse datasets.
 */
export function evaluateBestOutdoorWindow(hourly: HourlyForecastItem[]): BestOutdoorWindow {
  if (!hourly || hourly.length === 0) {
    return {
      start: '12:00 PM',
      end: '3:00 PM',
      avgAqi: 100,
      status: 'acceptable',
      advice: 'Air data unavailable. Prefer early afternoon when thermal winds typically mix surface air.',
    };
  }

  // Filter daylight / active hours between 06:00 and 20:00 if possible, fallback to all
  const activeHours = hourly.filter((h) => {
    const hourNum = parseInt(h.time.split(':')[0], 10);
    return !isNaN(hourNum) && hourNum >= 6 && hourNum <= 20;
  });

  const candidates = activeHours.length >= 3 ? activeHours : hourly;

  // Check if ALL hours are hazardous or very unhealthy (all-bad day)
  const minAqiOverall = Math.min(...candidates.map((h) => h.aqi));
  const maxAqiOverall = Math.max(...candidates.map((h) => h.aqi));

  if (minAqiOverall >= 200) {
    return {
      start: 'All Day',
      end: 'All Day',
      avgAqi: Math.round(minAqiOverall),
      status: 'avoid_all_day',
      advice: 'Hazardous/Very Unhealthy air all day. No safe outdoor window today — keep exercise and sensitive individuals indoors.',
    };
  }

  // Check if ALL hours are good (all-good day)
  if (maxAqiOverall <= 50) {
    return {
      start: '8:00 AM',
      end: '6:00 PM',
      avgAqi: Math.round((minAqiOverall + maxAqiOverall) / 2),
      status: 'recommended',
      advice: 'Air is clean and safe all day. Any daylight window is ideal for outdoor walks, exercise, and airing out your home.',
    };
  }

  // Sliding 2-3 hour window search for minimum average AQI
  let bestStartIdx = 0;
  let lowestWindowAvg = Infinity;
  const windowSize = Math.min(3, candidates.length);

  for (let i = 0; i <= candidates.length - windowSize; i++) {
    const windowSlice = candidates.slice(i, i + windowSize);
    const avg = windowSlice.reduce((sum, item) => sum + item.aqi, 0) / windowSize;
    if (avg < lowestWindowAvg) {
      lowestWindowAvg = avg;
      bestStartIdx = i;
    }
  }

  const bestSlice = candidates.slice(bestStartIdx, bestStartIdx + windowSize);
  const startHour = bestSlice[0]?.hourLabel || bestSlice[0]?.time || '1:00 PM';
  const endHour = bestSlice[bestSlice.length - 1]?.hourLabel || bestSlice[bestSlice.length - 1]?.time || '4:00 PM';
  const roundedAvg = Math.round(lowestWindowAvg);

  const status: BestOutdoorWindow['status'] = roundedAvg <= 100 ? 'recommended' : 'acceptable';
  const advice =
    roundedAvg <= 100
      ? `Lowest particulate levels of the day (${roundedAvg} AQI). Ideal for essential outdoor errands and brief walks.`
      : `Moderate smog dip (${roundedAvg} AQI) as daytime heat disperses the inversion layer. Limit intense cardio outside.`;

  return {
    start: startHour,
    end: endHour,
    avgAqi: roundedAvg,
    status,
    advice,
  };
}

/**
 * Returns human-readable label and color configuration for an AQI value.
 */
export function getAQIMeta(aqi: number) {
  const category = getAQICategory(aqi);
  return AQI_CATEGORY_CONFIG[category];
}
