'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { COMMON_API_BASE_URL, MEDIA_BASE_URL } from '@/constants/api';

interface PodcastAuthor {
  id: number;
  authorname: string;
  authorslug: string;
  authorimg: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface PodcastApiResponse {
  podcastauthordata: PodcastAuthor[];
  status?: boolean;
  message?: string;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

const PodcastPage: React.FC = () => {
  const [podcasts, setPodcasts] = useState<PodcastAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  const backendUrl = MEDIA_BASE_URL + '/backend2';
  const defaultImage = '/assets/images/video-default.png';

  const fetchPodcasts = useCallback(async (page: number, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      console.log('🎙️ Podcast: Fetching podcasts for page:', page);

      // Call the API using constants
      const response = await fetch(`${COMMON_API_BASE_URL}/podcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          pageNumber: page.toString()
        }),
      });

      console.log('🎙️ Podcast: API response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🎙️ Podcast: API response data:', data);

      if (!data.podcast || !data.podcast.data) {
        throw new Error('No podcast data found');
      }

      const podcastData = data.podcast.data;

      if (append) {
        setPodcasts(prev => [...prev, ...podcastData]);
      } else {
        setPodcasts(podcastData);
      }

      setCurrentPage(data.podcast.current_page || page);
      setTotalPages(data.podcast.last_page || 1);
      setHasMorePages((data.podcast.current_page || page) < (data.podcast.last_page || 1));

      console.log('🎙️ Podcast: Podcasts loaded:', podcastData.length);
    } catch (err) {
      console.error('🎙️ Podcast: Error fetching podcasts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load podcasts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPodcasts(1);
  }, [fetchPodcasts]);

  const handleLoadMore = () => {
    if (hasMorePages && !loadingMore) {
      fetchPodcasts(currentPage + 1, true);
    }
  };

  const getFeatureImage = (podcast: PodcastAuthor) => {
    if (podcast.authorimg) {
      // If the image URL is already absolute, use as is
      if (podcast.authorimg.startsWith('http')) {
        return podcast.authorimg;
      }
      // If it's a relative path, make it absolute using MEDIA_BASE_URL
      if (podcast.authorimg.startsWith('/')) {
        return `${MEDIA_BASE_URL}${podcast.authorimg}`;
      }
      // If it's just a filename, use the uploads path
      return `${MEDIA_BASE_URL}/public/uploads/podcast/${podcast.authorimg}`;
    }
    return defaultImage;
  };

  if (loading) {
    return (
      <div className="blogs-main-section">
        <div className="blogs-head-bar first">
          <span className="blog-category">GSTV પોડકાસ્ટ</span>
        </div>
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          <i className="fa-solid fa-spinner fa-spin"></i>
          <span style={{ marginLeft: '8px' }}>પોડકાસ્ટ લોડ કરી રહ્યું છે...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blogs-main-section">
        <div className="blogs-head-bar first">
          <span className="blog-category">GSTV પોડકાસ્ટ</span>
        </div>
        <div style={{ padding: '40px', textAlign: 'center', color: '#e74c3c' }}>
          <i className="fa-solid fa-exclamation-triangle"></i>
          <span style={{ marginLeft: '8px' }}>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="blogs-main-section">
        <div className="blogs-head-bar first">
          <span className="blog-category">GSTV પોડકાસ્ટ</span>
        </div>

      <div className="infinite-scroll-component__outerdiv">
        <div className="infinite-scroll-component" style={{ height: 'auto', overflow: 'auto' }}>
          <div className="row blog-content" id="podcast-list">
            {podcasts.map((podcast, index) => (
              <div key={`${podcast.id}-${index}`} className="col-lg-4 col-6">
                <Link href={`/podcast/${podcast.id}/${podcast.authorslug}`} className="podcast-card">
                  <div className="lazyload-wrapper">
                    <img
                      src={getFeatureImage(podcast)}
                      className="gridimg podcast-image custom-image"
                      alt={podcast.authorname}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = defaultImage;
                      }}
                      onLoad={() => {
                        console.log('Image loaded:', getFeatureImage(podcast));
                      }}
                    />
                  </div>
                  <div className="play-button"></div>
                  <div className="podcast-content">
                    <div className="podcast-title">{podcast.authorname}</div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {hasMorePages && (
        <div className="catload-more-container text-center">
          <button
            id="catload-more-button"
            className="btn btn-primary"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                <span style={{ marginLeft: '8px' }}>લોડ કરી રહ્યું છે...</span>
              </>
            ) : (
              'વધુ લોડ કરો'
            )}
          </button>
        </div>
      )}


      </div>
  );
};

export default PodcastPage;
