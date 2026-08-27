'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import {
  formatDate,
  getImageUrl,
  handleBookmark,
  handleShare,
  isBookmarked as checkIsBookmarked,
  safeJsonParse,
  truncateDescription
} from '@/utils/commonUtils';
import { webStoryApi, WebStoryItem, WebStoryData } from '@/services/commonApiService';

interface WebStoryDetailProps {
  slug: string;
}

export default function WebStoryDetail({ slug }: WebStoryDetailProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [webStory, setWebStory] = useState<WebStoryItem | null>(null);
  const [storyData, setStoryData] = useState<WebStoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if web story is bookmarked on mount
  useEffect(() => {
    if (webStory && mounted) {
      setIsBookmarked(checkIsBookmarked(webStory.id, 'webstory'));
    }
  }, [webStory, mounted]);

  // Load web story detail
  const loadWebStoryDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`[WebStoryDetail] Loading web story detail for: ${slug}`);

      const response = await webStoryApi.getWebStoryDetail(slug);

      if (response.status === 'success' && response.data?.webstory) {
        const story = response.data.webstory;
        setWebStory(story);

        // Parse story data
        const parsedData = safeJsonParse<WebStoryData[]>(story.Story_data, []);
        setStoryData(parsedData);

        console.log(`[WebStoryDetail] Loaded web story:`, story);
        console.log(`[WebStoryDetail] Story data pages:`, parsedData.length);
      } else {
        setError('Web story not found');
      }
    } catch (err) {
      console.error('[WebStoryDetail] Error loading web story:', err);
      setError(err instanceof Error ? err.message : 'Failed to load web story');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount or slug change
  useEffect(() => {
    if (slug) {
      loadWebStoryDetail();
    }
  }, [slug]);

  // Handle bookmark toggle
  const toggleBookmark = async () => {
    if (!webStory || !mounted) return;
    
    try {
      const bookmarkData = {
        id: webStory.id,
        title: webStory.title,
        slug: webStory.slug,
        type: 'webstory' as const
      };
      
      const newBookmarkStatus = await handleBookmark(bookmarkData);
      setIsBookmarked(newBookmarkStatus);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  // Handle share
  const shareWebStory = async () => {
    if (!webStory || !mounted) return;

    const currentUrl = window.location.href;
    const shareData = {
      title: webStory.title,
      url: currentUrl,
      description: webStory.metadesc || webStory.title
    };
    
    await handleShare(shareData);
  };

  // Navigate to next page
  const nextPage = () => {
    if (currentPage < storyData.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Navigate to previous page
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Auto-advance pages
  useEffect(() => {
    if (!mounted || storyData.length === 0) return;

    const timer = setTimeout(() => {
      if (currentPage < storyData.length - 1) {
        setCurrentPage(currentPage + 1);
      }
    }, 5000); // 5 seconds per page

    return () => clearTimeout(timer);
  }, [currentPage, storyData.length, mounted]);

  // Prevent hydration issues
  if (!mounted) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <LoadingSpinner
          message="વેબ સ્ટોરી લોડ થઈ રહી છે..."
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
        <ErrorMessage
          error={error}
          onRetry={loadWebStoryDetail}
        />
      </div>
    );
  }

  // No data state
  if (!webStory || storyData.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Web story not found</h3>
        <p>The requested web story could not be found.</p>
        <button
          onClick={() => router.push('/web-stories')}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '15px',
            fontSize: '16px'
          }}
        >
          Back to Web Stories
        </button>
      </div>
    );
  }

  const currentStoryPage = storyData[currentPage];

  return (
    <>
      {/* SEO Meta Tags */}
      <Head>
        <title>{webStory.title} | GSTV News</title>
        <meta name="description" content={webStory.metadesc || webStory.title} />
        <meta name="keywords" content={webStory.metakeyword || 'web story, news, gstv'} />
        
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={webStory.title} />
        <meta property="og:description" content={webStory.metadesc || webStory.title} />
        {currentStoryPage && (
          <meta property="og:image" content={getImageUrl(currentStoryPage.webimage, 'webstory')} />
        )}
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={webStory.title} />
        <meta name="twitter:description" content={webStory.metadesc || webStory.title} />
        {currentStoryPage && (
          <meta name="twitter:image" content={getImageUrl(currentStoryPage.webimage, 'webstory')} />
        )}
      </Head>

      <div className="web-story-detail">
        {/* Header */}
        <div className="web-story-header">
          <button 
            onClick={() => router.push('/web-stories')}
            className="back-button"
          >
            <i className="fa fa-chevron-left"></i> Back to Web Stories
          </button>
          
          <div className="story-actions">
            <button
              onClick={toggleBookmark}
              className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
              title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              <i className={`fa ${isBookmarked ? 'fa-bookmark' : 'fa-bookmark-o'}`}></i>
            </button>
            
            <button
              onClick={shareWebStory}
              className="share-btn"
              title="Share web story"
            >
              <i className="fa fa-share"></i>
            </button>
          </div>
        </div>

        {/* Story Content */}
        <div className="web-story-content">
          {currentStoryPage && (
            <div className="story-page">
              <div className="story-image">
                <img
                  src={getImageUrl(currentStoryPage.webimage, 'webstory')}
                  alt={currentStoryPage.webtitles || webStory.title}
                  style={{ width: '100%', height: '100vh', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.src = '/images/default-webstory.png';
                  }}
                />
              </div>
              
              {currentStoryPage.webtitles && (
                <div className="story-text-overlay">
                  <h2 className="story-title custom-gujrati-font">
                    {currentStoryPage.webtitles}
                  </h2>
                  {currentStoryPage.webtitlescredit && (
                    <p className="story-credit custom-gujrati-font">
                      સોર્સ: {currentStoryPage.webtitlescredit}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="story-navigation">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className="nav-btn prev-btn"
          >
            <i className="fa fa-chevron-left"></i>
          </button>
          
          <div className="page-indicator">
            {storyData.map((_, index) => (
              <span
                key={index}
                className={`page-dot ${index === currentPage ? 'active' : ''}`}
                onClick={() => setCurrentPage(index)}
              />
            ))}
          </div>
          
          <button
            onClick={nextPage}
            disabled={currentPage === storyData.length - 1}
            className="nav-btn next-btn"
          >
            <i className="fa fa-chevron-right"></i>
          </button>
        </div>

        {/* Story Info */}
        <div className="story-info">
          <h1 className="story-main-title custom-gujrati-font">{webStory.title}</h1>
          <div className="story-meta">
            <span className="story-date">
              <i className="fa fa-calendar"></i> {formatDate(webStory.created_at)}
            </span>
            <span className="story-views">
              <i className="fa fa-eye"></i> {webStory.viewer + webStory.viewer_app} views
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
