/**
 * Common News Components
 * Reusable components for news display, loading states, and pagination
 */

import React, { memo, useMemo, useEffect, useRef } from 'react';
import { GridContainer, BlogGridItem } from '@/components/common/GridComponents';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { LOADING_MESSAGES, COMMON_CLASSES } from '@/utils/uiUtils';
import { NewsItem } from '@/utils/apiUtils';
import Link from 'next/link';

// ==============================
// News Grid
// ==============================
export interface NewsGridProps {
  newsData: NewsItem[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMoreData: boolean;
  currentCategory?: string;
  currentSubcategory?: string;
  className?: string;
  onRetry?: () => void;
  showEndMessage?: boolean;
}

export const NewsGrid: React.FC<NewsGridProps> = memo(({
  newsData,
  loading,
  loadingMore,
  error,
  hasMoreData,
  currentCategory = '',
  currentSubcategory = '',
  className = '',
  onRetry,
  showEndMessage = true
}) => {
  if (loading && newsData.length === 0) {
    return (
      <div className={COMMON_CLASSES.LOADING_CONTAINER}>
        <LoadingSpinner
          message={LOADING_MESSAGES.LOADING_NEWS}
          size="large"
          color="#850E00"
        />
      </div>
    );
  }

  if (error && newsData.length === 0) {
    return <ErrorMessage error={error} onRetry={onRetry} />;
  }

  // 🔥 Memoized list rendering
  const newsItems = useMemo(() => (
    newsData.map((news, index) => (
      <BlogGridItem
        key={`${news.id}-${index}`}
        news={news}
        currentCategory={currentCategory}
        currentSubcategory={currentSubcategory}
        className=""
      />
    ))
  ), [newsData, currentCategory, currentSubcategory]);

  return (
    <div className={className}>
      <GridContainer className={COMMON_CLASSES.BLOG_CONTENT}>
        {newsItems}
      </GridContainer>

      {loadingMore && (
        <LoadingSpinner
          message={LOADING_MESSAGES.LOADING_MORE_NEWS}
          size="small"
          color="#850E00"
          compact
        />
      )}

      {/* {showEndMessage && !loadingMore && !hasMoreData && newsData.length > 0 && (
        <div className="text-center py-4">
          <p className={`${COMMON_CLASSES.GUJARATI_FONT} text-gray-600`}>
            {LOADING_MESSAGES.END_OF_NEWS}
          </p>
        </div>
      )} */}
    </div>
  );
});
NewsGrid.displayName = 'NewsGrid';

// ==============================
// Category Header
// ==============================
export interface CategoryHeaderProps {
  categoryName: string;
  categorySlug: string;
  showViewAll?: boolean;
  className?: string;
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = memo(({
  categoryName,
  categorySlug,
  showViewAll = true,
  className = ''
}) => (
  <div className={`${COMMON_CLASSES.CATEGORY_HEADER} ${className}`}>
    <Link href={`/category/${categorySlug}`} className={COMMON_CLASSES.CATEGORY_TITLE}>
      {categoryName}
    </Link>
    {showViewAll && (
      <Link href={`/category/${categorySlug}`} className={COMMON_CLASSES.CATEGORY_LINK}>
        વધુ વાંચો <i className="fas fa-chevron-right" />
      </Link>
    )}
  </div>
));
CategoryHeader.displayName = 'CategoryHeader';

// ==============================
// News Section
// ==============================
export interface NewsSectionProps extends NewsGridProps {
  categoryName?: string;
  categorySlug?: string;
  showCategoryHeader?: boolean;
  showViewAll?: boolean;
}

export const NewsSection: React.FC<NewsSectionProps> = memo(({
  categoryName,
  categorySlug,
  showCategoryHeader = false,
  showViewAll = true,
  ...gridProps
}) => (
  <div className="news-section">
    {showCategoryHeader && categoryName && categorySlug && (
      <CategoryHeader
        categoryName={categoryName}
        categorySlug={categorySlug}
        showViewAll={showViewAll}
      />
    )}
    <NewsGrid {...gridProps} />
  </div>
));
NewsSection.displayName = 'NewsSection';

// ==============================
// Infinite Scroll Trigger
// ==============================
export interface InfiniteScrollTriggerProps {
  hasMoreData: boolean;
  loading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  className?: string;
}

export const InfiniteScrollTrigger: React.FC<InfiniteScrollTriggerProps> = memo(({
  hasMoreData,
  loading,
  onLoadMore,
  threshold = 100,
  className = ''
}) => {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!triggerRef.current || !hasMoreData || loading) return;

    const observer = new IntersectionObserver(
      entries => entries[0].isIntersecting && onLoadMore(),
      { rootMargin: `${threshold}px` }
    );

    observer.observe(triggerRef.current);

    return () => observer.disconnect();
  }, [hasMoreData, loading, onLoadMore, threshold]);

  if (!hasMoreData) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className={`${COMMON_CLASSES.GUJARATI_FONT} text-gray-600`}>
          {LOADING_MESSAGES.NO_MORE_DATA}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={triggerRef}
      className={`infinite-scroll-trigger ${className}`}
      style={{ height: 20, margin: '20px 0' }}
    />
  );
});
InfiniteScrollTrigger.displayName = 'InfiniteScrollTrigger';

// ==============================
// Skeleton (unchanged logic)
// ==============================
export const NewsCardSkeleton: React.FC<{ count?: number }> = memo(({ count = 4 }) => (
  <GridContainer className={COMMON_CLASSES.BLOG_CONTENT}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="news-card-skeleton">
        <div className="skeleton-image" />
        <div className="skeleton-content">
          <div className="skeleton-title" />
          <div className="skeleton-meta" />
        </div>
      </div>
    ))}
  </GridContainer>
));
NewsCardSkeleton.displayName = 'NewsCardSkeleton';
