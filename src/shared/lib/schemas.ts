/**
 * @file Zod validation schemas for Open-Meteo, Geocoding, and Gemini AI outputs
 */

import { z } from 'zod';

/** Schema for Open-Meteo Air Quality API response */
export const OpenMeteoAirQualitySchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  current: z.object({
    time: z.string().optional(),
    us_aqi: z.number().nullable().optional(),
    pm2_5: z.number().nullable().optional(),
    pm10: z.number().nullable().optional(),
    nitrogen_dioxide: z.number().nullable().optional(),
    ozone: z.number().nullable().optional(),
  }).passthrough(),
  hourly: z.object({
    time: z.array(z.string()),
    us_aqi: z.array(z.number().nullable().optional()).optional(),
    pm2_5: z.array(z.number().nullable().optional()).optional(),
    pm10: z.array(z.number().nullable().optional()).optional(),
  }).passthrough().optional(),
}).passthrough();

export type OpenMeteoAirQualityResponse = z.infer<typeof OpenMeteoAirQualitySchema>;

/** Schema for Open-Meteo Geocoding search results */
export const GeocodingItemSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  country: z.string().optional(),
  admin1: z.string().optional(),
  country_code: z.string().optional(),
});

export const GeocodingResponseSchema = z.object({
  results: z.array(GeocodingItemSchema).optional(),
}).passthrough();

export type GeocodingResponse = z.infer<typeof GeocodingResponseSchema>;

/** Schema for Gemini Structured Plan generation (Day plan + Indoor hacks + Swaps) */
export const GeminiDayPlanBlockSchema = z.object({
  id: z.string(),
  period: z.enum(['morning', 'commute', 'midday', 'evening', 'night']),
  timeLabel: z.string(),
  activity: z.string(),
  aqiAdvice: z.string(),
  recommendedAction: z.string(),
  alternatives: z.array(z.string()).default([]),
});

export const GeminiIndoorHackSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.enum(['ventilation', 'diy_purifier', 'sealing', 'cooking', 'plants_humidity', 'habits']),
  cost: z.enum(['free', 'low', 'flexible']),
  effort: z.enum(['low', 'medium', 'high']),
  expectedEffect: z.string(),
  whyItMatters: z.string(),
  impact: z.object({
    pm25ReductionPct: z.number(),
    estimatedGramsPm25AvoidedWeekly: z.number(),
    explanation: z.string(),
  }),
});

export const GeminiSwapSchema = z.object({
  id: z.string(),
  category: z.enum(['commute', 'cooking', 'heating', 'waste', 'lifestyle']),
  title: z.string(),
  currentChoice: z.string(),
  proposedSwap: z.string(),
  tradeOff: z.string(),
  impact: z.object({
    pm25AvoidedGramsWeekly: z.number(),
    co2eAvoidedKgWeekly: z.number(),
    exposureReductionPct: z.number(),
    explanation: z.string(),
    assumptionCitation: z.string(),
  }),
});

export const GeminiGeneratedPlanSchema = z.object({
  dayPlan: z.array(GeminiDayPlanBlockSchema).min(3),
  indoorHacks: z.array(GeminiIndoorHackSchema).min(3),
  swaps: z.array(GeminiSwapSchema).min(3),
});

export type GeminiGeneratedPlan = z.infer<typeof GeminiGeneratedPlanSchema>;

/** User Profile Schema for validation */
export const UserProfileSchema = z.object({
  location: z.object({
    name: z.string().min(1).max(100),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    isSample: z.boolean().optional(),
  }),
  household: z.object({
    membersCount: z.number().int().min(1).max(20),
    ages: z.array(z.number().int().min(0).max(120)).min(1).max(20),
    hasSensitiveMembers: z.boolean(),
    homeType: z.enum(['apartment', 'house', 'flat', 'studio']),
    ventilation: z.object({
      windows: z.enum(['sealed', 'standard', 'drafty']),
      hasAC: z.boolean(),
      hasPurifier: z.boolean(),
    }),
    hasPets: z.boolean(),
  }),
  lifestyle: z.object({
    commuteMode: z.enum(['walk', 'bike', 'public_transit', 'two_wheeler', 'car']),
    commuteDistanceKm: z.number().min(0).max(200),
    cookingFuel: z.enum(['gas', 'electric', 'wood_biomass']),
    heatingMethod: z.enum(['none', 'central', 'space_heater', 'firewood']),
    workEnvironment: z.enum(['remote', 'office', 'outdoor']),
    budgetLevel: z.enum(['free', 'low', 'flexible']),
  }),
  onboardingCompleted: z.boolean(),
  version: z.number().default(1),
  updatedAt: z.string(),
});
