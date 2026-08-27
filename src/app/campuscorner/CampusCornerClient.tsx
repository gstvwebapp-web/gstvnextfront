'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { API_ENDPOINTS, getGujaratImageUrl } from '@/constants/api';
import { LOADING_MESSAGES, COMMON_CLASSES } from '@/utils/uiUtils';
import LoadingSpinner from '@/components/LoadingSpinner';
import ShareButtons from '@/components/ShareButtons';
import { requireLogin } from '@/utils/authRedirect';


// TypeScript interfaces for the API response
interface CampusCornerEntry {
  id: number;
  userID: number;
  name: string;
  title: string;
  description: string;
  featureImage: string[];
  video: string | null;
  video_status: number;
  city: string;
  school: string;
  adminid: number;
  agree_status: number;
  status: string;
  created_at: string;
  updated_at: string;
  video_img: string | null;
}

interface PaginationData {
  current_page: number;
  data: CampusCornerEntry[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface ApiResponse {
  success: boolean;
  data: PaginationData;
}

const CampusCornerPage: React.FC = () => {
  const [entries, setEntries] = useState<CampusCornerEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Fetch campus corner entries from API
  const fetchCampusCornerEntries = useCallback(async (pageNumber: number = 1, append: boolean = false) => {
    try {
      if (pageNumber === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(API_ENDPOINTS.CAMPUS_CORNER_LIST, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageNumber: pageNumber.toString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error('API returned unsuccessful response');
      }

      const newEntries = result.data.data || [];

      if (append) {
        setEntries(prev => [...prev, ...newEntries]);
      } else {
        setEntries(newEntries);
      }

      setCurrentPage(result.data.current_page);
      setLastPage(result.data.last_page);

    } catch (err) {
      console.error('Error fetching campus corner entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load campus corner entries');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (entries.length === 0) {
      fetchCampusCornerEntries(1, false);
    }
  }, [fetchCampusCornerEntries, entries.length]);

  // Load more function - matching the staging site logic
  const loadMoreNews = useCallback(() => {
    if (loadingMore || currentPage >= lastPage) return;

    const nextPage = currentPage + 1;
    fetchCampusCornerEntries(nextPage, true);
  }, [loadingMore, currentPage, lastPage, fetchCampusCornerEntries]);

  // Infinite scroll handler - matching staging site implementation
  useEffect(() => {
    // Debounce function to limit the rate of execution
    const debounce = (func: (...args: unknown[]) => void, wait: number) => {
      let timeout: NodeJS.Timeout;
      return (...args: unknown[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    };

    const handleScroll = () => {
      console.log('Scroll event fired');
      if (document.documentElement.scrollTop + window.innerHeight >= document.documentElement.scrollHeight - 100) {
        loadMoreNews();
      }
    };

    // Bind scroll event with debouncing
    const debouncedHandleScroll = debounce(handleScroll, 200);
    window.addEventListener('scroll', debouncedHandleScroll);

    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
    };
  }, [loadMoreNews]);

  // Helper function for image URLs
  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return '/assets/images/news-default.png';
    return getGujaratImageUrl(imagePath);
  };

  


  // Helper function for video thumbnail URLs
  const getVideoThumbnailUrl = (videoImg: string | null, video: string | null): string => {
    if (videoImg) {
      return getGujaratImageUrl(videoImg);
    }
    if (video) {
      // Generate .webp thumbnail from video filename
      const videoName = video.split('/').pop()?.split('.')[0];
      return getGujaratImageUrl(`${videoName}.webp`);
    }
    return '/assets/images/news-default.png';
  };

  // Removed formatDate, shareOnSocial, and copyLink functions
  // Now using ShareButtons component with shareUtils

  return (
    <>
      {/* Title block for large screens */}


      <div className="blogs-main-section-inner">
        {/* Header for small screens */}
        <div className="blogs-head-bar first ">
          <span className="blog-category">
            કેમ્પસ કોર્નર
          </span>
          <div style={{ float: 'right' }}>
            <button onClick={() => requireLogin('/addcampuscorner')} className="btn btn-primary newsuploadtext"
                  style={{ float: 'right', backgroundColor: '#800d00', border: 'none' }}>
              તમારા કેમ્પસની પ્રવૃત્તિ અપલોડ કરો
            </button>
          </div>
        </div>



        {/* Content */}
        <div className="infinite-scroll-component__outerdiv">
          <div className="infinite-scroll-component" style={{ height: 'auto', overflow: 'auto' }}>
            <div className="row blog-content" id="news-container">
              {loading && entries.length === 0 ? (
                  <div className={COMMON_CLASSES.LOADING_CONTAINER}>
                    <LoadingSpinner 
                      message={LOADING_MESSAGES.LOADING}
                      size="large"
                      color="#850E00"
                    />
                  </div>
              ) : error ? (
                <div className="col-12 text-center">
                  <div className="error-message">
                    <p>{error}</p>
                    <button
                      onClick={() => fetchCampusCornerEntries(1, false)}
                      className="btn btn-primary"
                    >
                      ફરી પ્રયાસ કરો
                    </button>
                  </div>
                </div>
              ) : (
                entries.map((newsItem) => (
                  <div key={newsItem.id} className="col-lg-6">
                    <div className="blog-read-content custom-top-news hometopnews">
                      <Link href={`/campuscornerdetails/${newsItem.id}`} className="flexAlink" title={newsItem.name}>
                        <h4 className="custom-blog-title for-lg">{newsItem.title}</h4>
                        <h4 className="custom-blog-title for-sm">
                          {newsItem.title}
                          <span className="athai-mobile for-sm">
                            <b>રિપોર્ટેડ બાય:</b> {newsItem.name}
                          </span>
                        </h4>
                        <div className="hover-image">
                          {newsItem.video ? (
                            <div className="lazyload-wrapper">
                              <img
                                style={{ margin: '0 auto' }}
                                src="/assets/images/gstv-logo-bg.png"
                                data-srcset={`${getVideoThumbnailUrl(newsItem.video_img, newsItem.video)} 480w, ${getVideoThumbnailUrl(newsItem.video_img, newsItem.video)} 800w`}
                                data-sizes="auto"
                                className="lazyload gridimg custom-image"
                                alt={newsItem.name}
                              />
                            </div>
                          ) : (
                            <div className="lazyload-wrapper">
                              <img
                                style={{ margin: '0 auto' }}
                                src="/assets/images/gstv-logo-bg.png"
                                data-srcset={`${getImageUrl(newsItem.featureImage[0])} 480w, ${getImageUrl(newsItem.featureImage[0])} 800w`}
                                data-sizes="auto"
                                className="lazyload gridimg custom-image"
                                alt={newsItem.name}
                              />
                            </div>
                          )}
                          <p className="blog-excerpt">
                          <b>રિપોર્ટેડ બાય:</b> {newsItem.name}<br />
                          {/* <b>School:</b> {newsItem.school} */}
                        </p>
                        </div>
                        
                      </Link>
                      <div className="blog-featured-functions">
                                <div className="reading-time-blog" style={{float:'left'}}>
                                  
                                  <div className="custom-reading-time">
                                    <div className="reading-icon">
                                      <img src="/images/clock.webp" alt="gstv news" />
                                    </div>
                                    1 મિનિટ વાંચન સમય
                                  </div>
                                </div>
                     <ShareButtons
                        url={`${typeof window !== 'undefined' ? window.location.origin : ''}/campuscornerdetails/${newsItem.id}`}
                        title={newsItem.title}
                        variant="fontawesome"
                        showDate={true}
                        date={newsItem.created_at}
                        imageUrl={
                          newsItem.video
                            ? getVideoThumbnailUrl(newsItem.video_img, newsItem.video)
                            : getImageUrl(newsItem.featureImage[0])
                        }
                      /></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        <div id="loader">
          <img
            className="loaderhome"
            style={{ display: loadingMore ? 'block' : 'none' }}
            src="/assets/images/loading.gif"
            alt="Loading..."
          />
        </div>

        
      </div>
    </>
  );
};

export default CampusCornerPage;
