/**
 * @file Safe localStorage access with versioned keys and graceful fallbacks
 */

import { STORAGE_KEYS } from './constants';

export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined' || !window.localStorage) {
    return defaultValue;
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/**
 * Completely purges all user data and cached profiles from localStorage.
 */
export function clearAllExhaleData(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.PROFILE);
    window.localStorage.removeItem(STORAGE_KEYS.AIR_CACHE);
    window.localStorage.removeItem(STORAGE_KEYS.ADOPTED_SWAPS);
    window.localStorage.removeItem(STORAGE_KEYS.PLEDGES);
    window.localStorage.removeItem(STORAGE_KEYS.THEME);

    // Also remove any plan caches
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(STORAGE_KEYS.PLAN_CACHE_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // ignore
  }
}
