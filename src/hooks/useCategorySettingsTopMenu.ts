'use client';

/**
 * Hook to fetch category settings for the top menu
 * Uses the dedicated CATEGORY_SETTING_TOP_MENU endpoint via /api/categorysetting-topmenu
 * This is specifically for the top menu design on the home page
 */

import { useEffect, useState, useCallback } from 'react';
import {
  saveToCache,
  loadFromCache,
  clearCache,
  CACHE_KEYS,
  CACHE_TTL,
} from '@/utils/cacheUtils';
import { CategorySettingsItem } from '@/services/newsApi';

interface UseCategorySettingsTopMenuReturn {
  categories: CategorySettingsItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch category settings for top menu
 * This uses the /api/categorysetting-topmenu endpoint which proxies to CATEGORY_SETTING_TOP_MENU
 */
export const useCategorySettingsTopMenu = (): UseCategorySettingsTopMenuReturn => {
  const [categories, setCategories] = useState<CategorySettingsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApiCallInProgress, setIsApiCallInProgress] = useState(false);

  const CACHE_KEY = 'category_settings_topmenu';

  const loadTopMenuCategories = useCallback(async (forceRefresh = false) => {
    if (isApiCallInProgress) {
      console.log('🎯 useCategorySettingsTopMenu: API call already in progress');
      return;
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = loadFromCache<CategorySettingsItem[]>(CACHE_KEY);
      if (cachedData && cachedData.length > 0) {
        console.log('🎯 useCategorySettingsTopMenu: Using cached data');
        setCategories(cachedData);
        setLoading(false);
        setError(null);
        return;
      }
    }

    try {
      console.log('🎯 useCategorySettingsTopMenu: Starting API call to /api/categorysetting-topmenu');
      setIsApiCallInProgress(true);
      setLoading(true);
      setError(null);

      const apiUrl = '/api/categorysetting-topmenu';
      console.log('🎯 useCategorySettingsTopMenu: Fetching from URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('🎯 useCategorySettingsTopMenu: API response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🎯 useCategorySettingsTopMenu: API response data received');

      // Extract categories from the response
      const allCategories = data.category || [];
      console.log('🎯 useCategorySettingsTopMenu: Categories count:', allCategories.length);

      // Sort by catOrder (no need to build hierarchy for top menu - flat list)
      const sortedCategories = (allCategories as CategorySettingsItem[]).sort((a, b) => a.catOrder - b.catOrder);

      // Save to cache
      saveToCache(CACHE_KEY, sortedCategories, CACHE_TTL.CATEGORY_SETTINGS);

      // Update state
      setCategories(sortedCategories);
      setLoading(false);
      setError(null);

      console.log('🎯 useCategorySettingsTopMenu: Categories set successfully! Count:', sortedCategories.length);

    } catch (err) {
      console.error('🎯 useCategorySettingsTopMenu: Error loading categories:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to load top menu categories';
      setError(errorMsg);
      setLoading(false);
    } finally {
      setIsApiCallInProgress(false);
    }
  }, [isApiCallInProgress]);

  // Load on mount
  useEffect(() => {
    console.log('🎯 useCategorySettingsTopMenu: Hook mounted, loading categories');
    loadTopMenuCategories();
  }, [loadTopMenuCategories]);

  // Refetch function
  const refetch = useCallback(() => {
    console.log('🎯 useCategorySettingsTopMenu: Refetch called - forcing fresh data');
    clearCache(CACHE_KEY);
    setCategories([]);
    loadTopMenuCategories(true);
  }, [loadTopMenuCategories]);

  return {
    categories,
    loading,
    error,
    refetch,
  };
};
