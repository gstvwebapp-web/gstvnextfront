import { useState, useEffect } from 'react';
import { fetchTopNews, NewsItem } from '@/services/newsApi';

interface UseTopNewsReturn {
  newsData: NewsItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook for managing top news data
 * @returns Object containing news data, loading state, error state, and refetch function
 */
export const useTopNews = (): UseTopNewsReturn => {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTopNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTopNews();
      setNewsData(data.topnews || []);
    } catch (err) {
      console.error('Error loading news:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    loadTopNews();
  };

  useEffect(() => {
    loadTopNews();
  }, []);

  return {
    newsData,
    loading,
    error,
    refetch
  };
};
