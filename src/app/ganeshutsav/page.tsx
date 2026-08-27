'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { API_ENDPOINTS, getMediaUrl } from '@/constants/api';
import { COMMON_CLASSES, LOADING_MESSAGES } from '@/utils/uiUtils';
import LoadingSpinner from '@/components/LoadingSpinner';

// TypeScript interfaces for the API response
interface GaneshutsavEntry {
  id: number;
  userID: number;
  name: string;
  address: string;
  featureImage: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  featureImageThumb?: string;
}

interface GaneshutsavData {
  current_page: number;
  data: GaneshutsavEntry[];
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
  data: GaneshutsavData;
}

const GaneshutsavPage: React.FC = () => {
  const [entries, setEntries] = useState<GaneshutsavEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

 

  // Fetch entries from API
  const fetchEntries = useCallback(async (page: number = 1, append: boolean = false) => {
    console.log("ganeshuthsav..........");
    try {
      if (page === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      // Direct API call to the Ganeshutsav endpoint
      const response = await fetch(API_ENDPOINTS.GANESHUTSAV_LIST, {
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
      console.error('Error fetching ganeshutsav entries:', err);
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
        <span className="blog-category">ગણેશોત્સવ</span>
        <div style={{ float: 'right' }}>
          <Link
            href="/addganapati"
            className="btn btn-primary newsuploadtext"
            style={{ float: 'right', backgroundColor: '#800d00', border: 'none' }}
          >
            તમારા ગણેશજીના ફોટો અપલોડ કરો
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
                    href={`/ganeshutsavdetails/${entry.id}`}
                    className="flexAlink"
                    title={entry.name}
                  >
                    <h4 className="custom-blog-title for-lg" style={{ height: '25px' }}>
                      {entry.name}
                    </h4>
                    <h4 className="custom-blog-title for-sm">
                      {entry.name}
                      <span className="athai-mobile for-sm">
                        <b>Address:</b> {entry.address}
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
                      Address: {entry.address}
                    </p>
                  </Link>

                  <div className="blog-featured-functions">
                    <div className="reading-time-blog">
                      <span className="last-update-blog for-sm">
                        {new Date(entry.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
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

     

      <div id="loader">
          <img 
            className="loaderhome" 
            style={{ display: loadingMore ? 'block' : 'none' }} 
            src="/assets/images/loading.gif" 
            alt="લોડ કરી રહ્યું છે..."
          />
        </div>

      {/* Ads section - placeholder for ads component */}
      <div className="ads-section">
        {/* Add your ads component here */}
      </div>
    </div>
  );
};

export default GaneshutsavPage;
