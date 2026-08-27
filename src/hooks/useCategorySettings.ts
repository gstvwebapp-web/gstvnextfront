'use client';

/**
 * DEPRECATED: This hook is now a wrapper around useCategorySettingsContext
 * Please use useCategorySettingsContext directly from @/contexts/CategorySettingsContext
 * This file is kept for backward compatibility only.
 */

import { useCategorySettingsContext } from '@/contexts/CategorySettingsContext';

// Re-export types from context for backward compatibility
export type { CategorySettingsItem } from '@/contexts/CategorySettingsContext';

interface UseCategorySettingsReturn {
  categories: any[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  clearCache: () => void;
  invalidateCache: () => Promise<boolean>;
  isCached: boolean;
}

/**
 * Main hook to access category settings
 * This is now a wrapper around the CategorySettingsContext
 */
export const useCategorySettings = (): UseCategorySettingsReturn => {
 

  const context = useCategorySettingsContext();

  return {
    categories: context.categories,
    loading: context.loading,
    error: context.error,
    refetch: context.refetch,
    clearCache: context.clearCacheData,
    invalidateCache: context.invalidateCache,
    isCached: context.isCached
  };
};


