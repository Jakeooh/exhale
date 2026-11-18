/**
 * @file Exhale global constants, thresholds, and sample profiles
 */

import { AQICategory, UserProfile, AirQualityData } from '@/types';

export const STORAGE_KEYS = {
  PROFILE: 'exhale_profile_v1',
  AIR_CACHE: 'exhale_air_cache_v1',
  ADOPTED_SWAPS: 'exhale_adopted_swaps_v1',
  PLEDGES: 'exhale_pledges_v1',
  THEME: 'exhale_theme_v1',
  PLAN_CACHE_PREFIX: 'exhale_plan_cache_v1_',
} as const;

/** WHO 2021 Air Quality Guideline daily (24-hour) limits in µg/m³ */
export const WHO_GUIDELINES = {
  PM25_DAILY_UG_M3: 15,
  PM10_DAILY_UG_M3: 45,
  NO2_DAILY_UG_M3: 25,
  O3_8HR_UG_M3: 100,
} as const;

/** US EPA AQI standard category cutoffs */
export const AQI_THRESHOLDS = {
  GOOD_MAX: 50,
  MODERATE_MAX: 100,
  SENSITIVE_MAX: 150,
  UNHEALTHY_MAX: 200,
  VERY_UNHEALTHY_MAX: 300,
} as const;

export interface AQIMeta {
  category: AQICategory;
  label: string;
  colorVar: string;
  hex: string;
  iconName: string;
  badgeBg: string;
  badgeText: string;
  healthSummary: string;
  outdoorAdvice: string;
}

export const AQI_CATEGORY_CONFIG: Record<AQICategory, AQIMeta> = {
  good: {
    category: 'good',
    label: 'Good',
    colorVar: 'var(--aqi-good)',
    hex: '#2FBF71',
    iconName: 'Smile',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    healthSummary: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
    outdoorAdvice: 'Great conditions for all outdoor activities and open-window natural ventilation.',
  },
  moderate: {
    category: 'moderate',
    label: 'Moderate',
    colorVar: 'var(--aqi-moderate)',
    hex: '#F2C94C',
    iconName: 'ShieldAlert',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
    healthSummary: 'Air quality is acceptable; unusually sensitive individuals may notice mild respiratory irritation.',
    outdoorAdvice: 'Safe for most; sensitive individuals should consider taking frequent breaks during prolonged outdoor exertion.',
  },
  sensitive: {
    category: 'sensitive',
    label: 'Unhealthy for Sensitive Groups',
    colorVar: 'var(--aqi-sensitive)',
    hex: '#F2994A',
    iconName: 'AlertTriangle',
    badgeBg: 'bg-orange-50 dark:bg-orange-950/40',
    badgeText: 'text-orange-700 dark:text-orange-300',
    healthSummary: 'Members of sensitive groups (children, elders, people with asthma) may experience health effects.',
    outdoorAdvice: 'Sensitive groups should reduce prolonged outdoor exercise. Keep windows mostly closed during peak hours.',
  },
  unhealthy: {
    category: 'unhealthy',
    label: 'Unhealthy',
    colorVar: 'var(--aqi-unhealthy)',
    hex: '#EB5757',
    iconName: 'AlertOctagon',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    badgeText: 'text-rose-700 dark:text-rose-300',
    healthSummary: 'Everyone may begin to experience adverse health effects; sensitive groups experience more serious effects.',
    outdoorAdvice: 'Avoid outdoor exercise. Keep indoor air filtered, seal drafty openings, and wear a well-fitted N95 mask outside.',
  },
  very_unhealthy: {
    category: 'very_unhealthy',
    label: 'Very Unhealthy',
    colorVar: 'var(--aqi-very-unhealthy)',
    hex: '#9B51E0',
    iconName: 'Flame',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
    badgeText: 'text-purple-700 dark:text-purple-300',
    healthSummary: 'Health alert: the risk of health effects is increased for everyone in the area.',
    outdoorAdvice: 'Stay indoors with air purifiers running. Keep windows sealed shut. Minimize all outdoor transit.',
  },
  hazardous: {
    category: 'hazardous',
    label: 'Hazardous',
    colorVar: 'var(--aqi-hazardous)',
    hex: '#7B2D3B',
    iconName: 'Skull',
    badgeBg: 'bg-red-950/30 dark:bg-red-950/70',
    badgeText: 'text-red-700 dark:text-red-300',
    healthSummary: 'Health warning of emergency conditions: everyone is more likely to be seriously affected.',
    outdoorAdvice: 'Emergency conditions. Stay strictly indoors with filtration running. Do not open windows. Wear tight N95 if transit is unavoidable.',
  },
};

