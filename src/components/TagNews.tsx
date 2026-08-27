'use client';

import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { GridContainer, BlogGridItem } from '@/components/common/GridComponents';
import { API_V5_BASE_URL } from '@/constants/api';

interface TagNewsProps {
  tagSlug: string;
}

interface NewsItem {
  id: number;
  title: string;
  description: string;
  content?: string;
  featureImage?: string;
  videoURL?: string;
  created_at?: string;
  updated_at?: string;
  slug?: string;
  catID?: string;
  tags?: string;
}

export default function TagNews({ tagSlug }: TagNewsProps) {
  const [mounted, setMounted] = useState(false);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug logging only after mounting
  useEffect(() => {
    if (mounted) {
      console.log('[TagNews] Component render:', {
        tagSlug,
        newsDataLength: newsData.length,
        loading,
        loadingMore,
        currentPage,
        hasMoreData,
        error
      });
    }
  }, [mounted, tagSlug, newsData.length, loading, loadingMore, currentPage, hasMoreData, error]);

  // Manual trigger for reload
  const handleLoadNews = () => {
    if (typeof window !== 'undefined') {
      console.log('[TagNews] Manual reload triggered for tag:', tagSlug);
    }
    loadTagNews(1, false);
  };

  // Load tag news with pagination
  const loadTagNews = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
        setNewsData([]);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      if (typeof window !== 'undefined') {
        console.log(`[TagNews] Loading page ${page} for tag: ${tagSlug}`);
      }

      const response = await fetch(`${API_V5_BASE_URL}/tagdetail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: tagSlug.replace(/-/g, " "),
          subslug: 'undefined',
          pageNumber: page.toString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let data = await response.json();

      if (typeof window !== 'undefined') {
        console.log(`[TagNews] v6 API Response for page ${page}:`, data);
        console.log(`[TagNews] Response keys:`, Object.keys(data || {}));
        console.log(`[TagNews] Has news property:`, !!data.news);
        console.log(`[TagNews] Has data property:`, !!data.data);
        if (data.news) {
          console.log(`[TagNews] News keys:`, Object.keys(data.news || {}));
          console.log(`[TagNews] News.data exists:`, !!data.news.data);
          console.log(`[TagNews] News.data length:`, data.news.data ? data.news.data.length : 'N/A');
        }
      }

      // Check if v6 API returned empty results, try v5 as fallback
      const hasV6Data = (data.news && data.news.data && data.news.data.length > 0) ||
                        (data.data && data.data.news && data.data.news.data && data.data.news.data.length > 0);

      if (!hasV6Data) {
        if (typeof window !== 'undefined') {
          console.log(`[TagNews] v6 API returned no results, trying v5 API as fallback`);
        }

        try {
          const v5Response = await fetch(`${API_V5_BASE_URL}/tagdetail`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              slug: tagSlug,
              subslug: 'undefined',
              pageNumber: page.toString(),
              device_id: '',
              user_id: ''
            })
          });

          if (v5Response.ok) {
            data = await v5Response.json();
            if (typeof window !== 'undefined') {
              console.log(`[TagNews] v5 API fallback response:`, data);
            }
          }
        } catch (v5Error) {
          if (typeof window !== 'undefined') {
            console.log(`[TagNews] v5 API fallback failed:`, v5Error);
          }
        }
      }

      // Handle different possible API response structures
      let newItems = [];
      let hasMore = false;
      let currentPageNum = page;

      if (data && data.news && data.news.data) {
        // Standard structure: data.news.data
        const newsData = data.news;
        newItems = newsData.data || [];
        hasMore = newItems.length > 0 && newsData.current_page < newsData.last_page;
        currentPageNum = newsData.current_page || page;

        if (typeof window !== 'undefined') {
          console.log(`[TagNews] Using data.news.data structure - ${newItems.length} items`);
        }
      } else if (data && data.data && data.data.news && data.data.news.data) {
        // Alternative structure: data.data.news.data
        const newsData = data.data.news;
        newItems = newsData.data || [];
        hasMore = newItems.length > 0 && newsData.current_page < newsData.last_page;
        currentPageNum = newsData.current_page || page;

        if (typeof window !== 'undefined') {
          console.log(`[TagNews] Using data.data.news.data structure - ${newItems.length} items`);
        }
      } else if (data && data.data && Array.isArray(data.data)) {
        // Direct array in data.data
        newItems = data.data;
        hasMore = newItems.length > 0;

        if (typeof window !== 'undefined') {
          console.log(`[TagNews] Using data.data array structure - ${newItems.length} items`);
        }
      } else if (data && Array.isArray(data)) {
        // Direct array response
        newItems = data;
        hasMore = newItems.length > 0;

        if (typeof window !== 'undefined') {
          console.log(`[TagNews] Using direct array structure - ${newItems.length} items`);
        }
      }

      if (typeof window !== 'undefined') {
        console.log(`[TagNews] Final result: ${newItems.length} items, hasMore: ${hasMore}`);
      }

      if (newItems.length > 0) {
        setHasMoreData(hasMore);
        setCurrentPage(currentPageNum);

        if (append) {
          // Filter out duplicates based on ID to prevent duplicate items
          setNewsData(prev => {
            const existingIds = new Set(prev.map((item: any) => item.id));
            const uniqueNewItems = newItems.filter((item: any) => !existingIds.has(item.id));

            if (typeof window !== 'undefined') {
              console.log(`[TagNews] PAGINATION: Adding ${uniqueNewItems.length} new items (filtered ${newItems.length - uniqueNewItems.length} duplicates)`);

              // Debug: Log first few items with their slugs
              if (uniqueNewItems.length > 0) {
                console.log('[TagNews] Sample news items with slugs:', uniqueNewItems.slice(0, 3).map((item: any) => ({
                  id: item.id,
                  title: item.title?.substring(0, 50) + '...',
                  slug: item.slug,
                  hasSlug: !!item.slug
                })));
              }
            }

            return [...prev, ...uniqueNewItems];
          });
        } else {
          setNewsData(newItems);

          // Debug: Log first few items with their slugs
          if (newItems.length > 0 && typeof window !== 'undefined') {
            console.log('[TagNews] Initial news items with slugs:', newItems.slice(0, 3).map((item: any) => ({
              id: item.id,
              title: item.title?.substring(0, 50) + '...',
              slug: item.slug,
              hasSlug: !!item.slug
            })));
          }
        }

        if (typeof window !== 'undefined') {
          console.log(`[TagNews] Updated state - Total items: ${append ? newsData.length + newItems.length : newItems.length}, Has more: ${hasMore}`);
        }
      } else {
        if (typeof window !== 'undefined') {
          console.log('[TagNews] No news data found in response');
          console.log('[TagNews] Full API response structure:', data);
        }
        setHasMoreData(false);
        if (!append) {
          setNewsData([]);
        }
      }
    } catch (err) {
      console.error('[TagNews] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tag news');
      setHasMoreData(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [tagSlug]);

  // Auto-load data when component mounts or tag changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('[TagNews] Auto-loading data for tag:', tagSlug, 'mounted:', mounted);
    }
    if (tagSlug && mounted) {
      loadTagNews(1, false);
    }
  }, [tagSlug, loadTagNews, mounted]);

  // Load more data when scrolling
  const loadMoreData = useCallback(() => {
    if (!loadingMore && hasMoreData) {
      loadTagNews(currentPage + 1, true);
    }
  }, [loadTagNews, currentPage, loadingMore, hasMoreData]);

  // Auto-scroll pagination
  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Load more when user is 300px from bottom
      if (scrollTop + windowHeight >= documentHeight - 300) {
        if (!loadingMore && hasMoreData) {
          if (typeof window !== 'undefined') {
            console.log('[TagNews] Auto-loading next page due to scroll');
          }
          loadMoreData();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreData, loadingMore, hasMoreData, mounted]);

  // Prevent hydration issues
  if (!mounted) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <LoadingSpinner
          message="ટેગ પેજ લોડ થઈ રહ્યું છે..."
          size="large"
          type="dots"
          color="#850E00"
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ color: 'red', marginBottom: '15px' }}>
          <strong>Error:</strong> {error}
        </div>
        <button
          onClick={handleLoadNews}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '15px',
            fontSize: '16px'
          }}
        >
          Retry Loading {tagSlug} News
        </button>
      </div>
    );
  }

  // Loading state
  if (loading && newsData.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <LoadingSpinner />
        <p style={{ marginTop: '20px', color: '#666' }}>
          Loading {tagSlug} news...
        </p>
      </div>
    );
  }

  // No news found state
  if (!loading && newsData.length === 0 && currentPage === 1) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📰</div>
        <h3 style={{ color: '#666', marginBottom: '10px' }}>No News Found</h3>
        <p style={{ color: '#999', marginBottom: '20px' }}>
          No news articles found for tag: <strong>{tagSlug}</strong>
        </p>
        <button
          onClick={handleLoadNews}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // No data state - show manual load button
  if (!loading && newsData.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Tag: {tagSlug}</h3>
        <p>Click the button below to load news for this tag.</p>
        <button
          onClick={handleLoadNews}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '15px',
            fontSize: '16px'
          }}
        >
          Load {tagSlug} News
        </button>
      </div>
    );
  }

  return (
    <div className="tag-news-section">
      {/* Debug Info */}
     

      

      {/* News Grid */}
      <div className="blogs-main-section-inner">
        {/* Tag Header */}
      <div className="blogs-head-bar first">
        <span className="blog-category">
          Tag: {tagSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </span>
        {/* <div className="custom-link-btn">
          {newsData.length} Articles Found
        </div> */}
      </div>
        <GridContainer className="blog-content">
          {newsData.map((news, index) => (
            <BlogGridItem
              key={`${news.id}-${index}`}
              news={news}
              currentCategory=""
            />
          ))}
        </GridContainer>
        {/* Loading More Indicator */}
      {loadingMore && (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <LoadingSpinner
            message={`વધુ ${tagSlug} સમાચાર લોડ થઈ રહ્યા છે...`}
            size="medium"
            type="pulse"
            color="#850E00"
          />
        </div>
      )}

      </div>
     
      
      {/* End of Data Indicator */}
     
    </div>
  );
}
