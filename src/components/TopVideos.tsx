'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import '@/styles/TopVideos.css';

const PER_PAGE = 20;
const AUTO_SCROLL_INTERVAL = 5000;

interface VideoItem {
  id: number;
  title: string;
  slug: string;
  videoURL?: string;
  video_webp?: string;
  featureImage?: string | null;
  imageURL?: string;
  category_names?: string;
  category_slugs?: string;
  [key: string]: any;
}

function getCategoryUrl(slugs?: string): string {
  if (!slugs?.trim()) return '#';
  const parts = slugs.split(',').map(s => s.trim()).filter(Boolean);
  return `/category/${parts.join('/')}`;
}

function getThumb(v: VideoItem): string {
  if (v.category_slugs?.split(',').map(s => s.trim()).includes('bulletin')) {
    if (v.featureImage?.trim()) return v.featureImage.trim();
  }
  if (v.video_webp?.trim()) return v.video_webp.trim();
  if (v.featureImage?.trim()) return v.featureImage.trim();
  if (v.imageURL?.trim()) return v.imageURL.trim();
  return '/images/news-default.png';
}

export default function TopVideos() {
  const [allVideos,   setAllVideos]   = useState<VideoItem[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage,    setLastPage]    = useState(1);
  const [slide,       setSlide]       = useState(0);
  const [itemWidth,   setItemWidth]   = useState(0);
  const [perView,     setPerView]     = useState(4);

  const containerRef   = useRef<HTMLDivElement>(null);
  const sliderRef      = useRef<HTMLDivElement>(null);
  const resizeTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTimer      = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchingRef    = useRef(false);
  const pausedRef      = useRef(false);
  const isDragging     = useRef(false);
  const mouseStartX    = useRef(0);
  const dragStartSlide = useRef(0);
  const touchStart     = useRef(0);
  const touchEnd       = useRef(0);

  /* always-fresh refs */
  const slideRef     = useRef(0);
  const perViewRef   = useRef(4);
  const itemWidthRef = useRef(0);
  const videosRef    = useRef<VideoItem[]>([]);
  const loadingRef   = useRef(true);

  /* sync refs with state */
  useEffect(() => { slideRef.current    = slide;    }, [slide]);
  useEffect(() => { perViewRef.current  = perView;  }, [perView]);
  useEffect(() => { itemWidthRef.current = itemWidth; }, [itemWidth]);
  useEffect(() => { videosRef.current   = allVideos; }, [allVideos]);
  useEffect(() => { loadingRef.current  = loading;   }, [loading]);

  /* ── fetch ── */
  const fetchPage = useCallback(async (page: number, append: boolean) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    if (append) setLoadingMore(true); else setLoading(true);
    try {
      const res  = await fetch('/api/topVideos', {
        method: 'POST', cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, per_page: PER_PAGE }),
      });
      const data = await res.json();
      const items: VideoItem[] = Array.isArray(data?.data) ? data.data : [];
      setLastPage(data?.last_page ?? 1);
      setCurrentPage(data?.current_page ?? page);
      if (append) {
        setAllVideos(prev => { const m = [...prev, ...items]; videosRef.current = m; return m; });
      } else {
        setAllVideos(items);
        videosRef.current = items;
      }
    } catch (err) {
      console.error('TopVideos fetch failed', err);
    } finally {
      fetchingRef.current = false;
      if (append) setLoadingMore(false); else setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPage(1, false); }, [fetchPage]);

  /* ── measure ── */
  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const pv = window.innerWidth < 768 ? 2 : 4;
    const w  = el.offsetWidth / pv;
    perViewRef.current  = pv;
    itemWidthRef.current = w;
    setPerView(pv);
    setItemWidth(w);
  }, []);

  /* measure on mount + resize */
  useEffect(() => {
    measure();
    const onResize = () => {
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
      resizeTimer.current = setTimeout(measure, 120);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [measure]);

  /* re-measure once data arrives */
  useEffect(() => {
    if (!loading && allVideos.length > 0) {
      requestAnimationFrame(measure);
    }
  }, [loading, allVideos.length, measure]);

  /* ── AUTO SCROLL — single interval, entire lifetime of component ── */
  useEffect(() => {
    autoTimer.current = setInterval(() => {
      /* wait until data loaded and measured */
      if (loadingRef.current) return;
      if (pausedRef.current) return;
      const total = videosRef.current.length;
      const pv    = perViewRef.current;
      const iw    = itemWidthRef.current;
      if (total === 0 || pv === 0 || iw === 0) return;
      const maxS = Math.max(0, total - pv);
      if (maxS === 0) return;
      const next = slideRef.current >= maxS ? 0 : slideRef.current + 1;
      slideRef.current = next;
      setSlide(next);
    }, AUTO_SCROLL_INTERVAL);

    return () => {
      if (autoTimer.current) clearInterval(autoTimer.current);
    };
  }, []); /* empty — intentional, all data comes from refs */

  /* ── fetch more ── */
  const triggerFetchMore = useCallback(() => {
    if (fetchingRef.current || currentPage >= lastPage) return;
    const total = videosRef.current.length;
    const pv    = perViewRef.current;
    if (slideRef.current >= Math.max(0, total - pv)) {
      fetchPage(currentPage + 1, true);
    }
  }, [currentPage, lastPage, fetchPage]);

  const maxSlide = Math.max(0, allVideos.length - perView);

  /* ── goTo ── */
  const goTo = useCallback((n: number) => {
    const maxS = Math.max(0, videosRef.current.length - perViewRef.current);
    const next = Math.max(0, Math.min(n, maxS));
    slideRef.current = next;
    setSlide(next);
    setTimeout(triggerFetchMore, 0);
  }, [triggerFetchMore]);

  const nextSlide = useCallback(() => goTo(slideRef.current + 1), [goTo]);
  const prevSlide = useCallback(() => goTo(slideRef.current - 1), [goTo]);

  /* ── touch ── */
  const onTouchStart = (e: React.TouchEvent) => {
    pausedRef.current  = true;
    touchStart.current = e.touches[0].clientX;
    touchEnd.current   = e.touches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => { touchEnd.current = e.touches[0].clientX; };
  const onTouchEnd  = () => {
    const d = touchStart.current - touchEnd.current;
    if (Math.abs(d) > 50) d > 0 ? nextSlide() : prevSlide();
    setTimeout(() => { pausedRef.current = false; }, 4000);
  };

  /* ── mouse drag ── */
  const onMouseDown = (e: React.MouseEvent) => {
    pausedRef.current      = true;
    isDragging.current     = false;
    mouseStartX.current    = e.clientX;
    dragStartSlide.current = slideRef.current;
    e.preventDefault();
  };
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!mouseStartX.current) return;
    if (Math.abs(e.clientX - mouseStartX.current) > 5) isDragging.current = true;
    if (!isDragging.current) return;
    const w      = itemWidthRef.current || 1;
    const moved  = Math.round((mouseStartX.current - e.clientX) / w);
    const maxS   = Math.max(0, videosRef.current.length - perViewRef.current);
    const next   = Math.max(0, Math.min(maxS, dragStartSlide.current + moved));
    slideRef.current = next;
    setSlide(next);
    triggerFetchMore();
  }, [triggerFetchMore]);
  const onMouseUp    = () => {
    mouseStartX.current = 0;
    setTimeout(() => { isDragging.current = false; pausedRef.current = false; }, 500);
  };
  const onMouseLeave = () => { isDragging.current = false; mouseStartX.current = 0; };

  /* ── render ── */
  const leftDisabled  = slide === 0;
  const rightDisabled = slide >= maxSlide && currentPage >= lastPage;
  const trackItems    = allVideos.length + (loadingMore ? perView : 0);
  const trackWidth    = itemWidth * Math.max(trackItems, perView);

  /* always render container so measure() can get offsetWidth */
  return (
    <div className="tv-wrap">
      <div className="tv-box">
        <div
          className="MultiCarousel tv-carousel"
          ref={containerRef}
          onMouseLeave={onMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          style={{ cursor: isDragging.current ? 'grabbing' : 'grab', minHeight: loading ? '120px' : 'auto' }}
        >
          {loading ? (
            /* skeleton while loading — keeps container in DOM */
            <div style={{ display: 'flex', width: '100%', gap: '4px' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ flex: 1, aspectRatio: '16/9', background: '#f0f0f0', borderRadius: '6px' }} />
              ))}
            </div>
          ) : (
            <>
              <div
                className="MultiCarousel-inner topvideos"
                ref={sliderRef}
                style={{
                  display:    'flex',
                  transform:  `translateX(-${slide * (itemWidthRef.current || itemWidth)}px)`,
                  transition: 'transform 0.3s ease',
                  width:      trackWidth > 0 ? `${trackWidth}px` : '100%',
                }}
              >
                {allVideos.map(video => (
                  <div
                    key={video.id}
                    className="item loaded tv-item"
                    style={{ width: `${itemWidth}px`, flex: 'none', padding: '4px' }}
                  >
                    <div className="tv-card">
                      <Link
                        href={`/videos/${video.slug}`}
                        className="tv-thumb-link"
                        onClick={e => { if (isDragging.current) e.preventDefault(); }}
                      >
                        <div className="tv-thumb1">
                          <img
                            src={getThumb(video)}
                            alt={video.title || 'GSTV Video Thumbnail - Gujarati News Videos'}
                            loading="lazy"
                            onError={e => {
                              const img = e.currentTarget;
                              if (!img.dataset.fb) { img.dataset.fb = '1'; img.src = '/images/news-default.png'; }
                            }}
                          />
                          <span className="tv-play"><i className="fa fa-play-circle" /></span>
                        </div>
                      </Link>
                      {video.category_names && (
                        <Link
                          href={getCategoryUrl(video.category_slugs)}
                          className="tv-cat-label custom-gujrati-font"
                          onClick={e => { if (isDragging.current) e.preventDefault(); }}
                        >
                          {video.title}
                        </Link>
                      )}
                    </div>
                  </div>
                ))}

                {loadingMore && Array.from({ length: perView }).map((_, i) => (
                  <div key={`sk-${i}`} className="tv-item" style={{ width: `${itemWidth}px`, flex: 'none', padding: '4px' }}>
                    <div className="tv-card">
                      <div className="tv-thumb1">
                        <img src="/images/video-default.png" alt="gstvnews" style={{ opacity: 0.4 }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* arrows */}
              {leftDisabled ? (
                <span className="btn btn-primary leftLst over disabled-arrow" aria-hidden="true" />
              ) : (
                <button className="btn btn-primary leftLst" type="button"
                  onClick={e => { e.stopPropagation(); e.preventDefault(); prevSlide(); }}
                  onMouseDown={e => e.stopPropagation()}>
                  <i className="fa fa-chevron-left" />
                </button>
              )}

              {rightDisabled ? (
                <span className="btn btn-primary rightLst over disabled-arrow" aria-hidden="true" />
              ) : (
                <button className="btn btn-primary rightLst" type="button"
                  onClick={e => { e.stopPropagation(); e.preventDefault(); nextSlide(); }}
                  onMouseDown={e => e.stopPropagation()}>
                  <i className="fa fa-chevron-right" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
