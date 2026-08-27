'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fetchTopHomeCategory, TopHomeCategoryResponse, NewsItem } from '@/services/newsApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { GridContainer, BlogGridItem } from '@/components/common/GridComponents';
import YoutubeShorts from '@/components/YoutubeShorts';
import Link from 'next/link';

interface TopHomeCategoryProps {
  className?: string;
}

export default function TopHomeCategory({ className = '' }: TopHomeCategoryProps) {
  console.log('🔥 TopHomeCategory component rendering! [FAST VERSION]');

  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMorePages, setHasMorePages] = useState<boolean>(true);

  const scrollLockRef = useRef(false);

  /* =========================
     GROUP NEWS (MEMOIZED)
     SAME LOGIC
  ========================= */
  const groupedNews = useMemo(() => {
    return newsData.reduce((acc, news) => {
      const categoryKey = news.category_slugs
        ? news.category_slugs.split(',')[0]
        : 'uncategorized';

      if (!acc[categoryKey]) acc[categoryKey] = [];
      acc[categoryKey].push(news);
      return acc;
    }, {} as Record<string, NewsItem[]>);
  }, [newsData]);

  /* =========================
     LOAD DATA (UNCHANGED LOGIC)
  ========================= */
  const loadData = useCallback(async (pageNumber: number, append: boolean = false) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);
      setError(null);

      const response: TopHomeCategoryResponse = await fetchTopHomeCategory(pageNumber);

      if (response?.data?.data) {
        const newNews = response.data.data;

        setNewsData(prev => (append ? [...prev, ...newNews] : newNews));
        setCurrentPage(response.data.current_page);
        setHasMorePages(response.data.current_page < response.data.last_page);
      } else {
        setError('Invalid data received from server.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      scrollLockRef.current = false;
    }
  }, []);

  /* =========================
     INITIAL LOAD
  ========================= */
  useEffect(() => {
    loadData(1, false);
  }, [loadData]);

  /* =========================
     INFINITE SCROLL (THROTTLED)
     SAME BEHAVIOR
  ========================= */
  useEffect(() => {
    const handleScroll = () => {
      if (scrollLockRef.current) return;

      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 1000 &&
        !loading &&
        !loadingMore &&
        hasMorePages
      ) {
        scrollLockRef.current = true;
        loadData(currentPage + 1, true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, loadingMore, hasMorePages, currentPage, loadData]);

  /* =========================
     LOADING STATE
  ========================= */
  if (loading && newsData.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <LoadingSpinner
          message="સમાચાર લોડ થઈ રહ્યા છે..."
          size="large"
          type="dots"
          color="#850E00"
        />
      </div>
    );
  }

  /* =========================
     ERROR STATE
  ========================= */
  if (error && newsData.length === 0) {
    return <ErrorMessage error={error} />;
  }

  /* =========================
     EMPTY STATE
  ========================= */
  if (newsData.length === 0 && !loading) {
    return (
      <div className={`top-home-category ${className}`}>
        <div className="text-center py-8">
          <p className="text-gray-600">No news available at the moment.</p>
        </div>
      </div>
    );
  }

  /* =========================
     RENDER (UNCHANGED UI)
  ========================= */
  return (
    <div className={`top-home-category ${className}`}>
      {Object.entries(groupedNews).map(([categorySlug, categoryNews]) => {
        const categoryName =
          categoryNews[0]?.category_name_guj ||
          categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);

        return (
          <div key={categorySlug}>
            <div className="blogs-main-section">
              <div className="blogs-head-bar first">
                <Link href={`/category/${categorySlug}`} className="blog-category">
                  {categoryName}
                </Link>
                <Link className="custom-link-btn" href={`/category/${categorySlug}`}>
                  વધુ વાંચો <i className="fas fa-chevron-right"></i>
                </Link>
              </div>

              <GridContainer>
                {categoryNews.slice(0, 6).map((news, index) => (
                  <BlogGridItem
                    key={news.id}
                    news={news}
                    currentCategory={categorySlug}
                    className={index < 2 ? '' : ''}
                  />
                ))}
              </GridContainer>
            </div>

            {/* Show YoutubeShorts after world category */}
            {categorySlug === 'world' && <YoutubeShorts />}
          </div>
        );
      })}

      {/* Loading more indicator (UNCHANGED) */}
      {loadingMore && (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <LoadingSpinner
            message="સમાચાર લોડ થઈ રહ્યા છે..."
            size="large"
            type="dots"
            color="#850E00"
          />
        </div>
      )}
    </div>
  );
}
