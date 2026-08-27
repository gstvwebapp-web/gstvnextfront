'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { NewsItem } from '@/services/newsApi';

interface UseTopVideosReturn {
  videos: NewsItem[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
}

export const useTopVideos = (): UseTopVideosReturn => {
  const [videos, setVideos] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Track which pages have been loaded to prevent duplicates
  const loadedPages = useRef<Set<number>>(new Set());
  const isLoadingRef = useRef(false);
  const lastLoadTime = useRef<number>(0);

  const PER_PAGE = 10;
  const MIN_LOAD_INTERVAL = 1000; // Minimum 1 second between loads

  const loadTopVideos = async (pageNum: number, append: boolean = false) => {
    // Prevent duplicate loading
    if (loadedPages.current.has(pageNum)) {
      console.log(`📹 Page ${pageNum} already loaded, skipping...`);
      return;
    }

    // Prevent concurrent loading
    if (isLoadingRef.current) {
      console.log(`📹 Already loading, skipping page ${pageNum}...`);
      return;
    }

    try {
      isLoadingRef.current = true;
      
      if (append) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log(`📹 Loading top videos - Page: ${pageNum}`);

      const response = await fetch('/api/topVideos', {
        method: 'POST',
        cache: 'force-cache', // Enable caching to reduce API calls
        next: { revalidate: 60 }, // Cache for 60 seconds
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: pageNum,
          per_page: PER_PAGE,
        }),
      });

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📹 API Response:', data);

      // Handle the pagination response structure
      let videoData: NewsItem[] = [];
      let hasMorePages = false;
      
      if (data.data && Array.isArray(data.data)) {
        // Response format: { current_page, data: [...], last_page, ... }
        videoData = data.data;
        hasMorePages = data.current_page < data.last_page;
        console.log(`📹 Page ${data.current_page} of ${data.last_page}`);
      } else if (data.topvideos && Array.isArray(data.topvideos)) {
        // Fallback format: { topvideos: [...] }
        videoData = data.topvideos;
        hasMorePages = videoData.length === PER_PAGE;
      } else if (Array.isArray(data)) {
        // Direct array format
        videoData = data;
        hasMorePages = videoData.length === PER_PAGE;
      } else {
        console.error('📹 Unexpected data structure:', data);
      }
      
      // Mark this page as loaded
      loadedPages.current.add(pageNum);
      
      if (append) {
        setVideos(prev => {
          // Filter out any duplicates by ID
          const existingIds = new Set(prev.map(v => v.id));
          const newVideos = videoData.filter(v => !existingIds.has(v.id));
          return [...prev, ...newVideos];
        });
      } else {
        setVideos(videoData);
      }

      // Update hasMore based on pagination info
      setHasMore(hasMorePages);

      const totalVideos = append ? videos.length + videoData.length : videoData.length;
      console.log(`📹 Loaded ${videoData.length} videos (Page ${pageNum}), Total: ${totalVideos}, Has More: ${hasMorePages}`);
      
    } catch (err) {
      console.error('Error loading top videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    loadTopVideos(1, false);
  }, []);

  const loadMore = useCallback(() => {
    // Throttle: Prevent loading too frequently
    const now = Date.now();
    if (now - lastLoadTime.current < MIN_LOAD_INTERVAL) {
      console.log(`📹 loadMore throttled - too soon (${now - lastLoadTime.current}ms since last load)`);
      return;
    }

    if (!isLoadingRef.current && hasMore && !loadedPages.current.has(page + 1)) {
      const nextPage = page + 1;
      console.log(`📹 loadMore called - Loading page ${nextPage}`);
      lastLoadTime.current = now;
      setPage(nextPage);
      loadTopVideos(nextPage, true);
    } else {
      if (loadedPages.current.has(page + 1)) {
        console.log(`📹 loadMore called - Page ${page + 1} already loaded, skipping`);
      }
    }
  }, [page, hasMore]);

  const refetch = () => {
    loadedPages.current.clear();
    setPage(1);
    setHasMore(true);
    setVideos([]);
    loadTopVideos(1, false);
  };

  return {
    videos,
    loading: loading && videos.length === 0, // Only show loading on initial load
    error,
    hasMore,
    loadMore,
    refetch
  };
};
