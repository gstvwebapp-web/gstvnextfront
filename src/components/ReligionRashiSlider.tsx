'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import '@/styles/ReligionRashiSlider.css';

interface RashiNews {
  id: number;
  slug: string;
  news_title: string;
  videoURL: string;
  category_slugs: string;
}

interface RashiData {
  id: number;
  title: string;
  slug: string;
  rashiimage: string;
  rashiword: string;
  news: RashiNews;
}

function getThumb(news: RashiNews | undefined): string {
  if (!news?.videoURL) return '/images/gstv-logo-bg.png';
  try {
    return news.videoURL.replace(/\.mp4$/i, '_video.webp') || '/images/gstv-logo-bg.png';
  } catch {
    return '/images/gstv-logo-bg.png';
  }
}

export default function ReligionRashiSlider() {
  const [rashiData, setRashiData] = useState<RashiData[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [slide,     setSlide]     = useState(0);
  const [itemWidth, setItemWidth] = useState(0);
  const [perView,   setPerView]   = useState(3);

  const containerRef   = useRef<HTMLDivElement>(null);
  const sliderRef      = useRef<HTMLDivElement>(null);
  const resizeTimer    = useRef<NodeJS.Timeout | null>(null);
  const autoTimer      = useRef<NodeJS.Timeout | null>(null);
  const isDragging     = useRef(false);
  const mouseStartX    = useRef(0);
  const dragStartSlide = useRef(0);
  const touchStart     = useRef(0);
  const touchEnd       = useRef(0);
  const pausedRef      = useRef(false);
  const loadingRef     = useRef(true);

  /* always-fresh refs */
  const slideRef     = useRef(0);
  const perViewRef   = useRef(3);
  const itemWidthRef = useRef(0);
  const rashiDataRef = useRef<RashiData[]>([]);

  useEffect(() => { slideRef.current     = slide;    }, [slide]);
  useEffect(() => { perViewRef.current   = perView;  }, [perView]);
  useEffect(() => { itemWidthRef.current = itemWidth; }, [itemWidth]);
  useEffect(() => { rashiDataRef.current = rashiData; }, [rashiData]);
  useEffect(() => { loadingRef.current   = loading;   }, [loading]);

  /* ── fetch ── */
  useEffect(() => {
    const fetchRashiData = async () => {
      setLoading(true);
      try {
        const res  = await fetch('/api/religionRashi', {
          method: 'GET', cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) { setRashiData([]); return; }
        const data = await res.json();
        if (data?.status === true && Array.isArray(data?.data) && data.data.length > 0) {
          setRashiData(data.data);
          rashiDataRef.current = data.data;
        } else if (Array.isArray(data)) {
          setRashiData(data);
          rashiDataRef.current = data;
        } else {
          setRashiData([]);
        }
      } catch (err) {
        console.error('ReligionRashiSlider fetch error:', err);
        setRashiData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRashiData();
  }, []);

  /* ── measure ── */
  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const pv = window.innerWidth < 768 ? 2 : 3;
    const w  = el.offsetWidth / pv;
    perViewRef.current  = pv;
    itemWidthRef.current = w;
    setPerView(pv);
    setItemWidth(w);
  }, []);

  useEffect(() => {
    measure();
    const onResize = () => {
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
      resizeTimer.current = setTimeout(measure, 120);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [measure]);

  useEffect(() => {
    if (!loading && rashiData.length > 0) requestAnimationFrame(measure);
  }, [loading, rashiData.length, measure]);

  /* ── AUTO SCROLL — single interval, entire component lifetime ── */
  useEffect(() => {
    autoTimer.current = setInterval(() => {
      if (loadingRef.current || pausedRef.current) return;
      const total = rashiDataRef.current.length;
      const pv    = perViewRef.current;
      const iw    = itemWidthRef.current;
      if (total === 0 || pv === 0 || iw === 0) return;
      const maxS = Math.max(0, total - pv);
      if (maxS === 0) return;
      const next = slideRef.current >= maxS ? 0 : slideRef.current + 1;
      slideRef.current = next;
      setSlide(next);
    }, 7000);
    return () => { if (autoTimer.current) clearInterval(autoTimer.current); };
  }, []); /* empty — intentional, all data via refs */

  /* ── navigation ── */
  const goTo = useCallback((n: number) => {
    const curMax = Math.max(0, rashiDataRef.current.length - perViewRef.current);
    const next   = Math.max(0, Math.min(n, curMax));
    slideRef.current = next;
    setSlide(next);
  }, []);

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
    const curMax = Math.max(0, rashiDataRef.current.length - perViewRef.current);
    const next   = Math.max(0, Math.min(curMax, dragStartSlide.current + moved));
    slideRef.current = next;
    setSlide(next);
  }, []);
  const onMouseUp    = () => {
    mouseStartX.current = 0;
    setTimeout(() => { isDragging.current = false; pausedRef.current = false; }, 500);
  };
  const onMouseLeave = () => { isDragging.current = false; mouseStartX.current = 0; };

  /* ── render ── */
  const maxSlide      = Math.max(0, rashiData.length - perView);
  const leftDisabled  = slide === 0;
  const rightDisabled = slide >= maxSlide;
  const trackWidth    = itemWidth * Math.max(rashiData.length, perView);

  return (
    <>
      <div className="rashiSectionNav">
        <div className="rashiSectionNav-left">
          <Link href="/category/religion">
            <img src="/assets/icons/e-paper-1.svg" alt="ધર્મ રાશિ" />
            <span className="custom-gujrati-font">ધર્મ</span>
          </Link>
        </div>
        <div className="rashiSectionNav-right">
          <Link href="/category/religion" className="custom-link-btn rashi-more-link">
            વધુ વાંચો &nbsp;<span className="rashi-more-btn"><i className="fas fa-chevron-right"></i></span>
          </Link>
        </div>
      </div>

      <div
        className="MultiCarousel rashi-carousel"
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
          <div style={{ display: 'flex', width: '100%', gap: '4px' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ flex: 1, aspectRatio: '16/9', background: '#f0f0f0', borderRadius: '6px' }} />
            ))}
          </div>
        ) : rashiData.length === 0 ? null : (
          <>
            <div
              className="MultiCarousel-inner rashi-items"
              ref={sliderRef}
              style={{
                display:    'flex',
                transform:  `translateX(-${slide * (itemWidthRef.current || itemWidth)}px)`,
                transition: 'transform 0.3s ease',
                width:      trackWidth > 0 ? `${trackWidth}px` : '100%',
              }}
            >
              {rashiData.map((rashi) => {
                if (!rashi?.news) return null;
                return (
                  <div
                    key={rashi.id}
                    className="rashi-item loaded"
                    style={{ width: `${itemWidth}px`, flex: 'none', padding: '4px' }}
                  >
                    <div className="rashi-card">
                      <Link href={`/videos/${rashi.news?.slug || '#'}`} className="rashi-video-link">
                        <div className="rashi-video-thumb">
                          <img
                            src={getThumb(rashi.news)}
                            alt={rashi.news?.news_title || rashi.title}
                            loading="lazy"
                            onError={(e) => {
                              const img = e.currentTarget;
                              if (!img.dataset.fb) { img.dataset.fb = '1'; img.src = '/images/gstv-logo-bg.png'; }
                            }}
                          />
                          <span className="rashi-play-icon"><i className="fa fa-play-circle" /></span>
                        </div>
                      </Link>
                    </div>
                  </div>
                );
              })}

              {rashiData.length > 0 && rashiData.length < perView &&
                Array.from({ length: perView - rashiData.length }).map((_, i) => (
                  <div key={`sp-${i}`} className="rashi-item" style={{ width: `${itemWidth}px`, flex: 'none', padding: '4px' }}>
                    <div className="rashi-card" />
                  </div>
                ))
              }
            </div>

            {leftDisabled ? (
              <span className="btn btn-primary leftLst over disabled-arrow" aria-hidden="true" />
            ) : (
              <button className="btn btn-primary leftLst" type="button"
                onClick={e => { e.stopPropagation(); e.preventDefault(); prevSlide(); }}
                onMouseDown={e => e.stopPropagation()} aria-label="Previous">
                <i className="fa fa-chevron-left" />
              </button>
            )}

            {rightDisabled ? (
              <span className="btn btn-primary rightLst over disabled-arrow" aria-hidden="true" />
            ) : (
              <button className="btn btn-primary rightLst" type="button"
                onClick={e => { e.stopPropagation(); e.preventDefault(); nextSlide(); }}
                onMouseDown={e => e.stopPropagation()} aria-label="Next">
                <i className="fa fa-chevron-right" />
              </button>
            )}
          </>
        )}
      </div>

      <div style={{ clear: 'both' }} />
    </>
  );
}
