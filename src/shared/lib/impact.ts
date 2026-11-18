/**
 * @file Exhale Environmental and Exposure Impact Formulas
 *
 * All formulas use documented, published environmental factors.
 * Every resulting figure is strictly treated and displayed as an ESTIMATE.
 * References:
 * - EPA Exposure Factors Handbook (Chapter 6: Inhalation Rates)
 * - EPA / DEFRA Greenhouse Gas Reporting Conversion Factors (Transport & Energy)
 * - Lawrence Berkeley National Laboratory (Indoor Air Quality & Ventilation Studies)
 * - WHO Air Quality Guidelines (2021 update)
 */

import { CommuteMode, CookingFuel, SustainableSwap, ImpactSummary, UserProfile } from '@/types';

/**
 * NAMED CONSTANTS & SCIENTIFIC ASSUMPTIONS
 */
export const IMPACT_CONSTANTS = {
  /** Adult average resting + light activity inhalation volume in m³/day (EPA Exposure Factors Handbook) */
  ADULT_DAILY_INHALATION_M3: 16.0,
  /** Child (ages 1-11) average inhalation volume in m³/day (EPA Exposure Factors Handbook) */
  CHILD_DAILY_INHALATION_M3: 10.0,
  /** Fraction of daily hours spent indoors (National Human Activity Pattern Survey - NHAPS ~87%) */
  INDOOR_HOURS_FRACTION: 0.85,
  /** Fraction of daily hours spent outdoors or in transit */
  OUTDOOR_HOURS_FRACTION: 0.15,

  /** Outdoor-to-indoor infiltration factor with closed standard windows (LBNL / EPA ~0.55-0.70) */
  INFILTRATION_STANDARD: 0.65,
  /** Infiltration factor with weatherstripped/sealed windows (LBNL residential studies) */
  INFILTRATION_SEALED: 0.38,
  /** Additional indoor PM2.5 reduction from operational HEPA or DIY Corsi-Rosenthal box filter */
  HEPA_REDUCTION_FACTOR: 0.72,

  /** Real-world wear-adjusted N95 / KN95 particulate reduction efficiency */
  N95_EFFECTIVE_EFFICIENCY: 0.88,
  /** Cloth or standard 3-ply surgical mask real-world PM2.5 efficiency */
  SURGICAL_MASK_EFFICIENCY: 0.35,

  /** CO2e kg emissions per passenger-kilometer (UK DEFRA 2023 / EPA GHG Hub) */
  EMISSIONS_KG_CO2E_PER_KM: {
    car: 0.170,
    two_wheeler: 0.078,
    public_transit: 0.042,
    bike: 0.0,
    walk: 0.0,
  } as Record<CommuteMode, number>,

  /** In-transit PM2.5 relative exposure multiplier compared to ambient outdoor */
  TRANSIT_EXPOSURE_MULTIPLIER: {
    walk: 1.0,
    bike: 1.15, // elevated due to higher ventilation rate during exertion
    two_wheeler: 1.25, // close proximity to vehicle tailpipe emissions
    car: 0.70, // cabin air filter / closed windows with recirculate
    public_transit: 0.60, // enclosed bus/subway with high-volume filtration
  } as Record<CommuteMode, number>,

  /** Weekly cooking emissions and PM2.5 generation (LBNL Indoor Cooking Emissions study) */
  COOKING_WEEKLY: {
    wood_biomass: { co2eKg: 14.5, pm25Grams: 9.8 },
    gas: { co2eKg: 4.2, pm25Grams: 2.1 },
    electric: { co2eKg: 1.6, pm25Grams: 0.4 },
  } as Record<CookingFuel, { co2eKg: number; pm25Grams: number }>,

  /** Micrograms to grams conversion */
  UG_TO_GRAMS: 1e-6,
} as const;

export const ASSUMPTION_CITATIONS = {
  inhalation: 'EPA Exposure Factors Handbook (16 m³/day adult respiratory baseline)',
  filtration: 'Lawrence Berkeley National Laboratory (72% PM2.5 indoor filtration with active HEPA/CR-box)',
  sealing: 'ASHRAE / LBNL residential infiltration standards (weatherstripping drops air infiltration to ~38%)',
  commute_emissions: 'UK DEFRA & US EPA GHG Emission Factors for passenger vehicles vs. transit',
  transit_exposure: 'Journal of Exposure Science & Environmental Epidemiology (tailpipe proximity factors)',
  cooking_emissions: 'LBNL Environmental Energy Technologies Division (unvented gas burners vs. induction)',
  n95_mask: 'NIOSH / CDC real-world filtration study for fitted N95 respirators',
} as const;

/**
 * Calculates estimated daily inhaled mass of PM2.5 in micrograms (µg).
 * Handles edge cases: non-negative, zero air pollution, custom household members.
 */
