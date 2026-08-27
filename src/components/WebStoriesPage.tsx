'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchWebStories, WebStoryItem } from '@/services/webStoryApi';
import WebStoryCard from '@/components/WebStoryCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

interface WebStoriesData {
  stories: WebStoryItem[];
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  total: number;
}

// Note: Using imported LoadingSpinner and ErrorMessage components

export default function WebStoriesListPage() {
  const [data, setData] = useState<WebStoriesData>({
    stories: [],
    currentPage: 1,
    lastPage: 1,
    hasNextPage: false,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialPagesLoaded, setInitialPagesLoaded] = useState(false);

  const loadWebStories = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const response = await fetchWebStories(page);

      if (response.status && response.webstory) {
        const webStoriesData = response.webstory;

        const newData: WebStoriesData = {
          stories: webStoriesData.data || [],
          currentPage: webStoriesData.current_page || 1,
          lastPage: webStoriesData.last_page || 1,
          hasNextPage: !!webStoriesData.next_page_url,
          total: webStoriesData.total || 0
        };

        if (append && data.stories.length > 0) {
          setData(prev => ({
            ...newData,
            stories: [...prev.stories, ...newData.stories]
          }));
        } else {
          setData(newData);
        }
      } else {
        setError(response.message || 'Failed to load web stories');
      }
    } catch (error) {
      console.error('Error loading web stories:', error);
      setError('Failed to load web stories. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [data.stories.length]);

  // Load first two pages automatically
  const loadInitialPages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading first 2 pages automatically...');

      // Load page 1
      const page1Response = await fetchWebStories(1);
      if (!page1Response.status) {
        throw new Error(page1Response.message || 'Failed to load page 1');
      }

      let allStories = page1Response.webstory.data || [];
      let lastPageData = page1Response.webstory;

      // Load page 2 if it exists
      if (page1Response.webstory.last_page > 1) {
        const page2Response = await fetchWebStories(2);
        if (page2Response.status && page2Response.webstory.data) {
          allStories = [...allStories, ...page2Response.webstory.data];
          lastPageData = page2Response.webstory;
        }
      }

      const combinedData: WebStoriesData = {
        stories: allStories,
        currentPage: Math.min(2, lastPageData.last_page),
        lastPage: lastPageData.last_page,
        hasNextPage: lastPageData.last_page > 2,
        total: lastPageData.total || 0
      };

      setData(combinedData);
      setInitialPagesLoaded(true);
      console.log(`Loaded ${allStories.length} stories from first 2 pages`);

    } catch (error) {
      console.error('Error loading initial pages:', error);
      setError('Failed to load web stories. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreStories = useCallback(() => {
    if (loadingMore || !data.hasNextPage || data.currentPage >= data.lastPage || !initialPagesLoaded) {
      return;
    }
    loadWebStories(data.currentPage + 1, true);
  }, [loadWebStories, loadingMore, data.hasNextPage, data.currentPage, data.lastPage, initialPagesLoaded]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
      loadMoreStories();
    }
  }, [loadMoreStories]);

  useEffect(() => {
    loadInitialPages();
  }, [loadInitialPages]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 20px' }}>
        <LoadingSpinner
          message="વેબ સ્ટોરીઝ લોડ થઈ રહ્યા છે..."
          size="large"
          type="dots"
          color="#850E00"
        />
      </div>
    );
  }

  if (error && data.stories.length === 0) {
    return <ErrorMessage error={error} onRetry={() => loadInitialPages()} />;
  }

  return (
    <div className="blogs-main-section">
      {/* Header */}
      <div className="blogs-head-bar first">
        <span className="blog-category">વેબ સ્ટોરીઝ</span>
      </div>

      {/* Web Stories Grid */}
      <div className="infinite-scroll-component__outerdiv">
        <div className="infinite-scroll-component" style={{ height: 'auto', overflow: 'auto' }}>
          <div className="row blog-content web-story-content" id="webstory-container">
            {data.stories.map((story) => (
              <WebStoryCard key={story.id} webStory={story} />
            ))}
          </div>
        </div>
      </div>

      {/* Load More Button (Mobile) */}
      {data.hasNextPage && (
        <div className="catload-more-container text-center d-md-none">
          <button 
            id="catload-more-button" 
            className="btn btn-primary"
            onClick={loadMoreStories}
            disabled={loadingMore}
          >
            {loadingMore ? 'લોડ થઈ રહ્યું છે...' : 'વધુ લોડ કરો'}
          </button>
        </div>
      )}

      {/* Loading indicator for infinite scroll */}
      {loadingMore && (
        <LoadingSpinner
          message="વધુ વેબ સ્ટોરીઝ લોડ થઈ રહ્યા છે..."
          size="small"
          type="pulse"
          color="#850E00"
          compact={true}
        />
      )}

      {/* No more stories message */}
      {!data.hasNextPage && data.stories.length > 0 && (
        <div className="text-center py-4">
          <p className="text-muted">No more web stories to load</p>
        </div>
      )}

      {/* Error message for load more */}
      {error && data.stories.length > 0 && (
        <div className="text-center py-4">
          <ErrorMessage
            error={error}
            onRetry={() => loadWebStories(data.currentPage + 1, true)}
          />
        </div>
      )}
    </div>
  );
}
