import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

// Cache configuration
const CACHE_TTL_MS = 0;//60 * 60 * 1000; // 1 hour cache
const CACHE_KEY = 'category_settings_cache';

// In-memory cache for server-side caching
interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

let serverCache: CacheEntry | null = null;

// Helper function to check if cache is valid
function isCacheValid(cache: CacheEntry | null): boolean {
  if (!cache) return false;
  return Date.now() < cache.expiresAt;
}

// Helper function to create cache entry
function createCacheEntry(data: any): CacheEntry {
  const now = Date.now();
  return {
    data,
    timestamp: now,
    expiresAt: now + CACHE_TTL_MS
  };
}

export async function GET(request: NextRequest) {
  try {
    // Check if we have valid cached data
    if (isCacheValid(serverCache)) {
      console.log('🏷️ Returning cached category settings data');
      return NextResponse.json(serverCache!.data, {
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          'X-Cache-Status': 'HIT'
        }
      });
    }

    console.log('🏷️ Cache miss - Fetching category settings from external API');

    // Make request to external API using the categorysetting endpoint (not categorysettingbyuser)
    const response = await fetch(API_ENDPOINTS.CATEGORY_SETTING, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GSTV-NextJS-App/1.0',
      },
      // Use Next.js caching for external API calls
      next: { revalidate: 3600 } // 1 hour revalidation
    });

    console.log('🏷️ Category settings API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🏷️ API Error Response:', errorText);

      // If we have stale cache data, return it during API errors
      if (serverCache) {
        console.log('🏷️ API error - returning stale cached data');
        return NextResponse.json(serverCache.data, {
          headers: {
            'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
            'X-Cache-Status': 'STALE'
          }
        });
      }

      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    // Prepare response data (handle array response or object wrapper)
    const categoryList = Array.isArray(data) ? data : (data.category || []);

    const responseData = {
      status: 'success',
      message: 'Categories fetched successfully',
      category: categoryList,
      setting: data.setting || [],
      sidemenu: data.sidemenu || [],
      language: data.language || {},
      cached_at: new Date().toISOString()
    };

    // Update server cache
    serverCache = createCacheEntry(responseData);
    console.log('🏷️ Category settings cached successfully');

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-Cache-Status': 'MISS'
      }
    });

  } catch (error) {
    console.error('🏷️ Error fetching category settings:', error);

    // If we have any cached data (even expired), return it during errors
    if (serverCache) {
      console.log('🏷️ Error occurred - returning stale cached data as fallback');
      return NextResponse.json(serverCache.data, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
          'X-Cache-Status': 'ERROR-FALLBACK'
        }
      });
    }

    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch categories',
        category: [],
        setting: [],
        sidemenu: [],
        language: {}
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if we have valid cached data
    if (isCacheValid(serverCache)) {
      console.log('🏷️ POST: Returning cached category settings data');
      return NextResponse.json(serverCache!.data, {
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          'X-Cache-Status': 'HIT'
        }
      });
    }

    console.log('🏷️ POST: Cache miss - Fetching category settings from external API');

    // Make request to external API using the categorysetting endpoint (not categorysettingbyuser)
    const response = await fetch(API_ENDPOINTS.CATEGORY_SETTING, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GSTV-NextJS-App/1.0',
      },
      // Use Next.js caching for external API calls
      next: { revalidate: 1 } // 1 hour revalidation
    });

    console.log('🏷️ POST: Category settings API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🏷️ POST: API Error Response:', errorText);

      // If we have stale cache data, return it during API errors
      if (serverCache) {
        console.log('🏷️ POST: API error - returning stale cached data');
        return NextResponse.json(serverCache.data, {
          headers: {
            'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
            'X-Cache-Status': 'STALE'
          }
        });
      }

      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('🏷️ POST: Category settings API response data received');

    // Prepare response data
    const responseData = {
      status: 'success',
      message: 'Categories fetched successfully',
      category: data.category || [], // Return all categories from the category[] array
      setting: data.setting || [],
      sidemenu: data.sidemenu || [],
      language: data.language || {},
      cached_at: new Date().toISOString()
    };

    // Update server cache
    serverCache = createCacheEntry(responseData);
    console.log('🏷️ POST: Category settings cached successfully');

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-Cache-Status': 'MISS'
      }
    });

  } catch (error) {
    console.error('🏷️ POST: Error fetching category settings:', error);

    // If we have any cached data (even expired), return it during errors
    if (serverCache) {
      console.log('🏷️ POST: Error occurred - returning stale cached data as fallback');
      return NextResponse.json(serverCache.data, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
          'X-Cache-Status': 'ERROR-FALLBACK'
        }
      });
    }

    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch categories',
        category: [],
        setting: [],
        sidemenu: [],
        language: {}
      },
      { status: 500 }
    );
  }
}

// DELETE method for cache invalidation
export async function DELETE(request: NextRequest) {
  try {
    console.log('🏷️ DELETE: Invalidating category settings cache');

    // Clear server cache
    serverCache = null;

    console.log('🏷️ DELETE: Cache invalidated successfully');

    return NextResponse.json({
      status: 'success',
      message: 'Category settings cache invalidated successfully',
      invalidated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('🏷️ DELETE: Error invalidating cache:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to invalidate cache'
      },
      { status: 500 }
    );
  }
}
