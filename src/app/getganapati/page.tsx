'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { API_ENDPOINTS } from '@/constants/api';
import ProFooter from '@/components/ProFooter';

// TypeScript interfaces for the API response
interface GanapatiEntry {
  id: number;
  userID: number;
  name: string;
  address: string;
  featureImage: string;
  featureImageThumb: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface PaginationData {
  current_page: number;
  data: GanapatiEntry[];
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
  data: PaginationData | GanapatiEntry[]; // Handle both paginated and simple array responses
}

const GetGanapatiPage: React.FC = () => {
  const [entries, setEntries] = useState<GanapatiEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Fetch ganapati entries from API
  const fetchGanapatiEntries = useCallback(async (pageNumber: number = 1, append: boolean = false) => {
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
      
      console.log('🔍 Fetching Ganapati entries with:', { userId, pageNumber });
      
      const response = await fetch(API_ENDPOINTS.GANAPATI_GET_LIST, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          pageNumber: pageNumber.toString()
        }),
      });

      console.log('📡 API Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      console.log('📊 API Response data:', result);

      if (!result.success) {
        throw new Error('API returned unsuccessful response');
      }

      // Handle both paginated and simple array responses
      let newEntries: GanapatiEntry[] = [];
      let currentPageNum = 1;
      let lastPageNum = 1;
      let totalCountNum = 0;

      if (Array.isArray(result.data)) {
        // Simple array response
        newEntries = result.data;
        totalCountNum = result.data.length;
      } else if (result.data && typeof result.data === 'object') {
        // Paginated response
        newEntries = result.data.data || [];
        currentPageNum = result.data.current_page || 1;
        lastPageNum = result.data.last_page || 1;
        totalCountNum = result.data.total || 0;
      }

      if (append) {
        setEntries(prev => [...prev, ...newEntries]);
      } else {
        setEntries(newEntries);
      }

      setCurrentPage(currentPageNum);
      setLastPage(lastPageNum);
      setTotalCount(totalCountNum);

    } catch (err) {
      console.error('❌ Error fetching ganapati entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ganapati entries');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchGanapatiEntries(1, false);
  }, [fetchGanapatiEntries]);

  // Load more function
  const loadMoreNews = useCallback(() => {
    if (loadingMore || currentPage >= lastPage) return;

    const nextPage = currentPage + 1;
    fetchGanapatiEntries(nextPage, true);
  }, [loadingMore, currentPage, lastPage, fetchGanapatiEntries]);

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
              <h2 className="custom-gujrati-font">ગણપતિ ઉત્સવ</h2>
              <Link href="/addganapati" className="btn btnAddpNews">
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
                        onClick={() => fetchGanapatiEntries(1, false)} 
                        className="btn btn-primary custom-gujrati-font"
                      >
                        ફરી પ્રયાસ કરો
                      </button>
                    </div>
                  ) : entries.length === 0 ? (
                    <div className="text-center">
                      <p style={{ color: 'red' }} className="custom-gujrati-font">કોઈ ગણપતિ ઉત્સવ ઉપલબ્ધ નથી.</p>
                    </div>
                  ) : (
                    <ul id="bookmark-list">
                      {entries.map((ganapati) => {
                        const finalStatus = ganapati.status === "Active" ? 'Active' : 'Inactive';

                        // Use featureImageThumb for list view, fallback to featureImage
                        let img = ganapati.featureImageThumb || ganapati.featureImage || '/assets/images/news-default.png';

                        const ganapatiUrl = `/ganeshutsavdetails/${ganapati.id}`;

                        return (
                          <li key={ganapati.id} id={`ganapati-${ganapati.id}`} className={finalStatus}>
                            <div className="pnewsThumb">
                              <img src={img} height="50" width="50" alt="Ganapati" />
                            </div>
                            <div className="pnewsTextContent">
                              {ganapati.status === "Active" ? (
                                <div className="newsListTitle">
                                  <Link href={ganapatiUrl} target="_blank" className="custom-gujrati-font">{ganapati.name}</Link>
                                </div>
                              ) : (
                                <div className="newsListTitle custom-gujrati-font">{ganapati.name}</div>
                              )}

                              <div className="catDate pnewsDate">
                                <div className="date custom-gujrati-font">સરનામું: <span className="custom-gujrati-font">{ganapati.address}</span></div>
                                <div className="date custom-gujrati-font">તારીખ: <span>{formatDate(ganapati.created_at)}</span></div>
                              </div>
                              <div className="nseditLine">
                               <div className={`pnewsStatus ${finalStatus}`}>{finalStatus}</div>
                                {ganapati.status === "Inactive" && (
                                  <Link href={`/addganapati?id=${ganapati.id}`} className="pEditNews custom-gujrati-font" data-id={ganapati.id}>
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
                    <img src="/assets/images/loading.gif" alt="Loading..." />
                  </div>
                  
                  {totalCount > 10 && currentPage < lastPage && (
                    <div className="text-center mt-3">
                      <button 
                        id="load-more-btn" 
                        className="btnloadmorecls custom-gujrati-font"
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

export default GetGanapatiPage;
