'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_ENDPOINTS } from '@/constants/api';
import { getImageUrl } from '@/utils/commonUtils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { LOADING_MESSAGES } from '@/utils/uiUtils';

interface NewsItem {
  id: number;
  created_at: string;
  slug: string;
  title: string;
  videoURL: string;
  featureImage: string;
  category_slugs: string;
}

interface GstvFastTrackProps {
  className?: string;
}

const GstvFastTrack: React.FC<GstvFastTrackProps> = ({ className = '' }) => {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchGstvFastTrack();
  }, []);



  const fetchGstvFastTrack = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[GstvFastTrack] Fetching data from:', API_ENDPOINTS.GSTV_FAST_TRACK);
      const response = await fetch(API_ENDPOINTS.GSTV_FAST_TRACK, {
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[GstvFastTrack] API Response:', data);
      console.log('[GstvFastTrack] Data keys:', Object.keys(data || {}));

      if (data && data.data) {
        console.log('[GstvFastTrack] data.data:', data.data);
        console.log('[GstvFastTrack] data.data is array:', Array.isArray(data.data));
      }

      // Handle different possible response formats
      let newsArray: NewsItem[] = [];

      if (data && data.gstvfasttrack && Array.isArray(data.gstvfasttrack)) {
        // Primary expected format from the API
        newsArray = data.gstvfasttrack;
      } else if (data && data.data && Array.isArray(data.data)) {
        newsArray = data.data;
      } else if (data && data.news && Array.isArray(data.news)) {
        newsArray = data.news;
      } else if (data && Array.isArray(data)) {
        newsArray = data;
      } else if (data && data.result && Array.isArray(data.result)) {
        newsArray = data.result;
      } else {
        console.warn('[GstvFastTrack] Unexpected API response format:', data);
        console.warn('[GstvFastTrack] Available keys:', Object.keys(data || {}));
        throw new Error('Invalid API response format - no valid news array found');
      }

      // Limit to 10 items like PHP function and ensure proper format
      const formattedNews = newsArray.slice(0, 10).map((item: any) => ({
        id: item.id || 0,
        created_at: item.created_at || '',
        slug: item.slug || '',
        title: item.title || '',
        videoURL: item.videoURL || item.video_url || null,
        featureImage: item.featureImage || item.feature_image || item.image || null,
        category_slugs: item.category_slugs || item.categorySlugs || 'gujarat'
      }));

     

      setNewsData(formattedNews);
      
    } catch (err) {
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to load GSTV Fast Track data';
      setError(errorMessage);
      setNewsData([]); // Clear any existing data
    } finally {
      setLoading(false);
    }
  };

  

  const getOptimizedImageUrl = (newsItem: NewsItem): string => {
    let imageUrl = '';

    if (newsItem.featureImage && newsItem.featureImage !== "") {
      // Use the common getImageUrl function for news images
      const baseImageUrl = getImageUrl(newsItem.featureImage, 'news');

      // Try to get small version by replacing extension
      const fileExtension = newsItem.featureImage.split('.').pop()?.toLowerCase() || '';
      imageUrl = baseImageUrl.replace(new RegExp(`\\.${fileExtension}$`, 'i'), `_small.${fileExtension}`);
    } else if (newsItem.videoURL) {
      // For video thumbnails
      const fileExtension = newsItem.videoURL.split('.').pop()?.toLowerCase() || '';
      imageUrl = newsItem.videoURL.replace(new RegExp(`\\.${fileExtension}$`, 'i'), '_video_small.jpg');
    }

    return imageUrl || '/images/gstv-logo-bg.png';
  };

  const formatCategorySlugs = (categorySlug: string): string => {
    if (!categorySlug) return '';
    return categorySlug.replace(/,/g, '/');
  };

  // Group news into chunks of 5
  const chunkedNews = [];
  for (let i = 0; i < newsData.length; i += 5) {
    chunkedNews.push(newsData.slice(i, i + 5));
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % chunkedNews.length);
  };

  // Auto-slide functionality
  useEffect(() => {
    if (chunkedNews.length > 1) {
      const interval = setInterval(nextSlide, 5000); // 5 seconds interval
      return () => clearInterval(interval);
    }
  }, [chunkedNews.length]);

  if (loading) {
    return (
      <div className={`gstv-fasttrack-container ${className}`}>
        <div className="storySectionNav blogs-head-bar first fastrack_head">
          <div className="storySectionNav-left">
            <h3 className="blog-category">GSTV ફાસ્ટ ટ્રેક</h3>
            <div className="position-relative">
              <Link href="/category/gujarat">
                <div className="arrow">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </Link>
            </div>
          </div>
        </div>
        <LoadingSpinner
          message={LOADING_MESSAGES.LOADING_NEWS}
          size="small"
          color="#850E00"
          compact={true}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`gstv-fasttrack-container ${className}`}>
        <div className="storySectionNav blogs-head-bar first fastrack_head">
          <div className="storySectionNav-left">
            <h3 className="blog-category">GSTV ફાસ્ટ ટ્રેક</h3>
            <div className="position-relative">
              <Link href="/category/gujarat">
                <div className="arrow">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </Link>
            </div>
          </div>
        </div>
        <div className="error-container" style={{ padding: '20px', textAlign: 'center' }}>
          <p className="custom-gujrati-font" style={{ color: '#dc3545', marginBottom: '10px' }}>
            GSTV Fast Track લોડ કરવામાં ભૂલ: {error}
          </p>
          <button
            onClick={fetchGstvFastTrack}
            className="retry-btn custom-gujrati-font"
            style={{
              backgroundColor: '#850E00',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ફરી પ્રયાસ કરો
          </button>
        </div>
      </div>
    );
  }

  // Don&apos;t render anything if no data and no error (still loading or empty response)
  if (newsData.length === 0) {
    return null;
  }

  // Get current chunk to display
  const currentChunk = chunkedNews[currentSlide] || [];

  return (
    <div className={`gstv-fasttrack-container ${className}`} style={{ border: '1px solid #800d00', borderRadius: '10px', overflow: 'hidden', margin: '0' }}>
      {/* Header */}
      <div className="storySectionNav blogs-head-bar first fastrack_head" style={{ marginBottom: '0', paddingBottom: '8px' }}>
        <div className="storySectionNav-left">
          <h3 className="blog-category">GSTV ફાસ્ટ ટ્રેક</h3>
          <div className="position-relative">
            <Link href="/category/gujarat">
              <div className="arrow">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Content - No spacing, direct connection to header */}
      <div style={{ backgroundColor: '#ffffff', padding: '0', margin: '0', marginTop: '0', gap: '0' }} className='row blog-read-content fastrack_container'>
        {currentChunk.map((newsItem, itemIndex) => (
          <div key={newsItem.id} style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 15px',
            borderBottom: itemIndex < currentChunk.length - 1 ? '1px solid #f0f0f0' : 'none',
            margin: '0'
          }} className='col-12 d-flex align-items-center'>
            <div style={{ flex: '0 0 60px', marginRight: '12px' }}>
              <Link href={`/news/${formatCategorySlugs(newsItem.category_slugs)}/${newsItem.slug}`}>
                <img
                  src={getOptimizedImageUrl(newsItem) || "/images/gstv-logo-bg.png"}
                  className="img-fluid fasttrackimg"
                  alt={newsItem.title}
                  style={{
                    objectFit: 'cover',
                    width: '60px',
                    height: '45px',
                    borderRadius: '4px',
                    display: 'block'
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/gstv-logo-bg.png";
                  }}
                />
              </Link>
            </div>
            <div className='text-container' style={{ flex: 1 }}>
              <h4 className='custom-blog-title' style={{
                margin: '0',
                fontSize: '16px',
                lineHeight: '25px',
                height: '50px',
                fontWeight: '600',
                fontFamily: '"Hind Vadodara", sans-serif'
              }}>
                <Link 
                  href={`/news/${formatCategorySlugs(newsItem.category_slugs)}/${newsItem.slug}`}
                  style={{
                    textDecoration: 'none',
                    display: 'block'
                  }}
                >
                  {newsItem.title}
                </Link>
              </h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GstvFastTrack;
