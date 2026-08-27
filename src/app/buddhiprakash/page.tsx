'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import '@/styles/profile.css';
import '@/styles/styles.css';
import '@/styles/styles_new.css';
import {
  fetchBuddhiPrakashan,
  getBuddhiImageUrl,
  formatBuddhiDate,
  formatBuddhiDateUrl,
  BuddhiItem,
} from '@/services/buddhiprakashApi';

const BuddhiPrakashPageContent: React.FC = () => {

  const [items, setItems]               = useState<BuddhiItem[]>([]);
  const [loading, setLoading]           = useState(true);
  const [loadingMore, setLoadingMore]   = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [sharePopupId, setSharePopupId] = useState<number | null>(null);
  const [currentPage, setCurrentPage]   = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [perPage]                       = useState(8);

  const observerRef  = useRef<IntersectionObserver | null>(null);
  const loadMoreRef  = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false);

  /* ── body attr ── */
  useEffect(() => {
    document.body.setAttribute('data-page', 'buddhiprakash');
    return () => { document.body.removeAttribute('data-page'); };
  }, []);

  /* ── initial load ── */
  useEffect(() => {
    setCurrentPage(1);
    setItems([]);
    setHasMorePages(true);
    loadItems(1, true);
  }, []);

  /* ── fetch ── */
  const loadItems = async (page: number = 1, reset: boolean = false) => {
    if (isLoadingRef.current && !reset) return;

    try {
      isLoadingRef.current = true;
      reset ? setLoading(true) : setLoadingMore(true);
      setError(null);

      const { items: fetched, pagination } = await fetchBuddhiPrakashan(page, perPage);

      if (fetched.length > 0) {
        setItems(prev => reset ? fetched : [...prev, ...fetched]);

        if (pagination) {
          setCurrentPage(pagination.current_page);
          setHasMorePages(pagination.current_page < pagination.last_page);
        } else {
          setHasMorePages(fetched.length >= perPage);
        }
      } else {
        if (reset) setItems([]);
        setHasMorePages(false);
      }
    } catch (err) {
      setError('બુદ્ધિપ્રકાશ લોડ કરવામાં ભૂલ. કૃપા કરી ફરી પ્રયાસ કરો.');
      console.error('[BuddhiPrakash]', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  };

  /* ── infinite scroll ── */
  const loadMoreItems = useCallback(() => {
    if (!loadingMore && hasMorePages && !loading) {
      loadItems(currentPage + 1, false);
    }
  }, [loadingMore, hasMorePages, currentPage, loading]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loadingMore && hasMorePages && !loading) {
          loadMoreItems();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);

    return () => { if (observerRef.current) observerRef.current.disconnect(); };
  }, [loadMoreItems, loadingMore, hasMorePages, loading]);

  /* ── share ── */
  const handleShareClick = (id: number) => {
    setSharePopupId(sharePopupId === id ? null : id);
  };

  const shareItem = async (item: BuddhiItem) => {
    const title = item.title || item.etitle || 'બુદ્ધિપ્રકાશ';
    const url   = `${window.location.origin}/buddhiprakash/${item.ecatslug || item.slug || item.id}/${formatBuddhiDateUrl(item.newspaperdate)}`;

    if (navigator.share) {
      try { await navigator.share({ title, text: title, url }); } catch {}
    } else {
      handleShareClick(item.id);
    }
  };

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
      setSharePopupId(null);
    } catch {}
  };

  /* ── loading state ── */
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>બુદ્ધિપ્રકાશ લોડ કરી રહ્યા છીએ...</p>
      </div>
    );
  }

  /* ── render ── */
  return (
    <div className="container-fluid epaper-page-container" data-page="buddhiprakash">

      {/* ── Tabs (same as epaper) ── */}
      <div className="epaperTopFixed">
        <div className="filterTAbEpaper">
          <Link className="tab-link" href='/epaper'>ન્યૂઝ પેપર</Link>
          <Link className="tab-link" href='/magazine'>મેગેઝિન</Link>
          <Link className="tab-link active-link" href='/buddhiprakash'>બુદ્ધિપ્રકાશ</Link>
        </div>
      </div>

      <div className="epapperPage">
        <div id="buddhidata" className="data-section active">

          {error ? (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => loadItems(1, true)} className="retry-button">Retry</button>
            </div>
          ) : (
            <div className="epapperFlex">
              {items.length > 0 ? (
                items.map((item) => {
                  const imageUrl   = getBuddhiImageUrl(item);
                  const displayDate = formatBuddhiDate(item.newspaperdate);
                  const urlDate    = formatBuddhiDateUrl(item.newspaperdate);
                  const slug       = item.ecatslug || item.slug || String(item.id);
                  const detailUrl  = `/buddhiprakash/${slug}/${urlDate}`;
                  const shareUrl   = `${window.location.origin}${detailUrl}`;

                  return (
                    <div key={item.id} className="epapperBox">
                      <div className="imageBox">
                        <Link href={detailUrl}>
                          <img
                            src={imageUrl}
                            alt={`${item.title || item.etitle || 'બુદ્ધિપ્રકાશ'} - ${displayDate}`}
                            className="imgEpapper"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/images/news-default.png'; }}
                          />
                        </Link>
                      </div>

                      <div className="dateShareFlex">
                        <div className="date">{displayDate}</div>
                        <div
                          className={`shareIcon sharebudhi${item.id}`}
                          onClick={() => shareItem(item)}
                        >
                          <i className="fa-solid fa-share-nodes"></i>
                        </div>

                        {sharePopupId === item.id && (
                          <div className={`sharenews${item.id} sharenewscls`}>
                            <Link
                              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                              target="_blank" rel="noopener noreferrer" className="facebook"
                            >
                              <i className="fab fa-facebook"></i>
                              <span className="text">Facebook</span>
                            </Link>

                            <Link
                              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(item.title || 'બુદ્ધિપ્રકાશ')}&url=${encodeURIComponent(shareUrl)}`}
                              target="_blank" rel="noopener noreferrer" className="twitter"
                            >
                              <i className="fab fa-twitter"></i>
                              <span className="text">Twitter</span>
                            </Link>

                            <Link
                              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(item.title || 'બુદ્ધિપ્રકાશ')}: ${encodeURIComponent(shareUrl)}`}
                              target="_blank" rel="noopener noreferrer" className="whatsApp"
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
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-data">
                  <p>કોઈ બુદ્ધિપ્રકાશ ઉપલબ્ધ નથી.</p>
                </div>
              )}
            </div>
          )}

          {/* Infinite scroll trigger */}
          {!loading && !error && items.length > 0 && (hasMorePages || loadingMore) && (
            <div
              ref={loadMoreRef}
              className="load-more-trigger"
              style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '30px', marginBottom: '30px', padding: '20px' }}
            >
              {loadingMore ? (
                <div className="loading-more" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '10px' }}>
                  <div className="loading-spinner" style={{ width: '40px', height: '40px' }}></div>
                  <span style={{ fontSize: '16px', color: '#666', fontFamily: 'Noto Sans Gujarati, sans-serif' }}>
                    વધુ લોડ કરી રહ્યા છીએ...
                  </span>
                </div>
              ) : (
                <div style={{ height: '1px', width: '100%' }} />
              )}
            </div>
          )}

          {/* End of content */}
          {/* {!loading && !error && items.length > 0 && !hasMorePages && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666', fontSize: '14px', fontFamily: 'Noto Sans Gujarati, sans-serif' }}>
              બધા બુદ્ધિપ્રકાશ લોડ થઈ ગયા છે
            </div>
          )} */}

        </div>
      </div>

      <style>{`
        #gstvin_top { margin-top: 60px; }
        .data-section.active { padding-top: 10px; }
      `}</style>
    </div>
  );
};

export default function BuddhiPrakashPage() {
  return <BuddhiPrakashPageContent />;
}
