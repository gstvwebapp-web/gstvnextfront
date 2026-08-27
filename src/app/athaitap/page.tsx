'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { API_ENDPOINTS, getMediaUrl } from '@/constants/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { COMMON_CLASSES, LOADING_MESSAGES } from '@/utils/uiUtils';

// TypeScript interfaces for the API response
interface AthaitapEntry {
  id: number;
  userID: number;
  name: string;
  days: number;
  mobile: string;
  address: string;
  featureImage: string | null;
  video?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  featureImageThumb?: string;
}

interface AthaitapData {
  current_page: number;
  data: AthaitapEntry[];
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
  data: AthaitapData;
}

const AthaitapPage: React.FC = () => {
  const [entries, setEntries] = useState<AthaitapEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState(false); // Track client-side mounting for date rendering

  // Check if user is logged in and set mounted state
  useEffect(() => {
    setIsMounted(true); // Set mounted to true after hydration

    const checkAuthStatus = () => {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('userData');
      }
    };

    checkAuthStatus();
  }, []);

  // Fetch entries from API
  const fetchEntries = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      // Direct API call to the new endpoint
      const response = await fetch(API_ENDPOINTS.ATHAITAP_LIST, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageNumber: page
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error('API returned unsuccessful response');
      }

      const apiData = result.data;

      if (append && page > 1) {
        setEntries(prev => [...prev, ...apiData.data]);
      } else {
        setEntries(apiData.data);
      }

      setCurrentPage(apiData.current_page);
      setLastPage(apiData.last_page);
      setHasMore(apiData.current_page < apiData.last_page);

    } catch (err) {
      console.error('Error fetching athaitap entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load entries');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchEntries(1);
  }, [fetchEntries]);

  // Load more function for button click
  const loadMoreEntries = () => {
    if (!loadingMore && hasMore) {
      fetchEntries(currentPage + 1, true);
    }
  };

  // Scroll handler for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (document.documentElement.scrollTop + window.innerHeight >= document.documentElement.scrollHeight - 100) {
        if (!loadingMore && hasMore) {
          loadMoreEntries();
        }
      }
    };

    // Debounce scroll events
    let timeoutId: NodeJS.Timeout;
    const debouncedHandleScroll = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(handleScroll, 200);
    };

    window.addEventListener('scroll', debouncedHandleScroll);
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loadingMore, hasMore]);

  // Helper functions for media URLs
  const getImageUrl = (imagePath: string | null): string => {
    if (!imagePath) return '/assets/images/gstv-logo-bg.png';
    return getMediaUrl(imagePath);
  };

  

  

  return (
    <div className="blogs-main-section-inner">
      <div className="blogs-head-bar first">
        <span className="blog-category">તપસ્વીઓના તપ</span>
        <div style={{ float: 'right' }}>
          <Link
            href="/addekasana"
            className="btn btn-primary newsuploadtext"
            style={{ float: 'right', backgroundColor: '#800d00', border: 'none' }}
          >
            તમારો ફોટો અપલોડ કરો
          </Link>
        </div>
      </div>

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
                                  onClick={() => fetchEntries(1, false)} 
                                  className="btn btn-primary"
                                >
                                  ફરી પ્રયાસ કરો
                                </button>
                              </div>
                            </div>
                          ) : (
             entries.map((entry, index) => (
              <div key={`${entry.id}-${index}`} className="col-lg-6">
                <div className="blog-read-content custom-top-news hometopnews">
                  <Link
                    href={`/athaitapdetails/${entry.id}`}
                    className="flexAlink"
                    title={entry.name}
                  >
                    <h4 className="custom-blog-title for-lg" style={{ height: '25px' }}>
                      {entry.name}
                    </h4>
                    <h4 className="custom-blog-title for-sm">
                      {entry.name}
                      <span className="athai-mobile for-sm">
                        <b>Days:</b> {entry.days} <br />
                        <b>Address:</b> {entry.address} <br />
                        <b>Phone:</b> {entry.mobile}
                        <p></p>
                      </span>
                    </h4>

                    <div className="hover-image">
                      <div className="lazyload-wrapper">
                        <img
                          style={{ margin: '0 auto' }}
                          src="/assets/images/gstv-logo-bg.png"
                          data-srcset={`${getImageUrl(entry.featureImage)} 480w, ${getImageUrl(entry.featureImage)} 800w`}
                          data-sizes="auto"
                          className="lazyload gridimg custom-image"
                          alt={entry.name}
                        />
                      </div>
                    </div>

                    <p className="blog-excerpt">
                      Address: {entry.address} <br />
                      Phone: {entry.mobile}
                    </p>
                  </Link>

                  <div className="blog-featured-functions">
                    <div className="reading-time-blog">
                      <span className="last-update-blog for-sm">
                        {isMounted ? (
                          new Date(entry.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })
                        ) : (
                          // Server-side fallback - show raw date
                          entry.created_at.split('T')[0]
                        )}
                      </span>
                    </div>

                  </div>
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
            alt="લોડ થઈ રહ્યું છે..."
          />
        </div>

      
    </div>
  );
};

export default AthaitapPage;