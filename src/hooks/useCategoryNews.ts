import { useState, useEffect, useCallback } from 'react';
import { fetchCategoryNews, NewsItem, CategoryNewsResponse } from '@/services/newsApi';

interface UseCategoryNewsReturn {
  newsData: NewsItem[];
  loading: boolean;
  error: string | null;
  categoryInfo: CategoryNewsResponse['category'] | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  loadMore: () => void;
  refetch: () => void;
}

/**
 * Custom hook for managing category news data
 * @param categorySlug - Category slug to fetch news for
 * @returns Object containing news data, loading state, error state, and pagination info
 */
export const useCategoryNews = (categorySlug: string): UseCategoryNewsReturn => {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryInfo, setCategoryInfo] = useState<CategoryNewsResponse['category'] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);

  const loadCategoryNews = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      console.log(`[useCategoryNews] Loading category news: ${categorySlug}, page: ${page}, append: ${append}`);

      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      console.log('[useCategoryNews] About to call fetchCategoryNews...');
      const categoryNewsData = await fetchCategoryNews(categorySlug, page);
      console.log('[useCategoryNews] Raw API response:', categoryNewsData);
      console.log('[useCategoryNews] News data structure:', categoryNewsData.data);
      console.log('[useCategoryNews] News items array:', categoryNewsData.data?.data);
      console.log('[useCategoryNews] News items count:', categoryNewsData.data?.data?.length);

      const pageNews = categoryNewsData.data?.data || [];
      console.log('[useCategoryNews] Processed page news:', pageNews);

      if (pageNews.length === 0) {
        console.warn('[useCategoryNews] No news items found in API response');
        console.log('[useCategoryNews] Full response for debugging:', JSON.stringify(categoryNewsData, null, 2));
      }

      if (append) {
        setNewsData(prev => {
          const newData = [...prev, ...pageNews];
          console.log('[useCategoryNews] Appended news data total:', newData.length);
          return newData;
        });
      } else {
        console.log('[useCategoryNews] Setting initial news data:', pageNews.length, 'items');
        setNewsData(pageNews);
      }

      if (categoryNewsData.category) {
        setCategoryInfo(categoryNewsData.category);
      }

      setCurrentPage(page);
      setTotalPages(categoryNewsData.data?.last_page || 1);
      setHasMoreData(categoryNewsData.data?.next_page_url !== null);

      console.log(`[useCategoryNews] Pagination: page ${page}/${categoryNewsData.data?.last_page || 1}, hasMore: ${categoryNewsData.data?.next_page_url !== null}`);

    } catch (err) {
      console.error('[useCategoryNews] Error loading category news:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      console.log('[useCategoryNews] Finally block - setting loading to false');
      setLoading(false);
      setLoadingMore(false);
    }
  }, [categorySlug]);

  const loadMore = () => {
    if (hasMoreData && !loadingMore && !loading) {
      loadCategoryNews(currentPage + 1, true);
    }
  };

  const refetch = () => {
    setCurrentPage(1);
    loadCategoryNews(1, false);
  };

  useEffect(() => {
    console.log('useCategoryNews effect triggered for:', categorySlug);
    if (categorySlug) {
      loadCategoryNews(1, false);
    }
  }, [categorySlug, loadCategoryNews]);

  return {
    newsData,
    loading: loading || loadingMore,
    error,
    categoryInfo,
    pagination: {
      currentPage,
      totalPages,
      hasNextPage: hasMoreData,
      hasPrevPage: currentPage > 1,
    },
    loadMore,
    refetch,
  };
};





