/**
 * Common UI Utility Functions
 * Reusable UI patterns and components logic
 */

import React from 'react';

// Loading States
export interface LoadingState {
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
}

// Pagination State
export interface PaginationState {
  currentPage: number;
  hasMoreData: boolean;
  totalPages: number;
  total: number;
}

// Common Loading Component Props
export interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  type?: 'spinner' | 'pulse' | 'dots';
  color?: string;
  className?: string;
}

// Common Error Component Props
export interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
  showRetryButton?: boolean;
}

// Common Pagination Component Props
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  className?: string;
}

// Common News Grid Props
export interface NewsGridProps {
  newsData: any[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMoreData: boolean;
  onLoadMore: () => void;
  currentCategory?: string;
  className?: string;
}

/**
 * Common Loading Messages in Gujarati
 */
export const LOADING_MESSAGES = {
  LOADING: 'લોડ થઈ રહ્યું છે...',
  LOADING_MORE: 'વધુ લોડ થઈ રહ્યું છે...',
  LOADING_NEWS: 'સમાચાર લોડ થઈ રહ્યા છે...',
  LOADING_MORE_NEWS: 'વધુ સમાચાર લોડ થઈ રહ્યા છે...',
  LOADING_VIDEOS: 'વીડિયો લોડ થઈ રહ્યા છે...',
  LOADING_CATEGORIES: 'કેટેગરી લોડ થઈ રહ્યા છે...',
  NO_MORE_DATA: '',
  END_OF_NEWS: 'તમે સમાચારના અંત સુધી પહોંચી ગયા છો.',
  RETRY: 'ફરી પ્રયાસ કરો',
  SOMETHING_WENT_WRONG: 'કંઈક ખોટું થયું છે'
} as const;

/**
 * Common CSS Classes for consistent styling
 */
export const COMMON_CLASSES = {
  // Loading states
  LOADING_CONTAINER: 'loading-container',
  LOADING_CONTAINER_COMPACT: 'loading-container-compact',
  LOADING_SPINNER: 'loading-spinner',
  LOADING_TEXT: 'loading-text',
  
  // Error states
  ERROR_CONTAINER: 'error-container',
  ERROR_MESSAGE: 'error-message',
  ERROR_RETRY_BUTTON: 'error-retry-button',
  
  // Grid layouts
  GRID_CONTAINER: 'grid-container',
  GRID_ITEM: 'grid-item',
  GRID_ONE_CLS: 'grid-one-cls',
  
  // News components
  NEWS_CARD: 'news-card',
  NEWS_IMAGE: 'news-image',
  NEWS_CONTENT: 'news-content',
  NEWS_TITLE: 'news-title',
  NEWS_META: 'news-meta',
  NEWS_ACTIONS: 'news-actions',
  
  // Category headers
  CATEGORY_HEADER: 'blogs-head-bar first',
  CATEGORY_TITLE: 'blog-category',
  CATEGORY_LINK: 'custom-link-btn',
  
  // Fonts
  GUJARATI_FONT: 'custom-gujrati-font',
  ENGLISH_FONT: 'english-font',
  
  // Sections
  MAIN_SECTION: 'blogs-main-section',
  BLOG_CONTENT: 'blog-content'
} as const;

/**
 * Generate loading spinner HTML
 */
export const generateLoadingSpinner = (props: LoadingSpinnerProps = {}): string => {
  const {
    message = LOADING_MESSAGES.LOADING,
    size = 'medium',
    type = 'spinner',
    color = '#850E00',
    className = ''
  } = props;

  const sizeClass = `loading-${size}`;
  const typeClass = `loading-${type}`;
  
  return `
    <div class="${COMMON_CLASSES.LOADING_CONTAINER} ${className}">
      <div class="${COMMON_CLASSES.LOADING_SPINNER} ${sizeClass} ${typeClass}" style="border-top-color: ${color}"></div>
      <p class="${COMMON_CLASSES.LOADING_TEXT} ${COMMON_CLASSES.GUJARATI_FONT}">${message}</p>
    </div>
  `;
};

/**
 * Generate error message HTML
 */
export const generateErrorMessage = (props: ErrorMessageProps): string => {
  const {
    message,
    onRetry,
    className = '',
    showRetryButton = true
  } = props;

  const retryButton = showRetryButton && onRetry ? `
    <button class="${COMMON_CLASSES.ERROR_RETRY_BUTTON}" onclick="${onRetry}">
      ${LOADING_MESSAGES.RETRY}
    </button>
  ` : '';

  return `
    <div class="${COMMON_CLASSES.ERROR_CONTAINER} ${className}">
      <p class="${COMMON_CLASSES.ERROR_MESSAGE} ${COMMON_CLASSES.GUJARATI_FONT}">${message}</p>
      ${retryButton}
    </div>
  `;
};

/**
 * Generate category header HTML
 */
export const generateCategoryHeader = (
  categoryName: string,
  categorySlug: string,
  showViewAll: boolean = true
): string => {
  const viewAllLink = showViewAll ? `
    <Link href="/category/${categorySlug}" class="${COMMON_CLASSES.CATEGORY_LINK}">
      વધુ વાંચો
      <i class="fas fa-chevron-right"></i>
    </Link>
  ` : '';

  return `
    <div class="${COMMON_CLASSES.CATEGORY_HEADER}">
      <Link href="/category/${categorySlug}" class="${COMMON_CLASSES.CATEGORY_TITLE}">${categoryName}</Link>
      ${viewAllLink}
    </div>
  `;
};

/**
 * Common scroll to top function
 */
export const scrollToTop = (smooth: boolean = true): void => {
  if (typeof window !== 'undefined') {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }
};

/**
 * Common infinite scroll handler
 */
export const handleInfiniteScroll = (
  callback: () => void,
  threshold: number = 100
): (() => void) => {
  const handleScroll = () => {
    if (typeof window === 'undefined') return;
    
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold;
    
    if (isNearBottom) {
      callback();
    }
  };

  // Add event listener
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', handleScroll);
  }

