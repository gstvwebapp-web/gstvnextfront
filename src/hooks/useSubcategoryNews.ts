import { useState, useEffect, useCallback } from 'react';
import { fetchTopNews, NewsItem } from '@/services/newsApi';

interface UseSubcategoryNewsReturn {
  newsData: NewsItem[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  loadMore: () => void;
  refetch: () => void;
}

export const useSubcategoryNews = (categorySlug: string, subcategorySlug: string): UseSubcategoryNewsReturn => {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);

  const loadSubcategoryNews = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      console.log(`Loading subcategory news: ${categorySlug}/${subcategorySlug}, page: ${page}, append: ${append}`);
      
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      // Use top news API and simulate pagination with filtering
      const topNewsData = await fetchTopNews();
      console.log('Top news data for subcategory:', topNewsData);
      
      const allNews = topNewsData.topnews || [];
      
      // Filter news by category and subcategory
      // This is a simulation - in real implementation, you'd filter by actual category/subcategory data
      const filteredNews = allNews.filter(item => {
        const matchesCategory = item.category_slugs?.includes(categorySlug) || 
                               item.slug?.toLowerCase().includes(categorySlug.toLowerCase()) ||
                               item.title?.toLowerCase().includes(categorySlug.toLowerCase());
        
        const matchesSubcategory = item.slug?.toLowerCase().includes(subcategorySlug.toLowerCase()) ||
                                  item.title?.toLowerCase().includes(subcategorySlug.toLowerCase()) ||
                                  item.description?.toLowerCase().includes(subcategorySlug.toLowerCase());
        
        return matchesCategory || matchesSubcategory;
      });
      
      // If no filtered results, use a subset of all news for demo
      const newsToUse = filteredNews.length > 0 ? filteredNews : allNews.slice(0, 20);
      
      const itemsPerPage = 6; // Show 6 items per page
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pageNews = newsToUse.slice(startIndex, endIndex);
      
      console.log(`Page ${page}: showing items ${startIndex} to ${endIndex} of ${newsToUse.length} filtered items`);
      
      if (append) {
        setNewsData(prev => [...prev, ...pageNews]);
      } else {
        setNewsData(pageNews);
      }
      
      setCurrentPage(page);
      const totalPages = Math.ceil(newsToUse.length / itemsPerPage);
      setTotalPages(totalPages);
      setHasMoreData(page < totalPages);
      
      console.log(`Subcategory pagination: page ${page}/${totalPages}, hasMore: ${page < totalPages}`);
      
    } catch (err) {
      console.error('Error loading subcategory news:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [categorySlug, subcategorySlug]);

  const loadMore = () => {
    if (hasMoreData && !loadingMore && !loading) {
      loadSubcategoryNews(currentPage + 1, true);
    }
  };

  const refetch = () => {
    setCurrentPage(1);
    setNewsData([]);
    loadSubcategoryNews(1, false);
  };

  useEffect(() => {
    loadSubcategoryNews(1, false);
  }, [categorySlug, subcategorySlug, loadSubcategoryNews]);

  return {
    newsData,
    loading: loading || loadingMore,
    error,
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
