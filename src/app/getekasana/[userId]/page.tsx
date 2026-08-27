'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { API_ENDPOINTS, getEkasanaImageUrl } from '@/constants/api';

// TypeScript interfaces for the API response
interface EkasanaEntry {
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

interface EkasanaData {
  current_page: number;
  data: EkasanaEntry[];
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

interface UserInfo {
  id: number;
  name: string;
  firstname?: string;
  lastname?: string;
  mobile: string;
  email?: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    ekasanalist: EkasanaData;
    user?: UserInfo;
    totalCount?: number;
  };
}

const GetEkasanaPage: React.FC = () => {
  const params = useParams();
  const [entries, setEntries] = useState<EkasanaEntry[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);

  const userId = params?.userId as string;

  // Fetch entries from API
  const fetchEntries = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      // API call to get user's Ekasana entries
      const response = await fetch(API_ENDPOINTS.ATHAITAP_GET_USER_ENTRIES, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: parseInt(userId),
          pageNumber: page
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error('API returned unsuccessful response');
      }

      const apiData = result.data;

      // Set user info on first load
      if (page === 1) {
        if (apiData.user) {
          setUserInfo(apiData.user);
        }
        if (apiData.totalCount) {
          setTotalCount(apiData.totalCount);
        }
      }

      if (append && page > 1) {
        setEntries(prev => [...prev, ...apiData.ekasanalist.data]);
      } else {
        setEntries(apiData.ekasanalist.data);
      }

      setCurrentPage(apiData.ekasanalist.current_page);
      setLastPage(apiData.ekasanalist.last_page);
      setHasMore(apiData.ekasanalist.current_page < apiData.ekasanalist.last_page);

    } catch (err) {
      console.error('Error fetching user ekasana entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load entries');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    if (userId) {
      fetchEntries(1);
    }
  }, [fetchEntries, userId]);

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
    return getEkasanaImageUrl(imagePath);
  };

  // Loading state
  if (loading && entries.length === 0) {
    return (
      <div className="contents-main-div" id="middlePage">
        <div className="profilePage peopleNewsPage">
          <div className="pNewsBox">
            <div className="title">
              <h2>તપસ્વીઓના તપ</h2>
              <Link
                href="/addekasana"
                className="btn btnAddpNews"
                style={{ backgroundColor: '#800d00', border: 'none', color: 'white' }}
              >
                એડ કરો <span>+</span>
              </Link>
            </div>
            <div className="pnewsContent">
              <div className="text-center">
                <div className="loading-spinner">
                  <p>લોડ થઈ રહ્યું છે...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && entries.length === 0) {
    return (
      <div className="contents-main-div" id="middlePage">
        <div className="profilePage peopleNewsPage">
          <div className="pNewsBox">
            <div className="title">
              <h2>તપસ્વીઓના તપ</h2>
              <Link
                href="/addekasana"
                className="btn btnAddpNews"
                style={{ backgroundColor: '#800d00', border: 'none', color: 'white' }}
              >
                એડ કરો <span>+</span>
              </Link>
            </div>
            <div className="pnewsContent">
              <div className="text-center">
                <div className="error-message">
                  <p style={{ color: 'red' }}>{error}</p>
                  <button
                    onClick={() => fetchEntries(1)}
                    className="btn btn-primary"
                  >
                    ફરીથી પ્રયાસ કરો
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <link rel="stylesheet" href="/assets/css/profile.css" />
      <style jsx>{`
        .btnloadmorecls {
          color: white;
          font-size: 14px;
          background-color: var(--primary-color);
          box-shadow: 0px 5px 10px 0px rgb(64 64 64 / 14%);
          border: none;
          padding: 6px 20px;
          text-align: center;
          border-radius: 5px;
          text-transform: capitalize;
          letter-spacing: 1px;
          border: 1px solid var(--primary-color);
          margin-top: 10px;
          font-weight: bold;
        }
        .btnloadmorecls:hover {
          background-color: transparent;
          color: #000;
        }
        .btnAddpNews {
          background-color: #800d00 !important;
          border: none !important;
          color: white !important;
          padding: 8px 15px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: bold;
        }
        .btnAddpNews:hover {
          background-color: #600a00 !important;
          color: white !important;
        }
      `}</style>
      
      <div className="contents-main-div" id="middlePage">
        <div className="profilePage peopleNewsPage">
          <div className="pNewsBox">
            <div className="title">
              <h2>
                તપસ્વીઓના તપ
                {userInfo && (
                  <span style={{ fontSize: '16px', fontWeight: 'normal', marginLeft: '10px' }}>
                    - {userInfo.firstname} {userInfo.lastname}
                  </span>
                )}
              </h2>
              <Link href="/addekasana" className="btn btnAddpNews">
                એડ કરો <span>+</span>
              </Link>
            </div>

            <div className="pnewsContent">
              <div className="bookmark_list peopleNewsList">
                <div className="bookmarklisting">
                  {entries.length === 0 ? (
                    <div className="bookmarkNolisting">
                      <p style={{ color: 'red' }} className="text-center">No Ekasana available.</p>
                    </div>
                  ) : (
                    <>
                      <ul id="bookmark-list">
                        {entries.map((entry, index) => (
                          <li key={`${entry.id}-${index}`} id={`bookmark-${entry.id}`}>
                            <Link
                              href={`/athaitapdetails/${entry.id}`}
                              className="flexAlink"
                              title={entry.name}
                            >
                              <div className="blog-read-content custom-top-news hometopnews">
                                <h4 className="custom-blog-title">
                                  {entry.name}
                                </h4>
                                
                                <div className="hover-image">
                                  <div className="lazyload-wrapper">
                                    <img
                                      style={{ margin: '0 auto', width: '100%', height: 'auto' }}
                                      src="/assets/images/gstv-logo-bg.png"
                                      data-srcset={`${getImageUrl(entry.featureImage)} 480w, ${getImageUrl(entry.featureImage)} 800w`}
                                      data-sizes="auto"
                                      className="lazyload gridimg custom-image"
                                      alt={entry.name}
                                    />
                                  </div>
                                </div>

                                <p className="blog-excerpt">
                                  <strong>Days:</strong> {entry.days} <br />
                                  <strong>Address:</strong> {entry.address} <br />
                                  <strong>Phone:</strong> {entry.mobile}
                                </p>

                                <div className="blog-featured-functions">
                                  <div className="reading-time-blog">
                                    <span className="last-update-blog">
                                      {new Date(entry.created_at).toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>

                      <div className="loading" style={{ display: loadingMore ? 'block' : 'none', textAlign: 'center' }}>
                        <img src="/assets/images/loading.gif" alt="Loading..." />
                      </div>

                      {totalCount > 10 && hasMore && (
                        <div className="text-center mt-3">
                          <button
                            id="load-more-btn"
                            className="btnloadmorecls"
                            onClick={loadMoreEntries}
                            disabled={loadingMore}
                          >
                            {loadingMore ? 'Loading...' : 'Load More'}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GetEkasanaPage;
