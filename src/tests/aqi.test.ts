import { describe, it, expect } from 'vitest';
import {
  getAQICategory,
  calculateWhoComparison,
  evaluateBestOutdoorWindow,
} from '@/shared/lib/aqi';
import { HourlyForecastItem } from '@/types';

describe('AQI Categorization Boundaries', () => {
  it('correctly maps standard EPA cutoffs', () => {
    expect(getAQICategory(0)).toBe('good');
    expect(getAQICategory(50)).toBe('good');
    expect(getAQICategory(51)).toBe('moderate');
    expect(getAQICategory(100)).toBe('moderate');
    expect(getAQICategory(101)).toBe('sensitive');
    expect(getAQICategory(150)).toBe('sensitive');
    expect(getAQICategory(151)).toBe('unhealthy');
    expect(getAQICategory(200)).toBe('unhealthy');
    expect(getAQICategory(201)).toBe('very_unhealthy');
    expect(getAQICategory(300)).toBe('very_unhealthy');
    expect(getAQICategory(301)).toBe('hazardous');
    expect(getAQICategory(500)).toBe('hazardous');
  });
});

describe('WHO Guideline Comparison Calculation', () => {
  it('handles safe levels within the 15 µg/m³ daily limit', () => {
    const res = calculateWhoComparison(12);
    expect(res.multiplier).toBe(0.8);
    expect(res.text).toContain('Within WHO 24-hr guideline');
  });

  it('calculates multipliers accurately for elevated particulate smog', () => {
    // 60 µg/m³ / 15 = 4.0x
    const res = calculateWhoComparison(60);
    expect(res.multiplier).toBe(4.0);
    expect(res.text).toBe('PM2.5 is 4x the WHO 24-hr guideline');

    // 168.4 µg/m³ / 15 = 11.2x
    const severe = calculateWhoComparison(168.4);
    expect(severe.multiplier).toBe(11.2);
    expect(severe.text).toBe('PM2.5 is 11.2x the WHO 24-hr guideline');
  });

  it('safely handles zero and negative numbers', () => {
    const zero = calculateWhoComparison(0);
    expect(zero.multiplier).toBe(0);
    expect(zero.text).toContain('Within WHO');

    const neg = calculateWhoComparison(-10);
    expect(neg.multiplier).toBe(0);
  });
});

describe('Best Window Selection Algorithm', () => {
  const normalHourly: HourlyForecastItem[] = [
    { time: '06:00', hourLabel: '6 AM', aqi: 220, pm25: 160, pm10: 220 },
    { time: '09:00', hourLabel: '9 AM', aqi: 240, pm25: 180, pm10: 250 },
    { time: '12:00', hourLabel: '12 PM', aqi: 150, pm25: 80, pm10: 120 },
    { time: '14:00', hourLabel: '2 PM', aqi: 85, pm25: 35, pm10: 60, isBestWindow: true },
    { time: '15:00', hourLabel: '3 PM', aqi: 80, pm25: 32, pm10: 55, isBestWindow: true },
    { time: '16:00', hourLabel: '4 PM', aqi: 90, pm25: 38, pm10: 65, isBestWindow: true },
    { time: '18:00', hourLabel: '6 PM', aqi: 190, pm25: 130, pm10: 190 },
    { time: '21:00', hourLabel: '9 PM', aqi: 250, pm25: 190, pm10: 270 },
  ];

  it('selects the lowest pollution contiguous window', () => {
    const result = evaluateBestOutdoorWindow(normalHourly);
    expect(result.status).toBe('recommended');
    expect(result.avgAqi).toBeLessThan(100);
    expect(result.start).toBe('2 PM');
    expect(result.end).toBe('4 PM');
  });

  it('handles all-bad hazardous smog days where minimum AQI is >= 200', () => {
    const allBadHourly: HourlyForecastItem[] = [
      { time: '06:00', hourLabel: '6 AM', aqi: 280, pm25: 230, pm10: 310 },
      { time: '10:00', hourLabel: '10 AM', aqi: 260, pm25: 210, pm10: 290 },
      { time: '14:00', hourLabel: '2 PM', aqi: 220, pm25: 170, pm10: 240 },
      { time: '18:00', hourLabel: '6 PM', aqi: 310, pm25: 260, pm10: 380 },
    ];

    const result = evaluateBestOutdoorWindow(allBadHourly);
    expect(result.status).toBe('avoid_all_day');
    expect(result.advice).toContain('No safe outdoor window today');
  });

  it('handles all-good clean air days where maximum AQI is <= 50', () => {
    const allGoodHourly: HourlyForecastItem[] = [
      { time: '06:00', hourLabel: '6 AM', aqi: 35, pm25: 9, pm10: 15 },
      { time: '12:00', hourLabel: '12 PM', aqi: 25, pm25: 6, pm10: 12 },
      { time: '18:00', hourLabel: '6 PM', aqi: 30, pm25: 8, pm10: 14 },
    ];

    const result = evaluateBestOutdoorWindow(allGoodHourly);
    expect(result.status).toBe('recommended');
    expect(result.advice).toContain('Air is clean and safe all day');
  });

  it('safely handles empty forecast datasets', () => {
    const emptyResult = evaluateBestOutdoorWindow([]);
    expect(emptyResult.start).toBeDefined();
    expect(emptyResult.advice).toBeDefined();
  });
});
