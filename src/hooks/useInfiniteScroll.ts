import { useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
  hasNextPage: boolean;
  loading: boolean;
  onLoadMore: () => void;
  threshold?: number; // Distance from bottom to trigger load (in pixels)
}

export const useInfiniteScroll = ({
  hasNextPage,
  loading,
  onLoadMore,
  threshold = 300
}: UseInfiniteScrollOptions) => {
  const loadingRef = useRef(false);

  const handleScroll = useCallback(() => {
    // Prevent multiple simultaneous calls
    if (loadingRef.current || loading || !hasNextPage) {
      return;
    }

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Check if user has scrolled near the bottom
    const distanceFromBottom = documentHeight - (scrollTop + windowHeight);

    if (distanceFromBottom < threshold) {
      loadingRef.current = true;
      onLoadMore();
      
      // Reset loading flag after a short delay
      setTimeout(() => {
        loadingRef.current = false;
      }, 1000);
    }
  }, [hasNextPage, loading, onLoadMore, threshold]);

  useEffect(() => {
    // Throttle scroll events
    let timeoutId: NodeJS.Timeout;
    
    const throttledHandleScroll = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [handleScroll]);

  // Reset loading ref when loading state changes
  useEffect(() => {
    if (!loading) {
      loadingRef.current = false;
    }
  }, [loading]);
};