export function calculateDailyInhaledPm25Ug(
  ambientPm25UgM3: number,
  options: {
    isChild?: boolean;
    hasPurifier?: boolean;
    isSealed?: boolean;
    hoursOutdoors?: number;
    wearsN95Outdoors?: boolean;
  } = {}
): number {
  if (ambientPm25UgM3 <= 0) return 0;

  const {
    isChild = false,
    hasPurifier = false,
    isSealed = false,
    hoursOutdoors = 3.6,
    wearsN95Outdoors = false,
  } = options;

  const dailyVolumeM3 = isChild
    ? IMPACT_CONSTANTS.CHILD_DAILY_INHALATION_M3
    : IMPACT_CONSTANTS.ADULT_DAILY_INHALATION_M3;

  const outdoorHours = Math.max(0, Math.min(24, hoursOutdoors));
  const indoorHours = 24 - outdoorHours;

  const outdoorFraction = outdoorHours / 24;
  const indoorFraction = indoorHours / 24;

  // Indoor concentration calculation
  const baseInfiltration = isSealed
    ? IMPACT_CONSTANTS.INFILTRATION_SEALED
    : IMPACT_CONSTANTS.INFILTRATION_STANDARD;

  let indoorConcentration = ambientPm25UgM3 * baseInfiltration;
  if (hasPurifier) {
    indoorConcentration *= (1 - IMPACT_CONSTANTS.HEPA_REDUCTION_FACTOR);
  }

  // Outdoor inhaled concentration
  let outdoorConcentration = ambientPm25UgM3;
  if (wearsN95Outdoors) {
    outdoorConcentration *= (1 - IMPACT_CONSTANTS.N95_EFFECTIVE_EFFICIENCY);
  }

  const weightedAverageConcentration =
    (indoorConcentration * indoorFraction) + (outdoorConcentration * outdoorFraction);

  const totalInhaledUg = weightedAverageConcentration * dailyVolumeM3;
  return Math.max(0, Math.round(totalInhaledUg * 10) / 10);
}

/**
 * Calculates weekly commute emissions and outdoor exposure grams.
 */
export function calculateCommuteWeeklyImpact(
  mode: CommuteMode,
  distanceKmOneWay: number,
  ambientPm25UgM3: number,
  daysPerWeek = 5
): { weeklyCo2eKg: number; weeklyPm25AvoidedGrams: number } {
  const safeDistance = Math.max(0, distanceKmOneWay);
  const totalWeeklyKm = safeDistance * 2 * Math.max(0, daysPerWeek);

  const factor = IMPACT_CONSTANTS.EMISSIONS_KG_CO2E_PER_KM[mode] ?? 0;
  const weeklyCo2eKg = Math.round(totalWeeklyKm * factor * 100) / 100;

  // Micrograms inhaled in transit per week
  const hoursPerDayInTransit = (safeDistance / 25) * 2; // assume avg 25 km/h urban speed
  const transitMultiplier = IMPACT_CONSTANTS.TRANSIT_EXPOSURE_MULTIPLIER[mode] ?? 1.0;
  const hourlyInhalationM3 = IMPACT_CONSTANTS.ADULT_DAILY_INHALATION_M3 / 24;

  const weeklyTransitInhaledUg =
    ambientPm25UgM3 * transitMultiplier * hourlyInhalationM3 * hoursPerDayInTransit * daysPerWeek;

  const weeklyPm25AvoidedGrams =
    Math.round(weeklyTransitInhaledUg * IMPACT_CONSTANTS.UG_TO_GRAMS * 1000) / 1000;

  return { weeklyCo2eKg, weeklyPm25AvoidedGrams };
}

/**
 * Calculates overall weekly cumulative impact from user-adopted swaps.
 */
export function calculateWeeklyImpactTotal(
  adoptedSwaps: SustainableSwap[],
  profile?: UserProfile | null,
  currentPm25: number = 100
): ImpactSummary {
  if (!adoptedSwaps || adoptedSwaps.length === 0) {
    return {
      weeklyPm25ExposureReducedGrams: 0,
      weeklyCo2eSavedKg: 0,
      overallExposureReductionPct: 0,
      adoptedSwapsCount: 0,
    };
  }

  const activeSwaps = adoptedSwaps.filter((s) => s.adopted);
  if (activeSwaps.length === 0) {
    return {
      weeklyPm25ExposureReducedGrams: 0,
      weeklyCo2eSavedKg: 0,
      overallExposureReductionPct: 0,
      adoptedSwapsCount: 0,
    };
  }

  const weeklyPm25ExposureReducedGrams = activeSwaps.reduce(
    (acc, s) => acc + (s.impact.pm25AvoidedGramsWeekly || 0),
    0
  );

  const weeklyCo2eSavedKg = activeSwaps.reduce(
    (acc, s) => acc + (s.impact.co2eAvoidedKgWeekly || 0),
    0
  );

  // Compute baseline weekly inhaled particulate mass for the household
  const householdSize = profile?.household.membersCount || 2;
  const baselineAdultDailyUg = calculateDailyInhaledPm25Ug(currentPm25, {
    isChild: false,
    hasPurifier: false,
    isSealed: false,
  });
  const baselineWeeklyGrams =
    baselineAdultDailyUg * 7 * householdSize * IMPACT_CONSTANTS.UG_TO_GRAMS;

  let overallExposureReductionPct = 0;
  if (baselineWeeklyGrams > 0) {
    overallExposureReductionPct = Math.min(
      85,
      Math.round((weeklyPm25ExposureReducedGrams / baselineWeeklyGrams) * 100)
    );
  } else {
    overallExposureReductionPct = Math.min(
      85,
      activeSwaps.reduce((acc, s) => acc + (s.impact.exposureReductionPct || 0), 0)
    );
  }

  return {
    weeklyPm25ExposureReducedGrams: Math.round(weeklyPm25ExposureReducedGrams * 100) / 100,
    weeklyCo2eSavedKg: Math.round(weeklyCo2eSavedKg * 10) / 10,
    overallExposureReductionPct: Math.max(0, overallExposureReductionPct),
    adoptedSwapsCount: activeSwaps.length,
  };
}

/**
 * Formats a number with explicit 'Est.' label to prevent pseudo-precision claims.
 */
export function formatEstimate(value: number, unit: string, decimals = 1): string {
  const formatted = Number.isFinite(value) ? value.toFixed(decimals) : '0';
  return `Est. ${formatted} ${unit}`;
}
