/**
 * @file Zustand Store for Exhale
 * Central state management for user profiles, live air quality, AI plan blocks,
 * adopted sustainable swaps, community pledges, and theme state.
 */

import { create } from 'zustand';
import {
  UserProfile,
  AirQualityData,
  DayPlanBlock,
  IndoorHack,
  SustainableSwap,
  CommunityAction,
  ImpactSummary,
} from '@/types';
import { STORAGE_KEYS, SAMPLE_PROFILES, SAMPLE_AIR_QUALITY_DATA } from './constants';
import { getStorageItem, setStorageItem, clearAllExhaleData } from './storage';
import { fetchAirQuality, getSampleAirData } from '@/services/airquality';
import { generateExhalePlan } from '@/services/gemini';
import { calculateWeeklyImpactTotal } from './impact';
import { INITIAL_COMMUNITY_ACTIONS } from './community';

export type ActiveTabId = 'airnow' | 'dayplan' | 'indoor' | 'swaps' | 'impact' | 'community' | 'assistant';

interface AppState {
  // Profile
  profile: UserProfile | null;
  hasCompletedOnboarding: boolean;

  // Air Quality
  airQuality: AirQualityData | null;
  airQualityLoading: boolean;
  airQualityError: string | null;

  // Plan & Recommendations
  dayPlan: DayPlanBlock[];
  indoorHacks: IndoorHack[];
  swaps: SustainableSwap[];
  planLoading: boolean;
  planError: string | null;
  isAIGeneratedPlan: boolean;

  // Swaps & Impact
  adoptedSwapIds: Record<string, boolean>;
  impactSummary: ImpactSummary;

  // Community
  communityActions: CommunityAction[];

  // Navigation & UI
  activeTab: ActiveTabId;
  isDarkMode: boolean;

  // Actions
  setProfile: (profile: UserProfile) => void;
  loadSampleProfile: (sampleId: string) => void;
  clearAllUserData: () => void;
  setActiveTab: (tab: ActiveTabId) => void;
  toggleTheme: () => void;
  loadAirQuality: (forceRefresh?: boolean) => Promise<void>;
  generatePlan: (forceRefresh?: boolean) => Promise<void>;
  selectPlanAlternative: (blockId: string, altText: string) => void;
  toggleAdoptSwap: (swapId: string) => void;
  togglePledge: (actionId: string) => void;
  toggleSampleDataMode: () => void;
}

