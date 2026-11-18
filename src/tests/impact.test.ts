import { describe, it, expect } from 'vitest';
import {
  calculateDailyInhaledPm25Ug,
  calculateCommuteWeeklyImpact,
  calculateWeeklyImpactTotal,
  formatEstimate,
  IMPACT_CONSTANTS,
} from '@/shared/lib/impact';
import { SustainableSwap, UserProfile } from '@/types';

describe('Impact Formulas: Personal PM2.5 Inhalation', () => {
  it('calculates unshielded adult baseline exposure correctly', () => {
    // 100 µg/m³ ambient PM2.5
    const ambient = 100;
    const exposure = calculateDailyInhaledPm25Ug(ambient, {
      isChild: false,
      hasPurifier: false,
      isSealed: false,
    });

    expect(exposure).toBeGreaterThan(0);
    // Standard infiltration 0.65, adult volume 16 m³
    // Weighted avg concentration ~ 100 * (0.65 * 0.85 + 1.0 * 0.15) = 70.25 µg/m³
    // Total inhaled = 70.25 * 16 = 1124 µg
    expect(exposure).toBeCloseTo(1124, -1);
  });

  it('shows significant reduction when HEPA purifier is active', () => {
    const baseline = calculateDailyInhaledPm25Ug(150, { hasPurifier: false });
    const withPurifier = calculateDailyInhaledPm25Ug(150, { hasPurifier: true });

    expect(withPurifier).toBeLessThan(baseline);
    const reductionPct = ((baseline - withPurifier) / baseline) * 100;
    expect(reductionPct).toBeGreaterThan(50);
  });

  it('shows child inhalation volume is scaled proportionally', () => {
    const adult = calculateDailyInhaledPm25Ug(100, { isChild: false });
    const child = calculateDailyInhaledPm25Ug(100, { isChild: true });

    expect(child).toBeLessThan(adult);
    expect(child / adult).toBeCloseTo(
      IMPACT_CONSTANTS.CHILD_DAILY_INHALATION_M3 / IMPACT_CONSTANTS.ADULT_DAILY_INHALATION_M3,
      1
    );
  });

  it('handles zero and negative ambient values safely', () => {
    expect(calculateDailyInhaledPm25Ug(0)).toBe(0);
    expect(calculateDailyInhaledPm25Ug(-50)).toBe(0);
  });
});

describe('Impact Formulas: Commute Weekly Emissions and Exposure', () => {
  it('calculates car emissions and transit savings', () => {
    const carImpact = calculateCommuteWeeklyImpact('car', 10, 100, 5);
    // 10 km * 2 * 5 days = 100 km. 100 km * 0.170 kg = 17.0 kg CO2e
    expect(carImpact.weeklyCo2eKg).toBeCloseTo(17.0, 1);

    const bikeImpact = calculateCommuteWeeklyImpact('bike', 10, 100, 5);
    expect(bikeImpact.weeklyCo2eKg).toBe(0);
  });

  it('handles negative distance edge cases', () => {
    const negImpact = calculateCommuteWeeklyImpact('car', -10, 100, 5);
    expect(negImpact.weeklyCo2eKg).toBe(0);
  });
});

describe('Impact Formulas: Weekly Totals & Estimate Labeling', () => {
  const dummySwaps: SustainableSwap[] = [
    {
      id: 'swap_1',
      category: 'commute',
      title: 'Metro Commute',
      currentChoice: 'Car',
      proposedSwap: 'Metro',
      tradeOff: 'Schedule',
      impact: {
        pm25AvoidedGramsWeekly: 0.8,
        co2eAvoidedKgWeekly: 4.5,
        exposureReductionPct: 35,
        explanation: 'Enclosed subway cabin with high-flow filtration',
        assumptionCitation: 'UK DEFRA GHG Factors',
      },
      adopted: true,
    },
    {
      id: 'swap_2',
      category: 'cooking',
      title: 'Induction Burner',
      currentChoice: 'Gas',
      proposedSwap: 'Electric',
      tradeOff: 'Pan fit',
      impact: {
        pm25AvoidedGramsWeekly: 1.2,
        co2eAvoidedKgWeekly: 2.5,
        exposureReductionPct: 25,
        explanation: 'Zero combustion NO2/PM2.5',
        assumptionCitation: 'LBNL Indoor Cooking Study',
      },
      adopted: false, // not adopted
    },
  ];

  const dummyProfile: UserProfile = {
    location: { name: 'City', latitude: 28.6, longitude: 77.2 },
    household: {
      membersCount: 3,
      ages: [35, 32, 6],
      hasSensitiveMembers: true,
      homeType: 'apartment',
      ventilation: { windows: 'standard', hasAC: true, hasPurifier: false },
      hasPets: false,
    },
    lifestyle: {
      commuteMode: 'car',
      commuteDistanceKm: 12,
      cookingFuel: 'gas',
      heatingMethod: 'space_heater',
      workEnvironment: 'office',
      budgetLevel: 'low',
    },
    onboardingCompleted: true,
    version: 1,
    updatedAt: new Date().toISOString(),
  };

  it('aggregates adopted swaps only', () => {
    const summary = calculateWeeklyImpactTotal(dummySwaps, dummyProfile, 120);

    expect(summary.adoptedSwapsCount).toBe(1);
    expect(summary.weeklyCo2eSavedKg).toBe(4.5);
    expect(summary.weeklyPm25ExposureReducedGrams).toBe(0.8);
    expect(summary.overallExposureReductionPct).toBeGreaterThan(0);
  });

  it('handles empty adopted swaps safely with zero totals', () => {
    const summary = calculateWeeklyImpactTotal([], dummyProfile, 100);
    expect(summary.adoptedSwapsCount).toBe(0);
    expect(summary.weeklyCo2eSavedKg).toBe(0);
    expect(summary.weeklyPm25ExposureReducedGrams).toBe(0);
    expect(summary.overallExposureReductionPct).toBe(0);
  });

  it('formats figures with transparent Est. label', () => {
    expect(formatEstimate(4.52, 'kg CO2e')).toBe('Est. 4.5 kg CO2e');
    expect(formatEstimate(0.812, 'grams', 2)).toBe('Est. 0.81 grams');
    expect(formatEstimate(NaN, 'units')).toBe('Est. 0 units');
  });
});
