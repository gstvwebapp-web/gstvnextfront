'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { GridContainer } from '@/components/common/GridComponents';
import { getVideoThumbnail, formatDate } from '@/utils/newsUtils';
import { API_ENDPOINTS, commonApiGet, commonApiPost, DEFAULT_API_PARAMS, COMMON_API_BASE_URL, API_V5_BASE_URL } from '@/constants/api';


interface VideoItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  featureImage?: string;
  videoURL?: string;
  created_at: string;
  updated_at: string;
  categories?: Array<{
    id: number;
    title: string;
    slug: string;
  }>;
}

interface VideoResponse {
  status: boolean;
  message: string;
  data: {
    current_page: number;
    data: VideoItem[];
    last_page: number;
    next_page_url: string | null;
    total: number;
  };
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface VideoCategoryProps {
  categorySlug?: string;
  subcategorySlug?: string;
}

export default function VideoCategory({ categorySlug = 'videos', subcategorySlug }: VideoCategoryProps) {
  const [videoData, setVideoData] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [categoryInfo, setCategoryInfo] = useState<{ name: string; slug: string } | null>(null);

  // Fetch videos data
  const fetchVideos = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      console.log(`🎥 Fetching videos for category: ${categorySlug}, subcategory: ${subcategorySlug}, page: ${page}`);

      const requestBody = {
        slug: categorySlug,
        subslug: subcategorySlug || '',
        pageNumber: page,
        device_id: DEFAULT_API_PARAMS.device_id,
        user_id: DEFAULT_API_PARAMS.user_id
      };

      const response = await fetch('/api/categorynews', {
        method: 'POST',
        cache: "no-store",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: VideoResponse = await response.json();
      console.log(`🎥 Videos API response for page ${page}:`, result);

      if (result.status && result.data) {
        const newVideos = result.data.data || [];
        
        if (append && page > 1) {
          setVideoData(prev => [...prev, ...newVideos]);
        } else {
          setVideoData(newVideos);
        }

        // Update pagination info
        setCurrentPage(result.data.current_page);
        setHasMoreData(!!result.data.next_page_url && newVideos.length > 0);
        
        // Set category info
        if (result.category) {
          setCategoryInfo({
            name: result.category.name,
            slug: result.category.slug
          });
        }

      } else {
        throw new Error(result.message || 'Failed to fetch videos');
      }
    } catch (err) {
     
      setError(err instanceof Error ? err.message : 'Failed to fetch videos');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [categorySlug, subcategorySlug, videoData.length]);

  // Load more videos for infinite scroll
  const loadMoreVideos = useCallback(async () => {
    if (!loadingMore && hasMoreData) {
      await fetchVideos(currentPage + 1, true);
    }
  }, [fetchVideos, currentPage, loadingMore, hasMoreData]);

  // Set up infinite scroll
  useInfiniteScroll({
    hasNextPage: hasMoreData,
    loading: loadingMore,
    onLoadMore: loadMoreVideos,
    threshold: 300
  });

  // Initial load
  useEffect(() => {
    setVideoData([]);
    setCurrentPage(1);
    setHasMoreData(true);
    fetchVideos(1, false);
  }, [categorySlug, subcategorySlug]);

  // Loading state
  if (loading && videoData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 20px' }}>
        <LoadingSpinner
          message="વિડિયો લોડ થઈ રહ્યા છે..."
          size="large"
          type="dots"
          color="#850E00"
        />
      </div>
    );
  }

  // Error state
  if (error && videoData.length === 0) {
    return (
      <ErrorMessage
        error={error}
        onRetry={() => fetchVideos(1, false)}
      />
    );
  }

  // No videos found
  if (!loading && videoData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 20px' }}>
        <h3 style={{ color: '#666', marginBottom: '10px' }}>No Videos Found</h3>
        <p style={{ color: '#999' }}>
          No videos available for this category at the moment.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Category Header */}
      <div className="blogs-head-bar first">
        <h2 className="custom-link-btn">
          {subcategorySlug 
            ? `${categoryInfo?.name || 'Videos'} - ${subcategorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`
            : categoryInfo?.name || 'Videos'
          }
        </h2>
        <div className="custom-link-btn">
          {videoData.length} Videos Found
        </div>
      </div>

     

      {/* Videos Grid */}
      <div className="blogs-main-section">
        <GridContainer className="blog-content">
          {videoData.map((video, index) => (
            <VideoGridItem
              key={`${video.id}-${index}`}
              video={video}
            />
          ))}
        </GridContainer>
      </div>
      <br />

      {/* Loading More Indicator */}
      {loadingMore && (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <LoadingSpinner
            message="વધુ વિડિયો લોડ થઈ રહ્યા છે..."
            size="medium"
            type="pulse"
            color="#850E00"
          />
        </div>
      )}

      {/* End of Data Indicator */}
      {!hasMoreData && videoData.length > 0 && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#666',
          borderTop: '1px solid #eee',
          marginTop: '20px'
        }}>
          <p>You've reached the end of the videos list.</p>
        </div>
      )}
    </>
  );
}

// Video Grid Item Component
interface VideoGridItemProps {
  video: VideoItem;
}

function VideoGridItem({ video }: VideoGridItemProps) {
  const videoUrl = `/videos/${video.slug}`;
  const imageUrl = getVideoThumbnail(video);

  return (
    <div className="col-lg-6">
      <div className="blog-read-content custom-top-news">
        <Link href={videoUrl} className="flexAlink">
          <h4 className="custom-blog-title">
            {video.title}
          </h4>
          <div className="hover-image video-thumbnail">
            <div className="lazyload-wrapper">
              <img
                src={imageUrl}
                className="gridimg custom-image"
                alt={video.title}
                style={{
                  objectFit: 'cover',
                  width: '100%',
                  height: 'auto'
                }}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = '/images/video-default.png';
                }}
              />
              {/* Video Play Icon Overlay */}
              <div className="video-play-overlay" style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '48px',
                color: 'white',
                textShadow: '0 0 10px rgba(0,0,0,0.7)',
                pointerEvents: 'none'
              }}>
                <i className="fa fa-play-circle"></i>
              </div>
            </div>
          </div>
          <p className="blog-excerpt">
            {video.description ? video.description.slice(0, 120) + '...' : ''}
          </p>
        </Link>

        <span className="last-update-blog for-lg">
          છેલ્લું અપડેટ : {formatDate(video.created_at)}
        </span>

        {/* Video Category Tags */}
        {video.categories && video.categories.length > 0 && (
          <div className="video-categories" style={{ marginTop: '10px' }}>
            {video.categories.slice(0, 2).map((category) => (
              <span 
                key={category.id}
                className="category-tag"
                style={{
                  display: 'inline-block',
                  background: '#850E00',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '3px',
                  fontSize: '11px',
                  marginRight: '5px'
                }}
              >
                {category.title}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
