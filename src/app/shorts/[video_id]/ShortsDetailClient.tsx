'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_ENDPOINTS } from '@/constants/api';

interface ShortItem {
  title: string;
  thumbnail: string;
  video_id: string;
  youtube_url: string;
  published_at: string;
}

interface Props {
  initialVideoId: string;
}

export default function ShortsDetailClient({ initialVideoId }: Props) {
  const router = useRouter();
  const [shorts, setShorts] = useState<ShortItem[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(1024);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const touchStartY = useRef(0);
  const isScrolling = useRef(false);

  /* ── lock body overflow ── */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  /* ── track window width ── */
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* ── fetch shorts ── */
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(API_ENDPOINTS.GET_YOUTUBE_SHORTS, { cache: 'no-store' });
        const data = await res.json();
        if (data?.status === true && Array.isArray(data?.data)) {
          const list: ShortItem[] = data.data;
          setShorts(list);
          const idx = list.findIndex(s => s.video_id === initialVideoId);
          setActiveIdx(idx >= 0 ? idx : 0);
        }
      } catch (e) {
        console.error('ShortsDetail fetch failed', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [initialVideoId]);

  const initialScrollDone = useRef(false);

  /* ── scroll to active + update URL ── */
  useEffect(() => {
    if (shorts.length === 0) return;

    const vid = shorts[activeIdx]?.video_id;

    // For the initial load, use instant scroll so the correct video is shown immediately
    const isInitial = !initialScrollDone.current;

    // Defer until after DOM paint so refs are populated
    requestAnimationFrame(() => {
      const el = itemRefs.current[activeIdx];
      if (el) {
        el.scrollIntoView({
          behavior: isInitial ? 'instant' : 'smooth',
          block: 'start',
        });
        initialScrollDone.current = true;
      }
    });

    if (vid && vid !== initialVideoId) {
      window.history.replaceState(null, '', `/shorts/${vid}`);
    }
  }, [activeIdx, shorts]);

  /* ── navigate ── */
  const goNext = useCallback(() => {
    setActiveIdx(i => Math.min(i + 1, shorts.length - 1));
  }, [shorts.length]);

  const goPrev = useCallback(() => {
    setActiveIdx(i => Math.max(i - 1, 0));
  }, []);

  /* ── keyboard ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); goPrev(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  /* ── touch swipe ── */
  const onTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (diff > 60) goNext(); else if (diff < -60) goPrev();
  };

  /* ── wheel (desktop) ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isScrolling.current) return;
      isScrolling.current = true;
      if (e.deltaY > 0) goNext(); else goPrev();
      setTimeout(() => { isScrolling.current = false; }, 700);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [goNext, goPrev]);

  /* ── intersection observer ── */
  useEffect(() => {
    if (shorts.length === 0) return;
    const obs = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = itemRefs.current.findIndex(r => r === entry.target);
          if (idx >= 0) setActiveIdx(idx);
        }
      }),
      { threshold: 0.6 }
    );
    itemRefs.current.forEach(el => { if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [shorts]);

  const isMobile = windowWidth <= 768;

  /* ─────────── LOADING ─────────── */
  if (loading) {
    return (
      <>
        <style>{`
          body, html { overflow: hidden !important; background: #eee !important; }
          @media (max-width: 768px) { body, html { background: #000 !important; } }
          @keyframes sd-spin { to { transform: rotate(360deg); } }
        `}</style>
        <div style={{
          position: 'fixed', inset: 0,
          background: isMobile ? '#000' : '#eee',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 99999,
        }}>
          <div style={{
            width: 40, height: 40,
            border: '3px solid rgba(133,14,0,.25)',
            borderTopColor: '#800d00',
            borderRadius: '50%',
            animation: 'sd-spin .8s linear infinite',
          }} />
        </div>
      </>
    );
  }

  /* ─────────── EMPTY ─────────── */
  if (shorts.length === 0) {
    return (
      <>
        <style>{`body, html { overflow: hidden !important; }`}</style>
        <div style={{
          position: 'fixed', inset: 0, background: '#eee',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 99999, gap: 16,
        }}>
          <p style={{ color: '#333' }}>કોઈ વીડિઓ મળ્યો નહીં</p>
          <Link href="/" style={{ color: '#800d00', fontWeight: 600 }}>હોમ પર જાઓ</Link>
        </div>
      </>
    );
  }

  /* ─────────── MAIN ─────────── */
  return (
    <>
      {/* Match video page body background exactly */}
      <style>{`
        body, html {
          overflow: hidden !important;
          background: #eee !important;
        }
        @media (max-width: 768px) {
          body, html { background: #000 !important; }
        }
        /* zero-out layout wrapper padding */
        .contents-main-div, .row.left-nav, .Center-main-div {
          padding: 0 !important;
          margin: 0 !important;
          background: transparent !important;
        }
        @keyframes sd-spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Back button — identical to video page ── */}
      <div style={{
        position: 'fixed',
        top: 20, left: 20,
        zIndex: 100001,
      }}>
        <button
          type="button"
          onClick={() => router.push('/')}
          aria-label="Back"
          style={{
            background: '#800d00',
            border: '2px solid #800d00',
            borderRadius: '50%',
            width: 32, height: 32,
            color: '#fff',
            fontSize: 16,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            outline: 'none',
            transition: 'all 0.3s ease',
          } as React.CSSProperties}
          onMouseOver={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#000';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#000';
          }}
          onMouseOut={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#800d00';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#800d00';
          }}
        >
          <i className="fas fa-arrow-left" />
        </button>
      </div>

      {/* ── Desktop nav arrows — matches video page exactly ── */}
      {!isMobile && shorts.length > 1 && (
        <div style={{
          position: 'fixed',
          right: 'calc(50% - 200px - 70px)',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 100001,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}>
          {/* Up arrow */}
          {activeIdx > 0 ? (
            <div
              onClick={goPrev}
              title="Previous"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80 }}
              onMouseOver={e => { const s = e.currentTarget.querySelector('svg'); if (s) (s as SVGSVGElement).style.stroke = '#dc3545'; }}
              onMouseOut={e  => { const s = e.currentTarget.querySelector('svg'); if (s) (s as SVGSVGElement).style.stroke = '#850e00'; }}
            >
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none"
                stroke="#850e00" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
                style={{ transition: '0.3s' }}>
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </div>
          ) : (
            <div style={{ width: 80, height: 80, opacity: 0.2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none"
                stroke="#850e00" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </div>
          )}

          {/* Down arrow */}
          {activeIdx < shorts.length - 1 ? (
            <div
              onClick={goNext}
              title="Next"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80 }}
              onMouseOver={e => { const s = e.currentTarget.querySelector('svg'); if (s) (s as SVGSVGElement).style.stroke = '#dc3545'; }}
              onMouseOut={e  => { const s = e.currentTarget.querySelector('svg'); if (s) (s as SVGSVGElement).style.stroke = '#850e00'; }}
            >
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none"
                stroke="#850e00" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
                style={{ transition: '0.3s' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          ) : (
            <div style={{ width: 80, height: 80, opacity: 0.2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none"
                stroke="#850e00" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          )}
        </div>
      )}

      {/* ── Main container ── */}
      <div
        className="sd-container"
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* ── Shorts feed ── */}
        <div className="sd-feed">
          {shorts.map((item, i) => (
            <div
              key={item.video_id}
              className="sd-item"
              ref={el => { itemRefs.current[i] = el; }}
            >
              {Math.abs(i - activeIdx) <= 1 ? (
                <div className="sd-player">
                  <iframe
                    src={`https://www.youtube.com/embed/${item.video_id}?autoplay=${i === activeIdx ? 1 : 0}&mute=${i === activeIdx ? 0 : 1}&rel=0&playsinline=1&loop=1&playlist=${item.video_id}`}
                    title={item.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              ) : (
                <div className="sd-player sd-thumb-placeholder">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/video-default.png'; }}
                  />
                  <div className="sd-play-overlay">
                    <i className="fa fa-play" />
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      </div>

      <style>{`
        /* ── outer: #eee desktop / #000 mobile — matches video page ── */
        .sd-container {
          position: fixed;
          inset: 0;
          background: #eee;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          z-index: 99999;
        }
        @media (max-width: 768px) {
          .sd-container { background: #000; }
        }

        /* ── feed — centered portrait column ── */
        .sd-feed {
          width: 100%;
          max-width: 400px;
          height: 100vh;
          overflow-y: auto;
          scroll-snap-type: y mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          display: flex;
          flex-direction: column;
          background: #000;
        }
        .sd-feed::-webkit-scrollbar { display: none; }

        /* ── mobile: full width ── */
        @media (max-width: 768px) {
          .sd-feed {
            max-width: 100%;
          }
        }

        /* ── each item ── */
        .sd-item {
          height: 100vh;
          width: 100%;
          position: relative;
          scroll-snap-align: start;
          flex-shrink: 0;
          background: #000;
        }

        /* ── player ── */
        .sd-player {
          position: absolute;
          inset: 0;
        }
        .sd-player iframe {
          width: 100%; height: 100%;
          border: none; display: block;
        }

        /* ── thumbnail placeholder ── */
        .sd-thumb-placeholder { background: #111; }
        .sd-thumb-placeholder img {
          width: 100%; height: 100%;
          object-fit: cover; opacity: 0.6; display: block;
        }
        .sd-play-overlay {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          pointer-events: none;
        }
        .sd-play-overlay i {
          font-size: 48px;
          color: rgba(255,255,255,.8);
          text-shadow: 0 2px 12px rgba(0,0,0,.6);
        }

        /* ── title overlay ── */
        .sd-info {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          z-index: 10;
          padding: 40px 16px 20px;
          background: linear-gradient(to top, rgba(0,0,0,.8) 0%, transparent 100%);
        }
        .sd-title {
          color: #fff;
          font-size: 13px; font-weight: 600; line-height: 1.45; margin: 0;
          text-shadow: 0 1px 6px rgba(0,0,0,.9);
          display: -webkit-box;
          -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}
