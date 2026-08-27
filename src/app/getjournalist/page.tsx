'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/constants/api';
import ProFooter from '@/components/ProFooter';
import { redirectToLogin } from '@/utils/authUtils';

// TypeScript interfaces for the API response
interface JournalistEntry {
  id: number;
  userID: number;
  name: string;
  title: string;
  description: string;
  featureImage: string;
  video: string | null;
  video_status: number;
  city: string;
  adminid: number;
  agree_status: number;
  drop_reason: string;
  status: string;
  created_at: string;
  updated_at: string;
  video_img: string | null;
}

interface PaginationData {
  current_page: number;
  data: JournalistEntry[];
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

const GetJournalistPage: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn, getUserId } = useAuth();
  const [entries, setEntries] = useState<JournalistEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  useEffect(() => {
      const uid = getUserId();
      if (!uid) {
        redirectToLogin('/getjournalist', router);
      }
    }, [getUserId, router]);

  // Fetch journalist entries from API
  const fetchJournalistEntries = useCallback(async (pageNumber: number = 1, append: boolean = false) => {
    const uid = getUserId();
    if (!uid) return;
    try {
      if (pageNumber === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }
     
      const userSession = localStorage.getItem("userSession");
      let userId = null;   // declare with let so you can reassign

      if (userSession) {
        const session = JSON.parse(userSession);
        userId = session?.userData?.user_id || session?.userData?.id;
      }
      const response = await fetch(API_ENDPOINTS.JOURNAGET_LIST, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: uid,
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
      setTotalCount(result.data.total);

    } catch (err) {
      console.error('Error fetching journalist entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load journalist entries');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchJournalistEntries(1, false);
  }, [fetchJournalistEntries]);

  // Load more function
  const loadMoreNews = useCallback(() => {
    if (loadingMore || currentPage >= lastPage) return;

    const nextPage = currentPage + 1;
    fetchJournalistEntries(nextPage, true);
  }, [loadingMore, currentPage, lastPage, fetchJournalistEntries]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
        loadMoreNews();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreNews]);

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

          <div className="profilePage peopleNewsPage">
          <div className="pNewsBox">
            <div className="title">
              <h2>જર્નાલિસ્ટ લિસ્ટ</h2>
              <Link href="/addjournalist" className="btn btnAddpNews">
                એડ કરો <span>+</span>
              </Link>
            </div>

            <div className="pnewsContent">
              <div className="bookmark_list peopleNewsList">
                <div className="bookmarklisting">
                  {loading && entries.length === 0 ? (
                    <div className="text-center">
                      <p style={{ color: 'red' }}>લોડ થઈ રહ્યું છે...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center">
                      <p style={{ color: 'red' }}>{error}</p>
                      <button 
                        onClick={() => fetchJournalistEntries(1, false)} 
                        className="btn btn-primary"
                      >
                        Retry
                      </button>
                    </div>
                  ) : entries.length === 0 ? (
                    <div className="text-center">
                      <p style={{ color: 'red' }}>કોઈ જર્નાલિસ્ટ ઉપલબ્ધ નથી.</p>
                    </div>
                  ) : (
                    <ul id="bookmark-list">
                      {entries.map((news) => {
                        const images = news.featureImage ? 
                          (typeof news.featureImage === 'string' ? 
                            JSON.parse(news.featureImage || '[]') : 
                            news.featureImage) : [];
                        const firstImage = Array.isArray(images) ? images[0] : images;
                        
                        const finalStatus =
                              news.status === "Active"
                                  ? "Active"
                                  : news.status === "Drop"
                                      ? "Rejected"
                                      : "Inactive";
                        
                        let img = '/assets/images/news-default.png';
                        if (firstImage) {
                          img = `${firstImage}`;
                        }
                        
                        const newsUrl = `/journalistdetails/${news.id}`;
                        let videoWebp = null;
                        if (news.video) {
                          videoWebp = `${news.video_img}`;
                        }

                        return (
                          <li key={news.id} id={`news-${news.id}`} className={finalStatus}>
                            <div className="pnewsThumb">
                              {news.video ? (
                                <img src={videoWebp || img} height="50" width="50" alt="Journalist" />
                              ) : (
                                <img src={img} height="50" width="50" alt="Journalist" />
                              )}
                            </div>
                            <div className="pnewsTextContent">
                              {news.status === "Active" ? (
                                <div className="newsListTitle">
                                  <Link href={newsUrl} target="_blank">{news.name}</Link>
                                </div>
                              ) : (
                                <div className="newsListTitle">{news.name}</div>
                              )}
                              
                              <div className="catDate pnewsDate">
                                <div className="date">તારીખ: <span>{formatDate(news.created_at)}</span></div>
                              </div>
                              {news.drop_reason && (
                                <div className="catDate pnewsDate">
                                  કારણ: <span>{news.drop_reason}</span>
                                </div>
                              )}
                              <div className="nseditLine">
                                <div className={`pnewsStatus ${finalStatus}`}>{finalStatus}</div>
                                {news.status === "Inactive" && (
                                  <Link href={`/addjournalist?id=${news.id}`} className="pEditNews" data-id={news.id}>
                                    <i className="fas fa-edit"></i> એડિટ
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
                        className="btnloadmorecls"
                        onClick={loadMoreNews}
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

export default GetJournalistPage;