// Initial theme resolution
const getInitialTheme = (): boolean => {
  if (typeof window === 'undefined') return false;
  const saved = getStorageItem<string | null>(STORAGE_KEYS.THEME, null);
  if (saved !== null) {
    return saved === 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const useAppStore = create<AppState>((set, get) => {
  // Load persisted data
  const initialProfile = getStorageItem<UserProfile | null>(STORAGE_KEYS.PROFILE, null);
  const initialAdopted = getStorageItem<Record<string, boolean>>(STORAGE_KEYS.ADOPTED_SWAPS, {});
  const savedPledges = getStorageItem<Record<string, boolean>>(STORAGE_KEYS.PLEDGES, {});
  const isDark = getInitialTheme();

  // Apply dark class to document element immediately
  if (typeof document !== 'undefined') {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  const mergedCommunityActions = INITIAL_COMMUNITY_ACTIONS.map((action) => ({
    ...action,
    userPledged: !!savedPledges[action.id],
    pledgeCount: action.pledgeCount + (savedPledges[action.id] ? 1 : 0),
  }));

  return {
    profile: initialProfile,
    hasCompletedOnboarding: !!initialProfile?.onboardingCompleted,
    airQuality: null,
    airQualityLoading: false,
    airQualityError: null,

    dayPlan: [],
    indoorHacks: [],
    swaps: [],
    planLoading: false,
    planError: null,
    isAIGeneratedPlan: false,

    adoptedSwapIds: initialAdopted,
    impactSummary: {
      weeklyPm25ExposureReducedGrams: 0,
      weeklyCo2eSavedKg: 0,
      overallExposureReductionPct: 0,
      adoptedSwapsCount: 0,
    },

    communityActions: mergedCommunityActions,
    activeTab: 'airnow',
    isDarkMode: isDark,

    setProfile: (profile: UserProfile) => {
      setStorageItem(STORAGE_KEYS.PROFILE, profile);
      set({
        profile,
        hasCompletedOnboarding: profile.onboardingCompleted,
      });

      // Automatically trigger air quality refresh and plan generation
      get().loadAirQuality();
    },

    loadSampleProfile: (sampleId: string) => {
      const found = SAMPLE_PROFILES.find((s) => s.id === sampleId);
      if (found) {
        get().setProfile(found.profile);
      }
    },

    clearAllUserData: () => {
      clearAllExhaleData();
      set({
        profile: null,
        hasCompletedOnboarding: false,
        dayPlan: [],
        indoorHacks: [],
        swaps: [],
        adoptedSwapIds: {},
        airQuality: null,
        airQualityError: null,
        impactSummary: {
          weeklyPm25ExposureReducedGrams: 0,
          weeklyCo2eSavedKg: 0,
          overallExposureReductionPct: 0,
          adoptedSwapsCount: 0,
        },
        activeTab: 'airnow',
      });
    },

    setActiveTab: (tab: ActiveTabId) => {
      set({ activeTab: tab });
    },

    toggleTheme: () => {
      const next = !get().isDarkMode;
      set({ isDarkMode: next });
      setStorageItem(STORAGE_KEYS.THEME, next ? 'dark' : 'light');
      if (typeof document !== 'undefined') {
        if (next) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },

    loadAirQuality: async (forceRefresh = false) => {
      const { profile } = get();
      const lat = profile?.location.latitude ?? SAMPLE_AIR_QUALITY_DATA.hourly[0]?.pm25 ? 28.61 : 28.61;
      const lon = profile?.location.longitude ?? 77.21;

      set({ airQualityLoading: true, airQualityError: null });

      const result = await fetchAirQuality(lat, lon, { forceRefresh });

      if (result.ok) {
        set({
          airQuality: result.data,
          airQualityLoading: false,
          airQualityError: null,
        });
      } else {
        // Fall back to sample data gracefully
        set({
          airQuality: getSampleAirData(),
          airQualityLoading: false,
          airQualityError: result.error.message,
        });
      }

      // Generate or update plan once air quality is present
      get().generatePlan(forceRefresh);
    },

    generatePlan: async (forceRefresh = false) => {
      const { profile, airQuality } = get();
      if (!profile) return;

      const activeAir = airQuality || getSampleAirData();

      set({ planLoading: true, planError: null });

      const result = await generateExhalePlan(profile, activeAir, { forceRefresh });

      if (result.ok) {
        const { plan, isAIGenerated } = result.data;
        const currentAdopted = get().adoptedSwapIds;

        // Apply adopted status to swaps
        const updatedSwaps = plan.swaps.map((s) => ({
          ...s,
          adopted: !!currentAdopted[s.id],
        }));

        const summary = calculateWeeklyImpactTotal(updatedSwaps, profile, activeAir.pm25);

        set({
          dayPlan: plan.dayPlan,
          indoorHacks: plan.indoorHacks,
          swaps: updatedSwaps,
          impactSummary: summary,
          isAIGeneratedPlan: isAIGenerated,
          planLoading: false,
          planError: null,
        });
      } else {
        set({
          planLoading: false,
          planError: result.error.message,
        });
      }
    },

    selectPlanAlternative: (blockId: string, altText: string) => {
      const { dayPlan } = get();
      const updated = dayPlan.map((block) =>
        block.id === blockId ? { ...block, selectedAlternative: altText } : block
      );
      set({ dayPlan: updated });
    },

    toggleAdoptSwap: (swapId: string) => {
      const { swaps, adoptedSwapIds, profile, airQuality } = get();
      const nextAdopted = { ...adoptedSwapIds, [swapId]: !adoptedSwapIds[swapId] };

      setStorageItem(STORAGE_KEYS.ADOPTED_SWAPS, nextAdopted);

      const updatedSwaps = swaps.map((s) =>
        s.id === swapId ? { ...s, adopted: !s.adopted } : s
      );

      const summary = calculateWeeklyImpactTotal(
        updatedSwaps,
        profile,
        airQuality?.pm25 ?? 100
      );

      set({
        swaps: updatedSwaps,
        adoptedSwapIds: nextAdopted,
        impactSummary: summary,
      });
    },

    togglePledge: (actionId: string) => {
      const { communityActions } = get();
      const updated = communityActions.map((action) => {
        if (action.id === actionId) {
          const nextPledged = !action.userPledged;
          return {
            ...action,
            userPledged: nextPledged,
            pledgeCount: action.pledgeCount + (nextPledged ? 1 : -1),
          };
        }
        return action;
      });

      const pledgeMap: Record<string, boolean> = {};
      updated.forEach((a) => {
        if (a.userPledged) pledgeMap[a.id] = true;
      });
      setStorageItem(STORAGE_KEYS.PLEDGES, pledgeMap);

      set({ communityActions: updated });
    },

    toggleSampleDataMode: () => {
      const { airQuality } = get();
      if (!airQuality) return;

      if (airQuality.isSampleData) {
        // Switch to live attempt
        get().loadAirQuality(true);
      } else {
        // Switch to sample
        set({ airQuality: getSampleAirData() });
        get().generatePlan(true);
      }
    },
  };
});
