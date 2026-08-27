'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS, getEkasanaImageUrl } from '@/constants/api';
import { useUserSession, getUserId } from '@/hooks/useUserSession';
import { redirectToLogin, getCurrentPagePath } from '@/utils/authUtils';
import ProFooter from '@/components/ProFooter';

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

interface ApiResponse {
  success: boolean;
  data: EkasanaData;
}

const GetEkasanaPage: React.FC = () => {
  const router = useRouter();
  const { user_id, isLoggedIn } = useUserSession();
  const userId = user_id || getUserId() || '';

  const [entries, setEntries] = useState<EkasanaEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [mounted, setMounted] = useState<boolean>(true); // Start as mounted

  // Mount effect and authentication check
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get effective user ID
  const getEffectiveUserId = () => {
    if (userId) return userId;

    if (typeof window !== 'undefined') {
      const storedSession = localStorage.getItem('userSession');
      if (storedSession) {
        try {
          const sessionData = JSON.parse(storedSession);
          return sessionData.userData?.user_id ||
                 sessionData.userData?.id ||
                 sessionData.user_id ||
                 sessionData.mobile ||
                 '85'; // Fallback
        } catch (error) {
          console.error('Error parsing session:', error);
        }
      }
    }

    return '85'; // Fallback for testing
  };

  // Check authentication
  const checkAuth = () => {
    if (typeof window === 'undefined') return false;

    // Method 1: Check useUserSession hook
    if (isLoggedIn && userId) {
      return true;
    }

    // Method 2: Check localStorage directly
    const storedLogin = localStorage.getItem('isLoggedIn');
    const storedSession = localStorage.getItem('userSession');

    if (storedLogin === 'true' && storedSession) {
      return true;
    }

    return false;
  };

  // Fetch entries from API
  const fetchEntries = useCallback(async (page: number = 1, append: boolean = false) => {
    const effectiveUserId = getEffectiveUserId();
    if (!effectiveUserId) return;

    try {
      if (page === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      console.log('🔍 Fetching Ekasana entries for user:', effectiveUserId, 'page:', page);

      // API call to get user's Ekasana entries
      const response = await fetch(API_ENDPOINTS.ATHAITAP_GET_USER_ENTRIES, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: effectiveUserId,
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

      // Set total count on first load
      if (page === 1) {
        setTotalCount(apiData.total);
      }

      if (append && page > 1) {
        setEntries(prev => [...prev, ...apiData.data]);
      } else {
        setEntries(apiData.data);
      }

      setCurrentPage(apiData.current_page);
      setLastPage(apiData.last_page);
      setHasMore(apiData.current_page < apiData.last_page);

    } catch (err) {
      console.error('Error fetching user ekasana entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load entries');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [userId]);

  // Initial load when component is mounted and user is authenticated
  useEffect(() => {
    if (mounted && checkAuth()) {
      fetchEntries(1);
    }
  }, [mounted, isLoggedIn, userId]);

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

  // Show loading on server side or before mount
  if (!mounted) {
    return (
      <div className="contents-main-div" id="middlePage">
        <div className="profilePage peopleNewsPage">
          <div className="pNewsBox">
            <div className="title">
              <h2>તપસ્વીઓના તપ</h2>
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

  // Not logged in state
  if (!checkAuth()) {
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
              <div className="text-center" style={{ padding: '50px' }}>
                <p style={{ fontSize: '18px', marginBottom: '30px', color: '#666' }}>
                  તમારા એકાસન જોવા માટે કૃપા કરીને પહેલા લોગિન કરો.
                </p>
                <Link 
                  href="/login" 
                  className="btn btn-primary"
                  style={{ 
                    backgroundColor: '#8B0000', 
                    borderColor: '#8B0000',
                    padding: '10px 30px',
                    fontSize: '16px'
                  }}
                >
                  લોગિન કરો
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
  };

  return (
    <>
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

      
        <div className="profilePage peopleNewsPage">
          <div className="pNewsBox">
            <div className="title">
              <h2 className="custom-gujrati-font">તપસ્વીઓના તપ</h2>
              <Link href="/addekasana" className="btn btnAddpNews">
                <span className="custom-gujrati-font">એડ કરો</span> <span>+</span>
              </Link>
            </div>

            <div className="pnewsContent">
              <div className="bookmark_list peopleNewsList">
                <div className="bookmarklisting">
                  {loading && entries.length === 0 ? (
                    <div className="text-center">
                      <p style={{ color: 'red' }} className="custom-gujrati-font">લોડ થઈ રહ્યું છે...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center">
                      <p style={{ color: 'red' }} className="custom-gujrati-font">{error}</p>
                      <button
                        onClick={() => fetchEntries(1, false)}
                        className="btn btn-primary custom-gujrati-font"
                      >
                        ફરી પ્રયાસ કરો
                      </button>
                    </div>
                  ) : entries.length === 0 ? (
                    <div className="text-center">
                      <p style={{ color: 'red' }} className="custom-gujrati-font">કોઈ એકાસન ઉપલબ્ધ નથી.</p>
                    </div>
                  ) : (
                    <ul id="bookmark-list">
                      {entries.map((entry) => {
                        const finalStatus = entry.status === "Active" ? 'Active' : 'Inactive';

                        // Use featureImageThumb for list view, fallback to featureImage
                        let img = entry.featureImageThumb || entry.featureImage || '/assets/images/news-default.png';
                        if (img && !img.startsWith('http')) {
                          img = getEkasanaImageUrl(img);
                        }

                        const ekasanaUrl = `/athaitapdetails/${entry.id}`;

                        return (
                          <li key={entry.id} id={`ekasana-${entry.id}`} className={finalStatus}>
                            <div className="pnewsThumb">
                              <img src={img} height="50" width="50" alt="Ekasana" />
                            </div>
                            <div className="pnewsTextContent">
                              {entry.status === "Active" ? (
                                <div className="newsListTitle">
                                  <Link href={ekasanaUrl} target="_blank" className="custom-gujrati-font">{entry.name}</Link>
                                </div>
                              ) : (
                                <div className="newsListTitle custom-gujrati-font">{entry.name}</div>
                              )}

                              <div className="catDate pnewsDate">
                                <div className="date custom-gujrati-font">સરનામું: <span className="custom-gujrati-font">{entry.address}</span></div>
                                <div className="date custom-gujrati-font">દિવસો: <span>{entry.days}</span></div>
                                <div className="date custom-gujrati-font">મોબાઇલ: <span>{entry.mobile}</span></div>
                                <div className="date custom-gujrati-font">તારીખ: <span>{formatDate(entry.created_at)}</span></div>
                              </div>
                              <div className="nseditLine">
                               <div className={`pnewsStatus ${finalStatus}`}>{finalStatus}</div>
                                {entry.status === "Inactive" && (
                                  <Link href={`/addekasana?id=${entry.id}`} className="pEditNews custom-gujrati-font" data-id={entry.id}>
                                      <i className="fas fa-edit"></i> Edit
                                  </Link>
                                )}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <div className="loading" style={{ display: loadingMore ? 'block' : 'none' }}>
                    <img src="/assets/images/loading.gif" alt="લોડ થઈ રહ્યું છે..." />
                  </div>

                  {totalCount > 10 && currentPage < lastPage && (
                    <div className="text-center mt-3">
                      <button
                        id="load-more-btn"
                        className="btnloadmorecls custom-gujrati-font"
                        onClick={loadMoreEntries}
                        disabled={loadingMore}
                      >
                        વધુ લોડ કરો
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
     
    </>
  );
};

export default GetEkasanaPage;
