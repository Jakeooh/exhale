import { describe, it, expect } from 'vitest';
import {
  OpenMeteoAirQualitySchema,
  GeocodingResponseSchema,
  GeminiGeneratedPlanSchema,
  UserProfileSchema,
} from '@/shared/lib/schemas';

describe('Zod Schemas: Open-Meteo Air Quality Validation', () => {
  it('successfully validates a valid Open-Meteo payload', () => {
    const validPayload = {
      latitude: 28.61,
      longitude: 77.21,
      generationtime_ms: 0.12,
      current: {
        time: '2026-11-18T10:00',
        us_aqi: 218,
        pm2_5: 168.4,
        pm10: 245.0,
        nitrogen_dioxide: 48.2,
        ozone: 31.0,
      },
      hourly: {
        time: ['2026-11-18T00:00', '2026-11-18T01:00'],
        us_aqi: [210, 218],
        pm2_5: [160, 168.4],
        pm10: [230, 245],
      },
    };

    const result = OpenMeteoAirQualitySchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('rejects malformed Open-Meteo payload missing latitude/longitude', () => {
    const malformed = {
      current: { us_aqi: 100 },
    };

    const result = OpenMeteoAirQualitySchema.safeParse(malformed);
    expect(result.success).toBe(false);
  });
});

describe('Zod Schemas: Geocoding Response Validation', () => {
  it('validates a correct geocoding result list', () => {
    const validGeocoding = {
      results: [
        {
          id: 1273294,
          name: 'Delhi',
          latitude: 28.65,
          longitude: 77.23,
          country: 'India',
        },
      ],
    };

    const result = GeocodingResponseSchema.safeParse(validGeocoding);
    expect(result.success).toBe(true);
  });
});

describe('Zod Schemas: Gemini Structured Output Validation', () => {
  it('validates a complete Gemini generated plan', () => {
    const validPlan = {
      dayPlan: [
        {
          id: 'b1',
          period: 'morning',
          timeLabel: '7-9 AM',
          activity: 'Morning routine',
          aqiAdvice: 'Keep windows closed',
          recommendedAction: 'Run bedroom purifier',
          alternatives: ['Air purifier turbo'],
        },
        {
          id: 'b2',
          period: 'commute',
          timeLabel: '9-10 AM',
          activity: 'Commute',
          aqiAdvice: 'Roadside soot elevated',
          recommendedAction: 'Wear N95',
          alternatives: ['Take metro'],
        },
        {
          id: 'b3',
          period: 'evening',
          timeLabel: '6-8 PM',
          activity: 'Evening rest',
          aqiAdvice: 'Inversion sets in',
          recommendedAction: 'Stay indoors',
          alternatives: ['Indoor yoga'],
        },
      ],
      indoorHacks: [
        {
          id: 'h1',
          title: 'Seal Entry Gaps',
          description: 'Use a damp towel along base of door',
          category: 'sealing',
          cost: 'free',
          effort: 'low',
          expectedEffect: 'Stops 30% infiltration',
          whyItMatters: 'Drafts pull soot into bedrooms',
          impact: {
            pm25ReductionPct: 30,
            estimatedGramsPm25AvoidedWeekly: 0.8,
            explanation: 'Blocks outdoor drafts',
          },
        },
        {
          id: 'h2',
          title: 'DIY Box Fan Filter',
          description: 'Tape MERV-13 filter to fan',
          category: 'diy_purifier',
          cost: 'low',
          effort: 'medium',
          expectedEffect: '70% PM2.5 reduction',
          whyItMatters: 'High CADR for large rooms',
          impact: {
            pm25ReductionPct: 70,
            estimatedGramsPm25AvoidedWeekly: 1.5,
            explanation: 'High volume filtration',
          },
        },
        {
          id: 'h3',
          title: 'Kitchen Ventilation',
          description: 'Run exhaust before cooking',
          category: 'cooking',
          cost: 'free',
          effort: 'low',
          expectedEffect: 'Prevents NO2 spread',
          whyItMatters: 'Gas burners produce peak NO2',
          impact: {
            pm25ReductionPct: 60,
            estimatedGramsPm25AvoidedWeekly: 1.1,
            explanation: 'Source extraction',
          },
        },
      ],
      swaps: [
        {
          id: 's1',
          category: 'commute',
          title: 'Metro Commute with N95',
          currentChoice: 'Car driving in gridlock',
          proposedSwap: 'Take train 3 days/week',
          tradeOff: 'Walking to station',
          impact: {
            pm25AvoidedGramsWeekly: 0.6,
            co2eAvoidedKgWeekly: 3.2,
            exposureReductionPct: 35,
            explanation: 'Filters cabin air and reduces traffic idling',
            assumptionCitation: 'UK DEFRA factors',
          },
        },
        {
          id: 's2',
          category: 'cooking',
          title: 'Electric Kettle for Boiling',
          currentChoice: 'Open gas pot boiling',
          proposedSwap: 'Electric kettle',
          tradeOff: 'Counter space',
          impact: {
            pm25AvoidedGramsWeekly: 0.3,
            co2eAvoidedKgWeekly: 0.8,
            exposureReductionPct: 20,
            explanation: 'Cuts gas combustion emissions',
            assumptionCitation: 'LBNL Cooking Study',
          },
        },
        {
          id: 's3',
          category: 'heating',
          title: 'Window Thermal Film',
          currentChoice: 'Drafty single pane',
          proposedSwap: 'Shrink-wrap film',
          tradeOff: 'Weekend DIY install',
          impact: {
            pm25AvoidedGramsWeekly: 0.5,
            co2eAvoidedKgWeekly: 2.1,
            exposureReductionPct: 25,
            explanation: 'Blocks infiltration drafts',
            assumptionCitation: 'ASHRAE Residential Infiltration',
          },
        },
      ],
    };

    const result = GeminiGeneratedPlanSchema.safeParse(validPlan);
    expect(result.success).toBe(true);
  });

  it('rejects incomplete plans with fewer than 3 blocks or hacks', () => {
    const invalidPlan = {
      dayPlan: [],
      indoorHacks: [],
      swaps: [],
    };

    const result = GeminiGeneratedPlanSchema.safeParse(invalidPlan);
    expect(result.success).toBe(false);
  });
});

describe('Zod Schemas: User Profile Validation', () => {
  it('validates a complete user profile', () => {
    const validProfile = {
      location: {
        name: 'Salt Lake City',
        latitude: 40.76,
        longitude: -111.89,
      },
      household: {
        membersCount: 2,
        ages: [30, 28],
        hasSensitiveMembers: false,
        homeType: 'apartment',
        ventilation: {
          windows: 'standard',
          hasAC: true,
          hasPurifier: true,
        },
        hasPets: true,
      },
      lifestyle: {
        commuteMode: 'bike',
        commuteDistanceKm: 6,
        cookingFuel: 'electric',
        heatingMethod: 'central',
        workEnvironment: 'office',
        budgetLevel: 'free',
      },
      onboardingCompleted: true,
      version: 1,
      updatedAt: new Date().toISOString(),
    };

    const result = UserProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it('rejects profiles with invalid household member counts or latitude out of range', () => {
    const invalid = {
      location: { name: 'Invalid', latitude: 999, longitude: 0 },
      household: { membersCount: -1 },
    };

    const result = UserProfileSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
