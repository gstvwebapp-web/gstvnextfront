/**
 * Cache utility functions for managing API caches
 */

// Client-side cache keys
export const CACHE_KEYS = {
  CATEGORY_SETTINGS: 'gstv_category_settings_client_cache',
  // Add more cache keys as needed
} as const;

// Cache TTL configurations (in milliseconds)
export const CACHE_TTL = {
  CATEGORY_SETTINGS: 30 * 60 * 1000, // 30 minutes
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 60 * 60 * 1000, // 1 hour
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
} as const;

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Generic function to save data to localStorage with expiration
 */
export function saveToCache<T>(key: string, data: T, ttlMs: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    const cacheEntry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlMs
    };
    
    localStorage.setItem(key, JSON.stringify(cacheEntry));
    
  } catch (error) {
    console.warn(`💾 Cache: Failed to save to ${key}:`, error);
  }
}

/**
 * Generic function to load data from localStorage with expiration check
 */
export function loadFromCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const cacheEntry: CacheEntry<T> = JSON.parse(cached);
    
    // Check if cache is still valid
    if (Date.now() > cacheEntry.expiresAt) {
     
      localStorage.removeItem(key);
      return null;
    }
    
   
    return cacheEntry.data;
  } catch (error) {
    
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * Clear specific cache entry
 */
export function clearCache(key: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(key);
    
  } catch (error) {
    console.warn(`💾 Cache: Failed to clear ${key}:`, error);
  }
}

/**
 * Clear all GSTV caches
 */
export function clearAllCaches(): void {
  if (typeof window === 'undefined') return;
  
  try {
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
   
  } catch (error) {
    console.warn('💾 Cache: Failed to clear all caches:', error);
  }
}

/**
 * Get cache info for debugging
 */
export function getCacheInfo(key: string): { exists: boolean; expired: boolean; age: number } | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return { exists: false, expired: false, age: 0 };
    
    const cacheEntry: CacheEntry = JSON.parse(cached);
    const now = Date.now();
    const age = now - cacheEntry.timestamp;
    const expired = now > cacheEntry.expiresAt;
    
    return { exists: true, expired, age };
  } catch (error) {
    
    return null;
  }
}

/**
 * Invalidate server-side cache by calling the DELETE endpoint
 */
export async function invalidateServerCache(endpoint: string): Promise<boolean> {
  try {
    
    
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      
      return true;
    } else {
     
      return false;
    }
  } catch (error) {
    
    return false;
  }
}

/**
 * Invalidate both client and server caches for category settings
 */
export async function invalidateCategorySettingsCache(): Promise<boolean> {
  try {
    // Clear client cache
    clearCache(CACHE_KEYS.CATEGORY_SETTINGS);
    
    // Invalidate server cache
    const serverInvalidated = await invalidateServerCache('/api/categorysetting');
    
    
    return serverInvalidated;
  } catch (error) {
    
    return false;
  }
}