  // Return cleanup function
  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', handleScroll);
    }
  };
};

/**
 * Common debounced scroll handler
 */
export const createDebouncedScrollHandler = (
  callback: () => void,
  delay: number = 100,
  threshold: number = 100
): (() => void) => {
  let timeoutId: NodeJS.Timeout;

  const debouncedHandler = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      if (typeof window === 'undefined') return;
      
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold;
      
      if (isNearBottom) {
        callback();
      }
    }, delay);
  };

  // Add event listener
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', debouncedHandler);
  }

  // Return cleanup function
  return () => {
    clearTimeout(timeoutId);
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', debouncedHandler);
    }
  };
};

/**
 * Common share functionality
 */
export const shareNews = (news: any): void => {
  const shareData = {
    title: news.title,
    text: news.description || news.title,
    url: `${window.location.origin}/news/${news.slug}`
  };

  if (navigator.share) {
    navigator.share(shareData).catch(console.error);
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(shareData.url).then(() => {
      alert('લિંક કોપી થઈ ગઈ છે!'); // Link copied!
    }).catch(() => {
      // Fallback: open in new window
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.title)}&url=${encodeURIComponent(shareData.url)}`, '_blank');
    });
  }
};

/**
 * Common bookmark functionality
 */
export const bookmarkNews = (news: any): void => {
  // Get existing bookmarks from localStorage
  const existingBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
  
  // Check if already bookmarked
  const isBookmarked = existingBookmarks.some((bookmark: any) => bookmark.id === news.id);
  
  if (isBookmarked) {
    // Remove bookmark
    const updatedBookmarks = existingBookmarks.filter((bookmark: any) => bookmark.id !== news.id);
    localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
    alert('બુકમાર્ક દૂર કરવામાં આવ્યું!'); // Bookmark removed!
  } else {
    // Add bookmark
    existingBookmarks.push({
      id: news.id,
      title: news.title,
      slug: news.slug,
      featureImage: news.featureImage,
      created_at: news.created_at
    });
    localStorage.setItem('bookmarks', JSON.stringify(existingBookmarks));
    alert('બુકમાર્ક ઉમેરવામાં આવ્યું!'); // Bookmark added!
  }
};

/**
 * Check if news is bookmarked
 */
export const isNewsBookmarked = (newsId: number): boolean => {
  if (typeof window === 'undefined') return false;
  
  const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
  return bookmarks.some((bookmark: any) => bookmark.id === newsId);
};
