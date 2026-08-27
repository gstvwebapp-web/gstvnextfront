'use client';

import React, { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

// Removed unused Head import
import '@/styles/profile.css';
import '@/styles/styles.css';
import '@/styles/styles_new.css';
import {
  fetchEpapers,
  fetchEpapersByDate,
  EpaperResponse,
  EpaperItem,
  getEpaperImageUrl,
  formatDateToDDMMYYYY,
  // Removed unused getCurrentDateYYYYMMDD import
  getCurrentDateDDMMYYYY
} from '@/services/epaperApi';
import EpaperCalendar from '@/components/EpaperCalendar';
import ProFooter from "@/components/ProFooter";
import Link from 'next/link';

const EpaperPageContent: React.FC = () => {

  const [epapers, setEpapers] = useState<EpaperItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getCurrentDateDDMMYYYY());
  const [sharePopupId, setSharePopupId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(8); // Fixed items per page
  const router = useRouter();
  // const searchParams = useSearchParams();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false); // Prevent duplicate API calls

  useEffect(() => {
    // Reset and load initial data
    setCurrentPage(1);
    setEpapers([]);
    setHasMorePages(true);
    loadEpapers(selectedDate, 1, true);
  }, [selectedDate]);

  useEffect(() => {
    // Add data attribute to body for CSS targeting
    document.body.setAttribute('data-page', 'epaper');

    // Cleanup on unmount
    return () => {
      document.body.removeAttribute('data-page');
    };
  }, []);

  const loadEpapers = async (date?: string, page: number = 1, reset: boolean = false) => {
    // Prevent duplicate API calls
    if (isLoadingRef.current && !reset) {
      console.log('🔥 [InfiniteScroll] Already loading, skipping duplicate call');
      return;
    }

    try {
      isLoadingRef.current = true;

      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      let response: EpaperResponse;

      if (date && date !== getCurrentDateDDMMYYYY()) {
        // Fetch epapers for specific date (no pagination for date-specific)
        console.log('Fetching epapers for date:', date);
        response = await fetchEpapersByDate(date);
      } else {
        // Fetch current date epapers with pagination
        console.log(`Fetching current epapers - Page: ${page}, Per Page: ${perPage}`);
        response = await fetchEpapers(page, perPage);
      }

      console.log('Epaper response:', response);

      const list = response.epapercity?.Newspaper ?? [];
      if (list.length > 0) {
        console.log('Setting epapers:', list.length);

        if (reset) {
          setEpapers(list);
        } else {
          setEpapers(prev => [...prev, ...list]);
        }

        // Update pagination info
        if (response.pagination) {
          setTotalItems(response.pagination.total);
          setCurrentPage(response.pagination.current_page);
          const hasMore = response.pagination.current_page < response.pagination.last_page;
          setHasMorePages(hasMore);
          console.log('🔥 [Pagination] Page:', response.pagination.current_page, 'of', response.pagination.last_page, '| Has more:', hasMore, '| Total items:', response.pagination.total);
        } else {
          // For non-paginated responses, infer hasMore by batch size for current date lists
          const inferredHasMore = list.length >= perPage && selectedDate === getCurrentDateDDMMYYYY();
          setHasMorePages(inferredHasMore);
          console.log('🔥 [Pagination] No pagination info, inferred hasMorePages =', inferredHasMore);
        }
      } else {
        console.log('No epapers found in response');
        if (reset) {
          setEpapers([]);
        }
        setHasMorePages(false);
      }
    } catch (err) {
      setError('Failed to load epapers. Please try again.');
      console.error('Error loading epapers:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false; // Reset loading flag
    }
  };



  const handleShareClick = (id: number) => {
    setSharePopupId(sharePopupId === id ? null : id);
  };

  const handleDateChange = async (date: string) => {
    console.log('Date changed to:', date);
    if (date !== getCurrentDateDDMMYYYY()) {
      // For non-current dates, navigate to epaper detail page with default slug
      // Use the default slug 'gujarat-smachar-e-paper' as requested
      const defaultSlug = 'gujarat-smachar-e-paper';
      router.push(`/epaper/${defaultSlug}/${date}`);
    } else {
      // Stay on main page for current date and reset to page 1
      setSelectedDate(date);
      setCurrentPage(1);
      setEpapers([]);
      setHasMorePages(true);
      loadEpapers(date, 1, true);
    }
  };

  // Infinite scroll implementation
  const loadMoreEpapers = useCallback(() => {
    // Only trigger infinite scroll for current date and when conditions are met
    if (!loadingMore && hasMorePages && selectedDate === getCurrentDateDDMMYYYY() && !loading) {
      const nextPage = currentPage + 1;
      console.log(`🔥 [InfiniteScroll] Loading page: ${nextPage}`);
      loadEpapers(selectedDate, nextPage, false);
    }
  }, [loadingMore, hasMorePages, currentPage, selectedDate, loading]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    // Clean up existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Only set up observer for current date
    if (selectedDate === getCurrentDateDDMMYYYY()) {
      console.log('🔥 [IntersectionObserver] Setting up observer for current date');
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;

          if (entry.isIntersecting && !loadingMore && hasMorePages && !loading) {
            console.log('🔥 [IntersectionObserver] Triggering infinite scroll');
            loadMoreEpapers();
          }
        },
        {
          threshold: 0.1,
          rootMargin: '50px' // Reduced margin for better control
        }
      );

      if (loadMoreRef.current) {
        observerRef.current.observe(loadMoreRef.current);
      }
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMoreEpapers, selectedDate, loadingMore, hasMorePages, loading]);

  const shareEpaper = async (epaper: EpaperItem) => {
    const title = epaper.title;
    const url = `${window.location.origin}/epaper/${epaper.ecatslug}/${formatDateToDDMMYYYY(epaper.newspaperdate)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: title,
          url: url
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleShareClick(epaper.id);
    }
  };

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
      setSharePopupId(null);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const formatDisplayDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '/');
  };

  const formatDisplayDateUrl = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };


  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading epapers...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid epaper-page-container" data-page="epaper">
      <div className="epaperTopFixed">
        <div className="filterTAbEpaper">
          <Link className="tab-link active-link" href='/epaper'>
            ન્યૂઝ પેપર
          </Link>
          <Link className="tab-link" href='/magazine'>
            મેગેઝિન
          </Link>
          {/* <Link className="tab-link" href='/buddhiprakash'>
            બુદ્ધિપ્રકાશ
          </Link> */}
        </div>
        <EpaperCalendar
          currentDate={selectedDate}
          onDateChange={handleDateChange}
        />
      </div>

      <div className="epapperPage">
        <div id="newspaperdata" className="data-section active">
            {error ? (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={() => loadEpapers()} className="retry-button">
                  Retry
                </button>
              </div>
            ) : (
              <div className="epapperFlex">
                {epapers.length > 0 ? (
                  epapers.map((epaper) => {
                    const imageUrl = getEpaperImageUrl(epaper);
                    const displayDate = formatDisplayDate(epaper.newspaperdate);
                    const displayDateUrl = formatDisplayDateUrl(epaper.newspaperdate);
                    const detailUrl = `/epaper/${epaper.ecatslug}/${displayDateUrl}`;

                    console.log('Rendering epaper:', epaper.title, 'Image URL:', imageUrl);

                    return (
                      <div key={epaper.id} className="epapperBox">
                        <div className="imageBox">
                          <Link href={detailUrl}>
                            <img
                              src={imageUrl}
                              alt={`${epaper.title} - ${displayDate}`}
                              className="imgEpapper"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                console.log('Image failed to load:', imageUrl);
                                target.src = '/images/news-default.png';
                              }}
                              onLoad={() => {
                                console.log('Image loaded successfully:', imageUrl);
                              }}
                            />
                          </Link>
                        </div>
                        <div className="dateShareFlex">
                          <div className="date">{displayDate}</div>
                          <div
                            className={`shareIcon shareepaper${epaper.id}`}
                            onClick={() => shareEpaper(epaper)}
                          >
                            <i className="fa-solid fa-share-nodes"></i>
                          </div>
                          
                          {sharePopupId === epaper.id && (() => {
                            const shareUrl = `${window.location.origin}/epaper/${epaper.ecatslug}/${formatDateToDDMMYYYY(epaper.newspaperdate)}`;
                            return (
                              <div className={`sharenews${epaper.id} sharenewscls`}>
                                <Link
                                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="facebook"
                                >
                                  <i className="fab fa-facebook"></i>
                                  <span className="text">Facebook</span>
                                </Link>

                                <Link
                                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(epaper.title || 'Epaper')}&url=${encodeURIComponent(shareUrl)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="twitter"
                                >
                                  <i className="fab fa-twitter"></i>
                                  <span className="text">Twitter</span>
                                </Link>

                                <Link
                                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(epaper.title || 'Epaper')}: ${encodeURIComponent(shareUrl)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="whatsApp"
                                >
                                  <i className="fab fa-whatsapp"></i>
                                  <span className="text">WhatsApp</span>
                                </Link>

                                <Link
                                  href="javascript:void(0);"
                                  onClick={() => copyLink(shareUrl)}
                                  className="copyLink"
                                >
                                  <i className="fa fa-link"></i>
                                  <span className="text">Copy Link</span>
                                </Link>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-data">
                    <p>No epapers found for today.</p>
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                      Debug: Loading: {loading.toString()}, Error: {error || 'none'}, Epapers count: {epapers.length}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Infinite Scroll Trigger - Only for current date */}
            {!loading && !error && epapers.length > 0 && selectedDate === getCurrentDateDDMMYYYY() && (hasMorePages || loadingMore) && (
              <div
                ref={loadMoreRef}
                className="load-more-trigger"
                style={{
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '30px',
                  marginBottom: '30px',
                  padding: '20px',

                }}
              >
                {loadingMore ? (
                  <div className="loading-more" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div className="loading-spinner" style={{ width: '40px', height: '40px' }}></div>
                    <span style={{
                      fontSize: '16px',
                      color: '#666',
                      fontFamily: 'Noto Sans Gujarati, sans-serif'
                    }}>
                      વધુ લોડ કરી રહ્યા છીએ...
                    </span>
                  </div>
                ) : (
                  <div style={{
                    height: '1px',
                    width: '100%'
                  }}>
                    {/* Invisible trigger element for intersection observer */}
                  </div>
                )}
              </div>
            )}

            {/* End of content indicator */}
            {!loading && !error && epapers.length > 0 && !hasMorePages && selectedDate === getCurrentDateDDMMYYYY() && (
              <div style={{
                textAlign: 'center',
                padding: '20px',
                color: '#666',
                fontSize: '14px',
                fontFamily: 'Noto Sans Gujarati, sans-serif'
              }}>
                બધા ઈ-પેપર લોડ થઈ ગયા છે
              </div>
            )}
        </div>
      </div>
        
        
        <style>{`
          #gstvin_top{
            margin-top: 60px;
          }
          .data-section.active {
              padding-top: 10px;
          }
        `}</style>
    </div>

  );
};

export default function EpaperPage() {
  return <EpaperPageContent />;
}
