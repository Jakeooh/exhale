import { describe, it, expect } from 'vitest';
import { generateLocalRuleBasedPlan } from '@/services/gemini/fallbackGenerator';
import { SAMPLE_PROFILES } from '@/shared/lib/constants';
import { getSampleAirData } from '@/services/airquality';
import { AirQualityData } from '@/types';

describe('Fallback Rule-Based Plan Generator', () => {
  const sampleAir = getSampleAirData();
  const youngFamilyProfile = SAMPLE_PROFILES[0].profile;
  const studentProfile = SAMPLE_PROFILES[2].profile;

  it('generates a complete 5-block day plan, indoor hacks, and swaps for Young Family profile', () => {
    const plan = generateLocalRuleBasedPlan(youngFamilyProfile, sampleAir);

    expect(plan.dayPlan).toHaveLength(5);
    expect(plan.dayPlan.map((b) => b.period)).toEqual([
      'morning',
      'commute',
      'midday',
      'evening',
      'night',
    ]);

    expect(plan.indoorHacks.length).toBeGreaterThanOrEqual(4);
    expect(plan.swaps.length).toBeGreaterThanOrEqual(4);

    // Each block must have at least 2 alternative options
    plan.dayPlan.forEach((block) => {
      expect(block.alternatives.length).toBeGreaterThanOrEqual(2);
      expect(block.activity.length).toBeGreaterThan(0);
      expect(block.recommendedAction.length).toBeGreaterThan(0);
    });
  });

  it('adapts advice for severe smog inversion (AQI > 150)', () => {
    const severeAir: AirQualityData = {
      ...sampleAir,
      aqi: 320,
      category: 'hazardous',
      categoryLabel: 'Hazardous',
      pm25: 275.5,
    };

    const plan = generateLocalRuleBasedPlan(youngFamilyProfile, severeAir);
    const morningBlock = plan.dayPlan.find((b) => b.period === 'morning');

    expect(morningBlock).toBeDefined();
    expect(morningBlock?.aqiAdvice.toLowerCase()).toContain('inversion');
    expect(morningBlock?.recommendedAction.toLowerCase()).toContain('windows locked');
  });

  it('adapts advice for acceptable air quality (AQI < 100)', () => {
    const goodAir: AirQualityData = {
      ...sampleAir,
      aqi: 45,
      category: 'good',
      categoryLabel: 'Good',
      pm25: 11.2,
    };

    const plan = generateLocalRuleBasedPlan(youngFamilyProfile, goodAir);
    const morningBlock = plan.dayPlan.find((b) => b.period === 'morning');

    expect(morningBlock).toBeDefined();
    expect(morningBlock?.recommendedAction.toLowerCase()).toContain('open windows');
  });

  it('customizes commute advice for active cyclists during severe smog', () => {
    const severeAir: AirQualityData = {
      ...sampleAir,
      aqi: 220,
      category: 'very_unhealthy',
    };

    const plan = generateLocalRuleBasedPlan(studentProfile, severeAir);
    const commuteBlock = plan.dayPlan.find((b) => b.period === 'commute');

    expect(commuteBlock).toBeDefined();
    expect(commuteBlock?.aqiAdvice.toLowerCase()).toContain('respiratory');
    expect(commuteBlock?.recommendedAction.toLowerCase()).toContain('n95');
  });

  it('generates high-efficacy indoor hacks including Corsi-Rosenthal box filter', () => {
    const plan = generateLocalRuleBasedPlan(youngFamilyProfile, sampleAir);
    const boxFanHack = plan.indoorHacks.find(
      (h) => h.title.toLowerCase().includes('corsi-rosenthal') || h.title.toLowerCase().includes('purifier')
    );

    expect(boxFanHack).toBeDefined();
    expect(boxFanHack?.effort).toBeDefined();
    expect(boxFanHack?.cost).toBeDefined();
    expect(boxFanHack?.expectedEffect).toBeDefined();
  });

  it('calculates saved emissions for sustainable swaps using profile commute distance', () => {
    const plan = generateLocalRuleBasedPlan(youngFamilyProfile, sampleAir);
    const carpoolSwap = plan.swaps.find((s) => s.category === 'commute');

    expect(carpoolSwap).toBeDefined();
    expect(carpoolSwap?.impact.co2eAvoidedKgWeekly).toBeGreaterThan(0);
    expect(carpoolSwap?.impact.pm25AvoidedGramsWeekly).toBeGreaterThanOrEqual(0);
    expect(carpoolSwap?.tradeOff.length).toBeGreaterThan(0);
  });
});
