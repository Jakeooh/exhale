import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearAllExhaleData,
} from '@/shared/lib/storage';
import { STORAGE_KEYS } from '@/shared/lib/constants';

describe('Local Storage Utility', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('retrieves default value when key does not exist', () => {
    const result = getStorageItem('non_existent_key', { fallback: true });
    expect(result).toEqual({ fallback: true });
  });

  it('stores and retrieves valid JSON data successfully', () => {
    const payload = { theme: 'dark', user: 'jake' };
    const success = setStorageItem('test_key', payload);
    expect(success).toBe(true);

    const retrieved = getStorageItem('test_key', null);
    expect(retrieved).toEqual(payload);
  });

  it('handles invalid/corrupt JSON gracefully by returning fallback', () => {
    localStorage.setItem('corrupt_key', '{invalid_json');
    const result = getStorageItem('corrupt_key', 'fallback_value');
    expect(result).toBe('fallback_value');
  });

  it('removes stored items correctly', () => {
    setStorageItem('remove_me', { a: 1 });
    expect(getStorageItem('remove_me', null)).toEqual({ a: 1 });

    removeStorageItem('remove_me');
    expect(getStorageItem('remove_me', null)).toBeNull();
  });

  it('returns false when storage write fails (e.g., quota exceeded)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const success = setStorageItem('heavy_key', 'large_data');
    expect(success).toBe(false);
  });

  it('purges all Exhale application keys and plan caches with clearAllExhaleData', () => {
    setStorageItem(STORAGE_KEYS.PROFILE, { name: 'Test User' });
    setStorageItem(STORAGE_KEYS.AIR_CACHE, { aqi: 150 });
    setStorageItem(STORAGE_KEYS.ADOPTED_SWAPS, ['swap_1', 'swap_2']);
    setStorageItem(STORAGE_KEYS.PLEDGES, { action_1: 5 });
    setStorageItem(STORAGE_KEYS.THEME, 'dark');
    setStorageItem(`${STORAGE_KEYS.PLAN_CACHE_PREFIX}_delhi`, { plan: [] });
    setStorageItem('unrelated_key', 'keep_me');

    clearAllExhaleData();

    expect(getStorageItem(STORAGE_KEYS.PROFILE, null)).toBeNull();
    expect(getStorageItem(STORAGE_KEYS.AIR_CACHE, null)).toBeNull();
    expect(getStorageItem(STORAGE_KEYS.ADOPTED_SWAPS, null)).toBeNull();
    expect(getStorageItem(STORAGE_KEYS.PLEDGES, null)).toBeNull();
    expect(getStorageItem(STORAGE_KEYS.THEME, null)).toBeNull();
    expect(getStorageItem(`${STORAGE_KEYS.PLAN_CACHE_PREFIX}_delhi`, null)).toBeNull();

    // Unrelated keys should remain untouched
    expect(getStorageItem('unrelated_key', null)).toBe('keep_me');
  });
});
