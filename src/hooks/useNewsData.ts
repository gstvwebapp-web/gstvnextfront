/**
 * Common News Data Hook
 * Reusable hook for managing news data, pagination, and loading states
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { commonNewsApi, ApiResponse, PaginatedResponse, NewsItem, handleApiError } from '@/utils/apiUtils';
import { LoadingState, PaginationState, createDebouncedScrollHandler } from '@/utils/uiUtils';

export interface UseNewsDataOptions {
  autoLoad?: boolean;
  enableInfiniteScroll?: boolean;
  scrollThreshold?: number;
  scrollDelay?: number;
  initialPages?: number; // 👈 ADD
}

export interface UseNewsDataReturn {
  // Data
  newsData: NewsItem[];
  
  // Loading states
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  hasMoreData: boolean;
  totalPages: number;
  total: number;
  
  // Actions
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook for Top News
 */
export function useTopNews(options: UseNewsDataOptions = {}): UseNewsDataReturn {
  const {
    autoLoad = true,
    enableInfiniteScroll = true,
    scrollThreshold = 100,
    scrollDelay = 100,
  } = options;

  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const loadNews = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      const response = await commonNewsApi.fetchTopNews(page);
      
      if (response.status === 'success' && response.data) {
        const paginatedData = response.data as PaginatedResponse<NewsItem>;
        
        if (append) {
          setNewsData(prev => [...prev, ...paginatedData.data]);
        } else {
          setNewsData(paginatedData.data);
        }
        
        setCurrentPage(paginatedData.current_page);
        setTotalPages(paginatedData.last_page);
        setTotal(paginatedData.total);
        setHasMoreData(paginatedData.current_page < paginatedData.last_page);
      } else {
        throw new Error(response.message || 'Failed to fetch news');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Error loading top news:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMoreData) return;
    await loadNews(currentPage + 1, true);
  }, [loadNews, loadingMore, hasMoreData, currentPage]);

  const refresh = useCallback(async () => {
    setCurrentPage(1);
    await loadNews(1, false);
  }, [loadNews]);

  const reset = useCallback(() => {
    setNewsData([]);
    setLoading(false);
    setLoadingMore(false);
    setError(null);
    setCurrentPage(1);
    setHasMoreData(true);
    setTotalPages(0);
    setTotal(0);
  }, []);

  // Auto load on mount
  useEffect(() => {
    if (autoLoad) {
      loadNews(1, false);
    }
  }, [autoLoad, loadNews]);

  // Infinite scroll
  useEffect(() => {
    if (!enableInfiniteScroll) return;

    const cleanup = createDebouncedScrollHandler(loadMore, scrollDelay, scrollThreshold);
    return cleanup;
  }, [enableInfiniteScroll, loadMore, scrollDelay, scrollThreshold]);

  return {
    newsData,
    loading,
    loadingMore,
    error,
    currentPage,
    hasMoreData,
    totalPages,
    total,
    loadMore,
    refresh,
    reset
  };
}

/**
 * Hook for Category News
 */
