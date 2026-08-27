'use client';

import { useState, useEffect } from 'react';
import { fetchTopHomeCategory, NewsItem, TopHomeCategoryResponse } from '@/services/newsApi';

interface UseTopHomeCategoryReturn {
  newsData: NewsItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  hasMore: boolean;
  loadMore: () => void;
  currentPage: number;
  totalPages: number;
  total: number;
}

export const useTopHomeCategory = (): UseTopHomeCategoryReturn => {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fetchData = async (page: number = 1, append: boolean = false) => {
    try {
      console.log('TopHomeCategory: fetchData called with page:', page, 'append:', append);
      if (!append) {
        setLoading(true);
      }
      setError(null);

      const data = await fetchTopHomeCategory(page);
      console.log('TopHomeCategory: API response received:', data);

      if (data.status === 'success' && data.data) {
        const newNewsData = data.data.data || [];

        if (append) {
          setNewsData(prev => [...prev, ...newNewsData]);
        } else {
          setNewsData(newNewsData);
        }

        setCurrentPage(data.data.current_page);
        setTotalPages(data.data.last_page);
        setTotal(data.data.total);
        setHasMore(data.data.current_page < data.data.last_page);
      } else {
        throw new Error(data.message || 'Failed to fetch top home category');
      }
    } catch (err) {
      console.error('Error in useTopHomeCategory:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch top home category');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('TopHomeCategory: useEffect triggered, mounted:', mounted);
    setMounted(true);

    // Add a small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      console.log('TopHomeCategory: Starting data fetch...');
      fetchData(1, false);
    }, 100);

    return () => clearTimeout(timer);
  }, [mounted]);

  const refetch = () => {
    setCurrentPage(1);
    fetchData(1, false);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchData(currentPage + 1, true);
    }
  };

  return {
    newsData,
    loading,
    error,
    refetch,
    hasMore,
    loadMore,
    currentPage,
    totalPages,
    total
  };
};
