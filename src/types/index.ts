/**
 * @file Exhale core type definitions
 * Strictly typed interfaces for user profiles, air quality, recommendations, impact, and chat.
 */

export type Result<T, E = Error> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export type AQICategory =
  | 'good'
  | 'moderate'
  | 'sensitive'
  | 'unhealthy'
  | 'very_unhealthy'
  | 'hazardous';

export type MainPollutant = 'pm2_5' | 'pm10' | 'no2' | 'o3';

export type CommuteMode = 'walk' | 'bike' | 'public_transit' | 'two_wheeler' | 'car';
export type CookingFuel = 'gas' | 'electric' | 'wood_biomass';
export type HeatingMethod = 'none' | 'central' | 'space_heater' | 'firewood';
export type WorkEnvironment = 'remote' | 'office' | 'outdoor';
export type BudgetLevel = 'free' | 'low' | 'flexible';
export type HomeType = 'apartment' | 'house' | 'flat' | 'studio';

export interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
  isSample?: boolean;
}

export interface HouseholdProfile {
  membersCount: number;
  ages: number[];
  hasSensitiveMembers: boolean;
  homeType: HomeType;
  ventilation: {
    windows: 'sealed' | 'standard' | 'drafty';
    hasAC: boolean;
    hasPurifier: boolean;
  };
  hasPets: boolean;
}

export interface LifestyleProfile {
  commuteMode: CommuteMode;
  commuteDistanceKm: number;
  cookingFuel: CookingFuel;
  heatingMethod: HeatingMethod;
  workEnvironment: WorkEnvironment;
  budgetLevel: BudgetLevel;
}

export interface UserProfile {
  location: LocationData;
  household: HouseholdProfile;
  lifestyle: LifestyleProfile;
  onboardingCompleted: boolean;
  version: number;
  updatedAt: string;
}

export interface HourlyForecastItem {
  time: string;
  hourLabel: string;
  aqi: number;
  pm25: number;
  pm10: number;
  isBestWindow?: boolean;
}

export interface BestOutdoorWindow {
  start: string;
  end: string;
  avgAqi: number;
  status: 'recommended' | 'acceptable' | 'avoid_all_day';
  advice: string;
}

export interface AirQualityData {
  aqi: number;
  category: AQICategory;
  categoryLabel: string;
  mainPollutant: MainPollutant;
  pm25: number; // in µg/m³
  pm10: number;
  no2: number;
  o3: number;
  whoPm25Multiplier: number; // e.g. 4.2x WHO 24-hr guideline
  whoComparison: string;
  hourly: HourlyForecastItem[];
  bestOutdoorWindow: BestOutdoorWindow;
  isSampleData: boolean;
  fetchedAt: string;
}

export type DayPeriod = 'morning' | 'commute' | 'midday' | 'evening' | 'night';

export interface DayPlanBlock {
  id: string;
  period: DayPeriod;
  timeLabel: string;
  activity: string;
  aqiAdvice: string;
  recommendedAction: string;
  alternatives: string[];
  selectedAlternative?: string;
}

export interface IndoorHack {
  id: string;
  title: string;
  description: string;
  category: 'ventilation' | 'diy_purifier' | 'sealing' | 'cooking' | 'plants_humidity' | 'habits';
  cost: 'free' | 'low' | 'flexible';
  effort: 'low' | 'medium' | 'high';
  expectedEffect: string;
  whyItMatters: string;
  impact: {
    pm25ReductionPct: number;
    estimatedGramsPm25AvoidedWeekly: number;
    explanation: string;
  };
}

export interface SustainableSwap {
  id: string;
  category: 'commute' | 'cooking' | 'heating' | 'waste' | 'lifestyle';
  title: string;
  currentChoice: string;
  proposedSwap: string;
  tradeOff: string;
  impact: {
    pm25AvoidedGramsWeekly: number;
    co2eAvoidedKgWeekly: number;
    exposureReductionPct: number;
    explanation: string;
    assumptionCitation: string;
  };
  adopted: boolean;
}

export interface ImpactSummary {
  weeklyPm25ExposureReducedGrams: number;
  weeklyCo2eSavedKg: number;
  overallExposureReductionPct: number;
  adoptedSwapsCount: number;
}

export interface CommunityAction {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  targetGroup: 'neighborhood' | 'school' | 'society' | 'local_group';
  iconName: string;
  pledgeCount: number;
  userPledged: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}