/** 3 One-Click Sample Profiles requested by Requirement 8 */
export const SAMPLE_PROFILES: { id: string; name: string; tag: string; description: string; profile: UserProfile }[] = [
  {
    id: 'family_apartment',
    name: 'Young Family in Apartment',
    tag: 'Kids + Asthma',
    description: 'Two parents and two children (ages 4 and 8, one with mild asthma) in a 4th-floor city apartment.',
    profile: {
      location: {
        name: 'New Delhi (South Ext)',
        latitude: 28.57,
        longitude: 77.22,
        isSample: true,
      },
      household: {
        membersCount: 4,
        ages: [34, 32, 8, 4],
        hasSensitiveMembers: true,
        homeType: 'apartment',
        ventilation: {
          windows: 'standard',
          hasAC: true,
          hasPurifier: true,
        },
        hasPets: false,
      },
      lifestyle: {
        commuteMode: 'car',
        commuteDistanceKm: 14,
        cookingFuel: 'gas',
        heatingMethod: 'space_heater',
        workEnvironment: 'office',
        budgetLevel: 'flexible',
      },
      onboardingCompleted: true,
      version: 1,
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'elderly_couple',
    name: 'Retired Couple in House',
    tag: 'Elders + Garden',
    description: 'Retired couple (ages 68 and 72) with chronic cardiovascular sensitivities living in a single-level suburban house.',
    profile: {
      location: {
        name: 'Salt Lake City, UT',
        latitude: 40.76,
        longitude: -111.89,
        isSample: true,
      },
      household: {
        membersCount: 2,
        ages: [72, 68],
        hasSensitiveMembers: true,
        homeType: 'house',
        ventilation: {
          windows: 'drafty',
          hasAC: true,
          hasPurifier: false,
        },
        hasPets: true,
      },
      lifestyle: {
        commuteMode: 'car',
        commuteDistanceKm: 5,
        cookingFuel: 'gas',
        heatingMethod: 'central',
        workEnvironment: 'remote',
        budgetLevel: 'low',
      },
      onboardingCompleted: true,
      version: 1,
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'students_flat',
    name: 'College Students Sharing Flat',
    tag: 'Budget + Active Commute',
    description: 'Three university students (ages 20-22) in a rented flat commuting by bicycle and metro on a tight budget.',
    profile: {
      location: {
        name: 'London (Zone 2)',
        latitude: 51.51,
        longitude: -0.13,
        isSample: true,
      },
      household: {
        membersCount: 3,
        ages: [21, 20, 22],
        hasSensitiveMembers: false,
        homeType: 'flat',
        ventilation: {
          windows: 'drafty',
          hasAC: false,
          hasPurifier: false,
        },
        hasPets: false,
      },
      lifestyle: {
        commuteMode: 'bike',
        commuteDistanceKm: 8,
        cookingFuel: 'electric',
        heatingMethod: 'central',
        workEnvironment: 'outdoor',
        budgetLevel: 'free',
      },
      onboardingCompleted: true,
      version: 1,
      updatedAt: new Date().toISOString(),
    },
  },
];

/** Representative offline fallback air quality data */
export const SAMPLE_AIR_QUALITY_DATA: AirQualityData = {
  aqi: 218,
  category: 'very_unhealthy',
  categoryLabel: 'Very Unhealthy',
  mainPollutant: 'pm2_5',
  pm25: 168.4,
  pm10: 245.0,
  no2: 48.2,
  o3: 31.0,
  whoPm25Multiplier: 11.2,
  whoComparison: 'PM2.5 is 11.2x the WHO 24-hr guideline',
  hourly: [
    { time: '00:00', hourLabel: '12 AM', aqi: 240, pm25: 190, pm10: 270 },
    { time: '03:00', hourLabel: '3 AM', aqi: 265, pm25: 215, pm10: 310 },
    { time: '06:00', hourLabel: '6 AM', aqi: 290, pm25: 240, pm10: 350 },
    { time: '09:00', hourLabel: '9 AM', aqi: 275, pm25: 225, pm10: 330 },
    { time: '12:00', hourLabel: '12 PM', aqi: 210, pm25: 160, pm10: 230 },
    { time: '14:00', hourLabel: '2 PM', aqi: 175, pm25: 102, pm10: 160, isBestWindow: true },
    { time: '15:00', hourLabel: '3 PM', aqi: 168, pm25: 88, pm10: 145, isBestWindow: true },
    { time: '16:00', hourLabel: '4 PM', aqi: 172, pm25: 96, pm10: 155, isBestWindow: true },
    { time: '18:00', hourLabel: '6 PM', aqi: 220, pm25: 170, pm10: 240 },
    { time: '21:00', hourLabel: '9 PM', aqi: 250, pm25: 200, pm10: 290 },
  ],
  bestOutdoorWindow: {
    start: '2:00 PM',
    end: '4:30 PM',
    avgAqi: 172,
    status: 'acceptable',
    advice: 'Inversion layer lifts slightly in mid-afternoon. Best time for brief, masked outdoor errands if necessary.',
  },
  isSampleData: true,
  fetchedAt: new Date().toISOString(),
};

/** Notable smog hotspots for quick city selection */
export const POPULAR_CITIES = [
  { name: 'New Delhi, India', latitude: 28.61, longitude: 77.21 },
  { name: 'Lahore, Pakistan', latitude: 31.55, longitude: 74.36 },
  { name: 'Beijing, China', latitude: 39.90, longitude: 116.40 },
  { name: 'Hanoi, Vietnam', latitude: 21.03, longitude: 105.85 },
  { name: 'Salt Lake City, USA', latitude: 40.76, longitude: -111.89 },
  { name: 'Bangkok, Thailand', latitude: 13.75, longitude: 100.50 },
  { name: 'London, UK', latitude: 51.51, longitude: -0.13 },
  { name: 'Los Angeles, USA', latitude: 34.05, longitude: -118.24 },
  { name: 'Milan, Italy', latitude: 45.46, longitude: 9.19 },
];