export function useCategoryNews(
  categorySlug: string,
  options: UseNewsDataOptions = {}
): UseNewsDataReturn {
  console.log('🚀🚀🚀 [useCategoryNews] Hook called with categorySlug:', JSON.stringify(categorySlug));
  console.log('🚀🚀🚀 [useCategoryNews] HOOK IS DEFINITELY BEING CALLED!');

  const {
    autoLoad = true,
    enableInfiniteScroll = true,
    scrollThreshold = 100,
    scrollDelay = 100
  } = options;

  console.log('🚀🚀🚀 [useCategoryNews] Options parsed: autoLoad=' + autoLoad + ', enableInfiniteScroll=' + enableInfiniteScroll);

  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const loadNews = useCallback(async (page: number = 1, append: boolean = false) => {
   
    if (!categorySlug) return;

    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      console.log('🔥 [useCategoryNews] About to call internal API route');
      // Use internal API route instead of direct external API call
      const response = await fetch('/api/categorynews', {
        method: 'POST',
        cache: "no-store",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category_slug: categorySlug,
          page: page
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse = await response.json();
     
      if (apiResponse.status === 'success' && apiResponse.data) {
        // For category news, the paginated data is in apiResponse.data
        const paginatedData = apiResponse.data as PaginatedResponse<NewsItem>;
       

        if (append) {
          setNewsData(prev => [...prev, ...paginatedData.data]);
        } else {
          setNewsData(paginatedData.data);
        }

        setCurrentPage(paginatedData.current_page);
        setTotalPages(paginatedData.last_page);
        setTotal(paginatedData.total);
        setHasMoreData(paginatedData.current_page < paginatedData.last_page);
      } else {
        throw new Error(apiResponse.message || 'Failed to fetch category news');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Error loading category news:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [categorySlug]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMoreData) return;
    await loadNews(currentPage + 1, true);
  }, [loadNews, loadingMore, hasMoreData, currentPage]);

  const refresh = useCallback(async () => {
    setCurrentPage(1);
    await loadNews(1, false);
  }, [loadNews]);

  const reset = useCallback(() => {
    setNewsData([]);
    setLoading(false);
    setLoadingMore(false);
    setError(null);
    setCurrentPage(1);
    setHasMoreData(true);
    setTotalPages(0);
    setTotal(0);
  }, []);

  // Auto load on mount or category change
  useEffect(() => {
    if (autoLoad && categorySlug) {
      setNewsData([]);
      setLoading(false);
      setLoadingMore(false);
      setError(null);
      setCurrentPage(1);
      setHasMoreData(true);
      setTotalPages(0);
      setTotal(0);
      loadNews(1, false);
    }
  }, [autoLoad, categorySlug]); // Only depend on the parameters that should trigger a reload

  // Infinite scroll
  useEffect(() => {
    if (!enableInfiniteScroll) return;

    const cleanup = createDebouncedScrollHandler(loadMore, scrollDelay, scrollThreshold);
    return cleanup;
  }, [enableInfiniteScroll, loadMore, scrollDelay, scrollThreshold]);

  return {
    newsData,
    loading,
    loadingMore,
    error,
    currentPage,
    hasMoreData,
    totalPages,
    total,
    loadMore,
    refresh,
    reset
  };
}

/**
 * Hook for Subcategory News
 */
export function useSubcategoryNews(
  categorySlug: string,
  subcategorySlug: string,
  options: UseNewsDataOptions = {}
): UseNewsDataReturn {

  const {
    autoLoad = true,
    enableInfiniteScroll = true,
    scrollThreshold = 100,
    scrollDelay = 100,
     initialPages = 1 // ✅ FIX
  } = options;


  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

 
  const loadNews = useCallback(async (page: number = 1, append: boolean = false) => {
  
    if (!categorySlug || !subcategorySlug) {
      return;
    }

    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      const response = await commonNewsApi.fetchSubcategoryNews(categorySlug, subcategorySlug, page);
  
      if (response.status === 'success' && response.data) {
        const paginatedData = response.data as PaginatedResponse<NewsItem>;
  
        if (append) {
          setNewsData(prev => [...prev, ...paginatedData.data]);
        } else {
          setNewsData(paginatedData.data);
        }

        setCurrentPage(paginatedData.current_page);
        setTotalPages(paginatedData.last_page);
        setTotal(paginatedData.total);
        setHasMoreData(paginatedData.current_page < paginatedData.last_page);
      } else {
        
        throw new Error(response.message || 'Failed to fetch subcategory news');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
 
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [categorySlug, subcategorySlug]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMoreData) return;
    await loadNews(currentPage + 1, true);
  }, [loadNews, loadingMore, hasMoreData, currentPage]);

  const refresh = useCallback(async () => {
    setCurrentPage(1);
    await loadNews(1, false);
  }, [loadNews]);

  const reset = useCallback(() => {
    setNewsData([]);
    setLoading(false);
    setLoadingMore(false);
    setError(null);
    setCurrentPage(1);
    setHasMoreData(true);
    setTotalPages(0);
    setTotal(0);
  }, []);

 
  // Manual auto-load logic (bypassing useEffect issues)
  // const loadedRef = useRef<string>('');
  // const currentKey = `${categorySlug}-${subcategorySlug}`;

  // if (autoLoad && categorySlug && subcategorySlug && newsData.length === 0 && !loading && loadedRef.current !== currentKey) {
  //   loadedRef.current = currentKey;
  //   reset();
  //   loadNews(1, false);
  // }

  // Auto-load effect (backup)
  // useEffect(() => {
 
  //   if (autoLoad && categorySlug && subcategorySlug && newsData.length === 0 && !loading) {
  //     reset();
  //     loadNews(1, false);
  //   }
  // }, [autoLoad, categorySlug, subcategorySlug]); // Only depend on the parameters, not the functions
      useEffect(() => {
        if (!autoLoad || !categorySlug || !subcategorySlug) return;

        let mounted = true;

        const loadInitialPages = async () => {
          reset();

          for (let page = 1; page <= initialPages; page++) {
            if (!mounted) break;
            await loadNews(page, page !== 1); // append from page 2
          }
        };

        loadInitialPages();

        return () => {
          mounted = false;
        };
      }, [categorySlug, subcategorySlug, initialPages]);

  // Infinite scroll
  useEffect(() => {
    if (!enableInfiniteScroll) return;

    const cleanup = createDebouncedScrollHandler(loadMore, scrollDelay, scrollThreshold);
    return cleanup;
  }, [enableInfiniteScroll, loadMore, scrollDelay, scrollThreshold]);

  return {
    newsData,
    loading,
    loadingMore,
    error,
    currentPage,
    hasMoreData,
    totalPages,
    total,
    loadMore,
    refresh,
    reset
  };
}
