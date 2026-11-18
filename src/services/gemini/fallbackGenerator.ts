/**
 * @file Built-in expert rule-based generator for Day Plans, Indoor Hacks, and Swaps
 * Ensures Exhale is 100% resilient and functional without an API key or when offline.
 */

import { UserProfile, AirQualityData, DayPlanBlock, IndoorHack, SustainableSwap } from '@/types';
import { GeminiGeneratedPlan } from '@/shared/lib/schemas';
import { calculateCommuteWeeklyImpact } from '@/shared/lib/impact';

/**
 * Generates context-aware, highly personalized Day Plan, Indoor Hacks, and Swaps.
 */
export function generateLocalRuleBasedPlan(
  profile: UserProfile,
  airQuality: AirQualityData
): GeminiGeneratedPlan {
  const isSmogSevere = airQuality.aqi > 150;
  const isSensitive = profile.household.hasSensitiveMembers;
  const { commuteMode, commuteDistanceKm, cookingFuel, heatingMethod } = profile.lifestyle;
  const { ventilation } = profile.household;

  // 1. Day Plan Blocks
  const dayPlan: DayPlanBlock[] = [
    {
      id: 'block_morning',
      period: 'morning',
      timeLabel: '07:00 AM - 09:00 AM',
      activity: 'Morning routine & morning ventilation assessment',
      aqiAdvice: isSmogSevere
        ? 'Morning inversion traps vehicle exhaust near the ground. Do NOT open windows.'
        : 'Morning air is acceptable. Brief 10-minute cross-ventilation is safe.',
      recommendedAction: isSmogSevere
        ? 'Keep windows locked. Switch air purifier or box fan to high in bedrooms. If making tea/breakfast, run kitchen exhaust before lighting the burner.'
        : 'Open windows for 15 minutes to clear overnight CO2 buildup, then close.',
      alternatives: [
        'Run bathroom exhaust for 20 mins to purge stale air without drawing street smog',
        'Do indoor light stretching instead of balcony/patio workout',
        'Set HEPA filter to turbo mode for 30 minutes upon waking',
      ],
    },
    {
      id: 'block_commute',
      period: 'commute',
      timeLabel: '09:00 AM - 10:30 AM',
      activity: `Daily commute (${commuteMode.replace('_', ' ')})`,
      aqiAdvice:
        commuteMode === 'bike' || commuteMode === 'walk'
          ? 'Active exertion increases respiratory minute volume by 3-4x, multiplying inhaled particulates.'
          : 'Enclosed transit cabins have lower PM2.5 than open roadside air.',
      recommendedAction:
        commuteMode === 'car'
          ? 'Set car AC to internal air recirculation mode before entering heavy traffic. Cabin filter drops cabin PM2.5 by ~70%.'
          : commuteMode === 'public_transit'
          ? 'Wear a snug N95/KN95 respirator on platforms and bus stops where diesel exhaust concentrates.'
          : isSmogSevere
          ? 'Consider carpooling or public transit today; if cycling/walking is unavoidable, wear a fitted N95 and keep pace relaxed.'
          : 'Wear a well-fitted mask during peak traffic hours.',
      alternatives: [
        'Switch to metro/subway where available to avoid surface roadway particulate spikes',
        'Shift departure by 30 minutes earlier to bypass stop-and-go diesel congestion',
        'Carpool with coworkers in a vehicle equipped with a clean cabin air filter',
      ],
    },
    {
      id: 'block_midday',
      period: 'midday',
      timeLabel: '12:00 PM - 03:00 PM',
      activity: 'Work hours, lunch prep & daytime errands',
      aqiAdvice:
        airQuality.bestOutdoorWindow.status === 'recommended'
          ? `Best window of the day: ${airQuality.bestOutdoorWindow.start} - ${airQuality.bestOutdoorWindow.end}.`
          : 'Ground-level ozone or smog remains elevated; minimize prolonged outdoor exertion.',
      recommendedAction:
        cookingFuel === 'gas'
          ? 'Always run range hood or open a back-facing window while cooking. Gas burners emit peak NO2 spikes.'
          : 'Wipe flat surfaces with a damp cloth to capture settled particulate matter without resuspending it into the air.',
      alternatives: [
        'Combine outdoor errands into the afternoon window when boundary layer inversion lifts',
        'Prepare meals using microwave or electric kettle to avoid combustion byproduct',
        'Take a brisk walk indoors in a filtered building hallway or mall',
      ],
    },
    {
      id: 'block_evening',
      period: 'evening',
      timeLabel: '05:30 PM - 08:30 PM',
      activity: 'Evening transit, family dinner & wind-down',
      aqiAdvice: isSmogSevere
        ? 'Sunset inversion forms rapidly. Particulate levels rise sharply from 6:00 PM onwards.'
        : 'Traffic emissions peak between 5:30 and 7:30 PM.',
      recommendedAction:
        isSensitive
          ? 'Keep children and sensitive members indoors. Close bedroom doors and run air purifiers on medium-high.'
          : 'Ensure kitchen is sealed from sleeping areas while cooking dinner. Change clothes upon arriving home.',
      alternatives: [
        'Leave outdoor shoes and jackets by the entryway to keep trapped street dust outside living areas',
        'Replace evening outdoor jog with indoor yoga or bodyweight exercises',
        'Batch-cook tomorrow’s meals to minimize total gas burner runtime',
      ],
    },
    {
      id: 'block_night',
      period: 'night',
      timeLabel: '09:00 PM - 07:00 AM',
      activity: 'Overnight rest & bedroom air isolation',
      aqiAdvice:
        'You spend 7-9 hours continuously breathing bedroom air. Overnight PM2.5 exposure accounts for over 40% of daily total.',
      recommendedAction:
        ventilation.hasPurifier
          ? 'Position purifier 1-2 meters from head of bed. Keep bedroom door and windows closed to create a clean air sanctuary.'
          : 'Keep bedroom window completely closed. Place a rolled towel under the bedroom door gap to stop hallway drafts.',
      alternatives: [
        'Construct a DIY Corsi-Rosenthal box fan purifier for low-cost quiet bedroom filtration',
        'Maintain indoor relative humidity between 40-50% to soothe irritated airway membranes',
        'Use an air quality monitor or app alarm before opening windows in the morning',
      ],
    },
  ];

  // 2. Indoor Air Hacks
  const indoorHacks: IndoorHack[] = [
    {
      id: 'hack_clean_sanctuary',
      title: 'Designate a Single Clean-Air Bedroom Sanctuary',
      description:
        'Instead of trying to filter an entire home, concentrate your air purifier in the smallest bedroom where family members sleep.',
      category: 'ventilation',
      cost: 'free',
      effort: 'low',
      expectedEffect: 'Cuts overnight inhaled particulate exposure by 65-80%',
      whyItMatters:
        'Humans breathe ~5,000 liters of air during sleep. A sealed, filtered bedroom provides lungs uninterrupted recovery time.',
      impact: {
        pm25ReductionPct: 75,
        estimatedGramsPm25AvoidedWeekly: 1.4,
        explanation: 'Reduces bedroom PM2.5 from ambient levels down to < 15 µg/m³ throughout 8 hours of sleep.',
      },
    },
    {
      id: 'hack_diy_corsi_rosenthal',
      title: 'Build a DIY Corsi-Rosenthal Box Fan Purifier',
      description:
        'Tape 4 MERV-13 furnace filters around a standard 20-inch box fan. Delivers 400+ CFM of filtered air for under $60.',
      category: 'diy_purifier',
      cost: ventilation.hasPurifier ? 'flexible' : 'low',
      effort: 'medium',
      expectedEffect: 'Matches or exceeds $500 commercial HEPA purifiers in Clean Air Delivery Rate (CADR)',
      whyItMatters:
        'Peer-reviewed studies by UC Davis and EPA confirm CR boxes reduce indoor aerosol particles by up to 85% at a fraction of the cost.',
      impact: {
        pm25ReductionPct: 72,
        estimatedGramsPm25AvoidedWeekly: 1.8,
        explanation: 'Provides high-volume particulate clearance for large living rooms or classrooms.',
      },
    },
    {
      id: 'hack_weatherstrip_doors',
      title: 'Wet-Towel Door Dam & Window Jam Sealing',
      description:
        'Roll up a damp bath towel and press it firmly along the bottom gap of your entry door. Apply removable painter’s tape to loose window sashes.',
      category: 'sealing',
      cost: 'free',
      effort: 'low',
      expectedEffect: 'Stops 30-45% of passive outdoor smog infiltration through door/window cracks',
      whyItMatters:
        'Building envelope leakage accounts for more than half of indoor PM2.5 in unsealed apartments.',
      impact: {
        pm25ReductionPct: 35,
        estimatedGramsPm25AvoidedWeekly: 0.9,
        explanation: 'Blocks outdoor particulate drafts from penetrating living areas during nighttime inversion.',
      },
    },
    {
      id: 'hack_cooking_ventilation',
      title: 'Two-Zone Kitchen Pressure Cooking Protocol',
      description:
        'Turn on kitchen exhaust 2 minutes before igniting gas burners. Keep kitchen door shut and open a small window opposite the burner.',
      category: 'cooking',
      cost: 'free',
      effort: 'low',
      expectedEffect: 'Prevents kitchen PM2.5 and toxic NO2 from spreading into children’s bedrooms',
      whyItMatters:
        'Gas combustion without ventilation produces indoor NO2 concentrations exceeding outdoor smog alerts within 15 minutes.',
      impact: {
        pm25ReductionPct: 60,
        estimatedGramsPm25AvoidedWeekly: 1.2,
        explanation: 'Extracts combustion byproducts and cooking aerosols directly at the source.',
      },
    },
    {
      id: 'hack_plants_vs_facts',
      title: 'Houseplants Myth vs. Reality & Optimal Humidity',
      description:
        'NASA plant study was conducted in sealed sealed micro-chambers. In real homes, plants do NOT filter PM2.5 smog. Maintain 40-50% humidity instead.',
      category: 'plants_humidity',
      cost: 'free',
      effort: 'low',
      expectedEffect: 'Soothes inflamed mucous membranes and prevents fine particles from floating indefinitely',
      whyItMatters:
        'Dry indoor air dries out the nasal cilia, your body’s natural mechanical particulate filter, increasing vulnerability to asthma attacks.',
      impact: {
        pm25ReductionPct: 15,
        estimatedGramsPm25AvoidedWeekly: 0.3,
        explanation: 'Hydrated respiratory cilia trap inhaled particles before they reach deep alveolar lung tissue.',
      },
    },
  ];

  // 3. Sustainable Swaps
  const commuteImpact = calculateCommuteWeeklyImpact(
    commuteMode,
    commuteDistanceKm,
    airQuality.pm25
  );

  const swaps: SustainableSwap[] = [
    {
      id: 'swap_commute',
      category: 'commute',
      title:
        commuteMode === 'car'
          ? 'Switch 2 Drive Days to Metro / Bus with N95'
          : commuteMode === 'bike'
          ? 'Shift Heavy Cardio Bike Commute to Light Electric or Transit on High-Smog Days'
          : 'Carpool or Shared Shuttle on High Pollution Days',
      currentChoice: `${commuteMode.replace('_', ' ')} for ${commuteDistanceKm} km daily`,
      proposedSwap:
        commuteMode === 'car'
          ? 'Public transit or carpool 2 days/week with fitted N95 respirator'
          : 'Subway or commuter shuttle with closed-loop cabin filtration',
      tradeOff: 'Adds 10-15 minutes of transit schedule planning, but cuts emissions and stops heavy tailpipe exposure',
      impact: {
        pm25AvoidedGramsWeekly: Math.max(0.4, commuteImpact.weeklyPm25AvoidedGrams * 0.4),
        co2eAvoidedKgWeekly: Math.max(1.8, Math.round(commuteImpact.weeklyCo2eKg * 0.4 * 10) / 10),
        exposureReductionPct: 40,
        explanation:
          'Subway cabins filter outdoor air, while carpooling removes tailpipe exhaust from community school zones.',
        assumptionCitation: 'UK DEFRA GHG Conversion factors & EPA Exposure Factors Handbook',
      },
      adopted: false,
    },
    {
      id: 'swap_cooking',
      category: 'cooking',
      title:
        cookingFuel === 'gas'
          ? 'Use Portable Electric Induction Cooktop for Soups & Boiling'
          : 'Batch Meal Preparation & Microwave Reheating',
      currentChoice: `${cookingFuel} stove without continuous high-power extraction`,
      proposedSwap: 'Use an efficient electric induction burner or covered electric kettle for boiling',
      tradeOff: 'Requires a plug-in burner ($30-$45) or adjusting pan types for induction cookware',
      impact: {
        pm25AvoidedGramsWeekly: cookingFuel === 'gas' ? 1.4 : 0.4,
        co2eAvoidedKgWeekly: cookingFuel === 'gas' ? 2.6 : 0.8,
        exposureReductionPct: 65,
        explanation:
          'Eliminates nitrogen dioxide (NO2) combustion byproduct inside the living area and reduces kitchen PM2.5 spikes.',
        assumptionCitation: 'Lawrence Berkeley National Laboratory Indoor Cooking Emissions Study',
      },
      adopted: false,
    },
    {
      id: 'swap_heating',
      category: 'heating',
      title:
        heatingMethod === 'firewood'
          ? 'Replace Biomass / Firewood Fireplace with Clean Heat Pump or Radiant Panel'
          : 'Draft-Seal Baseboards and Window Jambs Instead of Cranking Up Heat',
      currentChoice: `${heatingMethod.replace('_', ' ')} heating with standard unsealed draft points`,
      proposedSwap: 'Apply cellular thermal window film and draft stoppers to maintain warmth without extra combustion',
      tradeOff: 'Takes 30 minutes of DIY application on a weekend',
      impact: {
        pm25AvoidedGramsWeekly: heatingMethod === 'firewood' ? 6.2 : 0.8,
        co2eAvoidedKgWeekly: 4.5,
        exposureReductionPct: heatingMethod === 'firewood' ? 80 : 30,
        explanation:
          'Stopping drafts maintains ambient indoor temperatures while keeping outdoor smoke infiltration out.',
        assumptionCitation: 'ASHRAE / LBNL Residential Energy and Infiltration Standards',
      },
      adopted: false,
    },
    {
      id: 'swap_lifestyle',
      category: 'lifestyle',
      title: 'Anti-Idling & Closed Entry Air-Lock Zone',
      currentChoice: 'Leaving car running during school drop-off / opening main door directly into living space',
      proposedSwap: 'Strict 10-second engine turn-off rule and staged shoe-removal entry hallway',
      tradeOff: 'Zero financial cost; requires a small behavioral routine change',
      impact: {
        pm25AvoidedGramsWeekly: 0.7,
        co2eAvoidedKgWeekly: 2.1,
        exposureReductionPct: 25,
        explanation:
          'Vehicle idling outside residential gates creates toxic localized hot-spots that enter through ground-floor doors.',
        assumptionCitation: 'US EPA Clean School Bus & Anti-Idling Program Field Measurements',
      },
      adopted: false,
    },
  ];

  return {
    dayPlan,
    indoorHacks,
    swaps,
  };
}
