'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MEDIA_BASE_URL } from '@/constants/api';
import '@/styles/TopVideos.css';

const AUTO_SLIDE_INTERVAL = 5000;
const AUTO_TAB_INTERVAL   = 10000;
const PER_PAGE            = 6;   // matches API per_page

interface VideoItem {
  id: number;
  title: string;
  slug: string;
  videoURL?: string;
  video_webp?: string;
  featureImage?: string | null;
  category_names?: string;
  category_slugs?: string;
  [key: string]: any;
}

interface CategoryTab {
  category_id: number;
  category_name: string;
  category_slug: string;
}

function getThumb(v: VideoItem): string {
  if (v.video_webp?.trim()) return v.video_webp;
  if (v.featureImage?.trim())
    return v.featureImage.startsWith('http')
      ? v.featureImage
      : `${MEDIA_BASE_URL}${v.featureImage}`;
  const raw = v.videoURL || '';
  if (!raw) return '/images/video-default.png';
  const dot  = raw.lastIndexOf('.');
  const base = dot > 0 ? raw.slice(0, dot) : raw;
  return base.startsWith('/') ? `${MEDIA_BASE_URL}${base}_video.webp` : `${base}_video.webp`;
}

export default function TopVideos() {
  /* ── state ── */
  const [tabs,        setTabs]        = useState<CategoryTab[]>([]);
  const [videos,      setVideos]      = useState<VideoItem[]>([]);
  const [tabLoading,  setTabLoading]  = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [activeIdx,   setActiveIdx]   = useState(0);
  const [slide,       setSlide]       = useState(0);
  const [itemWidth,   setItemWidth]   = useState(0);
  const [perView,     setPerView]     = useState(6);
  const [autoSlide,   setAutoSlide]   = useState(true);

  /* ── refs (always fresh, no stale closures) ── */
  const nextPageRef    = useRef(2);
  const hasMoreRef     = useRef(false);  // driven by pagination.has_more from API
  const fetchingRef    = useRef(false);
  const tabFetchingRef = useRef(false);

  const videosRef    = useRef<VideoItem[]>([]);
  const slideRef     = useRef(0);
  const perViewRef   = useRef(6);
  const tabsRef      = useRef<CategoryTab[]>([]);
  const activeIdxRef = useRef(0);
  const itemWidthRef = useRef(0);

  const sliderRef      = useRef<HTMLDivElement>(null);
  const tabsBarRef     = useRef<HTMLDivElement>(null);   // category tab scrollable bar
  const autoSlideTimer = useRef<NodeJS.Timeout | null>(null);
  const autoTabTimer   = useRef<NodeJS.Timeout | null>(null);
  const resizeTimer    = useRef<NodeJS.Timeout | null>(null);
  const isDragging     = useRef(false);
  const mouseStartX    = useRef(0);
  const dragStartSlide = useRef(0);
  const touchStart     = useRef(0);
  const touchEnd       = useRef(0);

  /* keep mirrors in sync with state */
  useEffect(() => { videosRef.current    = videos;    }, [videos]);
  useEffect(() => { slideRef.current     = slide;     }, [slide]);
  useEffect(() => { perViewRef.current   = perView;   }, [perView]);
  useEffect(() => { tabsRef.current      = tabs;      }, [tabs]);
  useEffect(() => { activeIdxRef.current = activeIdx; }, [activeIdx]);
  useEffect(() => { itemWidthRef.current = itemWidth; }, [itemWidth]);

  /* ─────────────────────────────────────────────────────────────────────────
   * fetchMore — appends next page to current video list
   * Uses /api/topVideosBySlug (local Next.js proxy) — NOT the external URL
   * Reads pagination.has_more from the response to know if more pages exist
   * ───────────────────────────────────────────────────────────────────────── */
  const fetchMore = useCallback(async (slug: string, page: number) => {
    if (fetchingRef.current)    return;  // already in-flight
    if (!hasMoreRef.current)    return;  // API told us no more pages

    fetchingRef.current = true;
    setLoadingMore(true);

    try {
      const res  = await fetch('/api/topVideosBySlug', {
        method: 'POST',
        cache:  'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, page, per_page: PER_PAGE }),
      });
      const data = await res.json();
      const items: VideoItem[] = Array.isArray(data?.videos) ? data.videos : [];

      // ← KEY FIX: use pagination.has_more, not items.length
      hasMoreRef.current  = data?.pagination?.has_more === true;
      nextPageRef.current = (data?.pagination?.current_page ?? page) + 1;

      setVideos(prev => {
        const merged = [...prev, ...items];
        videosRef.current = merged;
        return merged;
      });
    } catch (err) {
      console.error('fetchMore failed', err);
      hasMoreRef.current = false;
    } finally {
      fetchingRef.current = false;
      setLoadingMore(false);
    }
  }, []);

  /* ─────────────────────────────────────────────────────────────────────────
   * loadTab — replaces video list when switching category tabs
   * ───────────────────────────────────────────────────────────────────────── */
  const loadTab = useCallback(async (slug: string) => {
    fetchingRef.current    = false;  // cancel any in-flight guard
    tabFetchingRef.current = true;
    hasMoreRef.current     = false;
    nextPageRef.current    = 1;

    setTabLoading(true);
    setLoadingMore(false);
    setSlide(0);
    slideRef.current = 0;
    setAutoSlide(true);

    try {
      const res  = await fetch('/api/topVideosBySlug', {
        method: 'POST',
        cache:  'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, page: 1, per_page: PER_PAGE }),
      });
      const data = await res.json();
      const items: VideoItem[] = Array.isArray(data?.videos) ? data.videos : [];

      // ← KEY FIX: use pagination.has_more
      hasMoreRef.current  = data?.pagination?.has_more === true;
      nextPageRef.current = 2;

      setVideos(items);
      videosRef.current = items;
    } catch (err) {
      console.error('loadTab failed', err);
      setVideos([]);
      videosRef.current  = [];
      hasMoreRef.current = false;
    } finally {
      tabFetchingRef.current = false;
      setTabLoading(false);
    }
  }, []);

  /* ── initial load: grouped topVideos API ── */
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch('/api/topVideos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page: 1, per_page: PER_PAGE }),
          cache: 'no-store',
        });
        const data = await res.json();

        if (data?.status === true && Array.isArray(data?.data)) {
          const allTabs: CategoryTab[] = data.data.map((g: any) => ({
            category_id:   g.category_id,
            category_name: g.category_name,
            category_slug: g.category_slug,
          }));
          setTabs(allTabs);
          tabsRef.current = allTabs;

          const first = data.data[0];
          if (Array.isArray(first?.videos) && first.videos.length > 0) {
            const items = first.videos as VideoItem[];
            setVideos(items);
            videosRef.current = items;
            // grouped API may not return pagination — fall back to slug fetch to get proper has_more
            // load first tab via slug so we get pagination info
            if (allTabs[0]) {
              await loadTab(allTabs[0].category_slug);
            }
          } else if (allTabs.length > 0) {
            await loadTab(allTabs[0].category_slug);
          }
        }
      } catch (e) {
        console.error('TopVideos initial load failed', e);
      } finally {
        setInitialLoad(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── tab switch ── */
  const switchTab = useCallback((idx: number) => {
    if (idx === activeIdxRef.current) return;
    setActiveIdx(idx);
    activeIdxRef.current = idx;
    const slug = tabsRef.current[idx]?.category_slug;
    if (slug) loadTab(slug);
  }, [loadTab]);

  /* ── restart auto-tab from a given index (used on manual click) ── */
  const restartAutoTab = useCallback((fromIdx: number) => {
    if (autoTabTimer.current) clearInterval(autoTabTimer.current);
    if (tabsRef.current.length <= 1) return;
    autoTabTimer.current = setInterval(() => {
      const next = (activeIdxRef.current + 1) % tabsRef.current.length;
      setActiveIdx(next);
      activeIdxRef.current = next;
      const slug = tabsRef.current[next]?.category_slug;
      if (slug) loadTab(slug);
      // scroll only the tab bar horizontally — never the page
      const bar = tabsBarRef.current;
      if (bar) {
        const btn = bar.children[next] as HTMLElement | undefined;
        if (btn) {
          bar.scrollLeft = btn.offsetLeft - bar.offsetWidth / 2 + btn.offsetWidth / 2;
        }
      }
    }, AUTO_TAB_INTERVAL);
  }, [loadTab]);

  /* ── auto-tab ── */
  useEffect(() => {
    if (autoTabTimer.current) clearInterval(autoTabTimer.current);
    if (!initialLoad && tabs.length > 1) {
      autoTabTimer.current = setInterval(() => {
        const next = (activeIdxRef.current + 1) % tabsRef.current.length;
        setActiveIdx(next);
        activeIdxRef.current = next;
        const slug = tabsRef.current[next]?.category_slug;
        if (slug) loadTab(slug);
        // scroll only the tab bar horizontally — never the page
        const bar = tabsBarRef.current;
        if (bar) {
          const btn = bar.children[next] as HTMLElement | undefined;
          if (btn) {
            bar.scrollLeft = btn.offsetLeft - bar.offsetWidth / 2 + btn.offsetWidth / 2;
          }
        }
      }, AUTO_TAB_INTERVAL);
    }
    return () => { if (autoTabTimer.current) clearInterval(autoTabTimer.current); };
  }, [initialLoad, tabs.length, loadTab]);

  /* ── mouse drag-scroll + wheel scroll on tab bar ── */
  useEffect(() => {
    const bar = tabsBarRef.current;
    if (!bar) return;

    // wheel: vertical scroll → horizontal pan
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      bar.scrollLeft += e.deltaY * 0.8;
    };

    // mouse drag
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    const onDown = (e: MouseEvent) => {
      isDown = true;
      bar.style.cursor = 'grabbing';
      startX     = e.pageX - bar.offsetLeft;
      scrollLeft = bar.scrollLeft;
    };
    const onUp = () => { isDown = false; bar.style.cursor = 'grab'; };
    const onMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const walk = (e.pageX - bar.offsetLeft - startX) * 1.2;
      bar.scrollLeft = scrollLeft - walk;
    };

    bar.addEventListener('wheel',      onWheel, { passive: false });
    bar.addEventListener('mousedown',  onDown);
    bar.addEventListener('mouseup',    onUp);
    bar.addEventListener('mouseleave', onUp);
    bar.addEventListener('mousemove',  onMove);
    return () => {
      bar.removeEventListener('wheel',      onWheel);
      bar.removeEventListener('mousedown',  onDown);
      bar.removeEventListener('mouseup',    onUp);
      bar.removeEventListener('mouseleave', onUp);
      bar.removeEventListener('mousemove',  onMove);
    };
  }, [tabs]);

  /* ── scroll active tab into view when activeIdx changes ── */
  useEffect(() => {
    const bar = tabsBarRef.current;
    if (!bar) return;
    const btn = bar.children[activeIdx] as HTMLElement | undefined;
    if (btn) {
      // scroll only the tab bar — never the page
      bar.scrollLeft = btn.offsetLeft - bar.offsetWidth / 2 + btn.offsetWidth / 2;
    }
  }, [activeIdx]);

  /* ── layout measurement ── */
  const measure = useCallback(() => {
    const pv = window.innerWidth < 768 ? 3 : 6;
    setPerView(pv);
    perViewRef.current = pv;
    if (sliderRef.current?.parentElement) {
      const w = sliderRef.current.parentElement.offsetWidth / pv;
      setItemWidth(w);
      itemWidthRef.current = w;
    }
  }, []);

  useEffect(() => {
    measure();
    const onResize = () => {
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
      resizeTimer.current = setTimeout(measure, 120);
    };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); };
  }, [measure]);

  useEffect(() => {
    if (videos.length > 0) requestAnimationFrame(measure);
  }, [videos.length, measure]);

  /* ─────────────────────────────────────────────────────────────────────────
   * triggerFetchIfNeeded
   * Called after every slide move. Loads next page when the user reaches
   * the last visible position in the currently loaded set.
   *
   * Example: 6 videos, perView=6 → maxSlide=0
   *   slide(0) >= maxSlide(0) → fetch page 2
   *   page 2 arrives (12 videos) → maxSlide=6
   *   slide(0)..slide(5): normal scroll
   *   slide(6) >= maxSlide(6) → fetch page 3 …
   * ───────────────────────────────────────────────────────────────────────── */
  const triggerFetchIfNeeded = useCallback(() => {
    if (!hasMoreRef.current)            return;
    if (fetchingRef.current)            return;
    if (tabFetchingRef.current)         return;
    if (videosRef.current.length === 0) return;

    const cur    = slideRef.current;
    const total  = videosRef.current.length;
    const pv     = perViewRef.current;
    const curMax = Math.max(0, total - pv);

    if (cur >= curMax) {
      const slug = tabsRef.current[activeIdxRef.current]?.category_slug;
      if (slug) fetchMore(slug, nextPageRef.current);
    }
  }, [fetchMore]);

  /* ── derived ── */
  const maxSlide = Math.max(0, videos.length - perView);

  /* ── navigation ── */
  const goTo = useCallback((n: number) => {
    const total  = videosRef.current.length;
    const pv     = perViewRef.current;
    const curMax = Math.max(0, total - pv);
    const next   = Math.max(0, Math.min(n, curMax));

    setAutoSlide(false);
    setSlide(next);
    slideRef.current = next;
    triggerFetchIfNeeded();
  }, [triggerFetchIfNeeded]);

  const nextSlide = useCallback(() => goTo(slideRef.current + 1), [goTo]);
  const prevSlide = useCallback(() => goTo(slideRef.current - 1), [goTo]);

  /* ── auto-slide ── */
  useEffect(() => {
    if (autoSlideTimer.current) clearInterval(autoSlideTimer.current);
    if (autoSlide && videos.length > 0) {
      autoSlideTimer.current = setInterval(() => {
        const total  = videosRef.current.length;
        const pv     = perViewRef.current;
        const curMax = Math.max(0, total - pv);
        const cur    = slideRef.current;

        let next: number;
        if (cur >= curMax) {
          if (hasMoreRef.current) {
            next = curMax;             // hold position while next page loads
            setTimeout(triggerFetchIfNeeded, 0);
          } else {
            next = 0;                  // loop back — no more data
          }
        } else {
          next = cur + 1;
        }

        if (next !== cur) {
          setSlide(next);
          slideRef.current = next;
        }
        setTimeout(triggerFetchIfNeeded, 0);
      }, AUTO_SLIDE_INTERVAL);
    }
    return () => { if (autoSlideTimer.current) clearInterval(autoSlideTimer.current); };
  }, [autoSlide, videos.length, triggerFetchIfNeeded]);

  /* ── touch ── */
  const onTouchStart = (e: React.TouchEvent) => {
    setAutoSlide(false);
    touchStart.current = e.touches[0].clientX;
    touchEnd.current   = e.touches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => { touchEnd.current = e.touches[0].clientX; };
  const onTouchEnd  = () => {
    const d = touchStart.current - touchEnd.current;
    if (Math.abs(d) > 50) d > 0 ? nextSlide() : prevSlide();
  };

  /* ── mouse drag ── */
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current     = false;
    mouseStartX.current    = e.clientX;
    dragStartSlide.current = slideRef.current;
    setAutoSlide(false);
    e.preventDefault();
  };
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!mouseStartX.current) return;
    if (Math.abs(e.clientX - mouseStartX.current) > 5) isDragging.current = true;
    if (!isDragging.current) return;
    const w      = itemWidthRef.current || 1;
    const moved  = Math.round((mouseStartX.current - e.clientX) / w);
    const total  = videosRef.current.length;
    const pv     = perViewRef.current;
    const curMax = Math.max(0, total - pv);
    const next   = Math.max(0, Math.min(curMax, dragStartSlide.current + moved));
    setSlide(next);
    slideRef.current = next;
    triggerFetchIfNeeded();
  }, [triggerFetchIfNeeded]);
  const onMouseUp    = () => { mouseStartX.current = 0; setTimeout(() => { isDragging.current = false; }, 50); };
  const onMouseLeave = () => { isDragging.current = false; mouseStartX.current = 0; };

  if (tabs.length === 0) return null;

  const leftDisabled  = slide === 0;
  // Disabled only when at the visual end AND the API confirmed no more pages
  const rightDisabled = slide >= maxSlide && !hasMoreRef.current;

  return (
    <div className="tv-wrap">
      <div className="tv-box">

        {/* ── carousel ── */}
        <div
          className="MultiCarousel tv-carousel"
          onMouseEnter={() => setAutoSlide(false)}
          onMouseLeave={onMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          style={{ cursor: isDragging.current ? 'grabbing' : 'grab', minHeight: 180 }}
        >
          <div
            className="MultiCarousel-inner topvideos"
            ref={sliderRef}
            style={{
              display:    'flex',
              transform:  itemWidth ? `translateX(-${slide * itemWidth}px)` : 'none',
              transition: tabLoading ? 'none' : 'transform 0.3s ease',
              width: `${itemWidth * perView}px`,
            }}
          >
            {tabLoading ? (
              /* ── placeholder cards during tab switch — identical DOM to real cards, no layout jump ── */
              Array.from({ length: perView }).map((_, i) => (
                <div key={`ph-${i}`} className="item loaded tv-item" style={{ width: `${itemWidth}px`, flex: 'none', padding: '4px' }}>
                  <div className="tv-card">
                    <div className="tv-thumb-link" style={{ display: 'block', flex: 1 }}>
                      <div className="tv-thumb1">
                        <img
                          src="/images/video-default.png"
                          alt=""
                          style={{ opacity: 0.4 }}
                        />
                        <div className="shimmer" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <>
                {videos.map((video) => (
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
                            alt={video.title || ''}
                            loading="lazy"
                            onError={e => {
                              const img = e.currentTarget;
                              if (!img.dataset.fb) {
                                img.dataset.fb = '1';
                                img.src = '/images/video-default.png';
                              }
                            }}
                          />
                          <div className="tv-overlay" style={{ display: 'none' }}>
                            <span className="tv-overlay-title custom-gujrati-font">{video.title}</span>
                          </div>
                          <span className="tv-play"><i className="fa fa-play-circle" /></span>
                        </div>
                      </Link>
                    </div>
                  </div>
                ))}

                {/* default image placeholders while next page loads */}
                {loadingMore && Array.from({ length: perView }).map((_, i) => (
                  <div key={`sk-${i}`} className="tv-item" style={{ width: `${itemWidth}px`, flex: 'none', padding: '4px' }}>
                    <div className="tv-card">
                      <div className="tv-thumb1">
                        <img
                          src="/images/video-default.png"
                          alt="GSTV Video Thumbnail - Gujarati News Videos"
                          style={{ opacity: 0.4 }}
                        />
                        <div className="shimmer" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />
                      </div>
                    </div>
                  </div>
                ))}

                {/* spacers when fewer videos than one view */}
                {!loadingMore && videos.length > 0 && videos.length < perView &&
                  Array.from({ length: perView - videos.length }).map((_, i) => (
                    <div key={`sp-${i}`} className="tv-item" style={{ width: `${itemWidth}px`, flex: 'none', padding: '4px' }}>
                      <div className="tv-card">
                        <div className="tv-thumb1">
                          <img src="/images/video-default.png" alt="GSTV Video Thumbnail - Gujarati News Videos"  />
                        </div>
                      </div>
                    </div>
                  ))
                }
              </>
            )}
          </div>

          <button
            className={`btn btn-primary leftLst${leftDisabled ? ' over' : ''}`}
            onClick={prevSlide}
            disabled={leftDisabled}
          >
            <i className="fa fa-chevron-left" />
          </button>
          <button
            className={`btn btn-primary rightLst${rightDisabled ? ' over' : ''}`}
            onClick={nextSlide}
            disabled={rightDisabled}
          >
            <i className="fa fa-chevron-right" />
          </button>
        </div>

        {/* ── category tabs ── */}
        <div className="tv-tabs" ref={tabsBarRef}>
          {tabs.map((tab, idx) => (
            <button
              key={tab.category_id}
              className={`tv-tab custom-gujrati-font${idx === activeIdx ? ' active' : ''}`}
              onClick={() => {
                switchTab(idx);
                restartAutoTab(idx); // restart timer from this tab
              }}
            >
              {tab.category_name}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
