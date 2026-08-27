'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { API_ENDPOINTS } from '@/constants/api';

interface ShortItem {
  title: string;
  thumbnail: string;
  video_id: string;
  youtube_url: string;
  published_at: string;
}

const YOUTUBE_CHANNEL_SHORTS = 'https://www.youtube.com/@GSTVNEWS/shorts';
const PER_VIEW_DESKTOP = 5;
const PER_VIEW_MOBILE  = 3;
const GAP = 8;

export default function YoutubeShorts() {
  const [shorts,  setShorts]  = useState<ShortItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx,     setIdx]     = useState(0);
  const [perView, setPerView] = useState(PER_VIEW_DESKTOP);
  const [cardW,   setCardW]   = useState(0);

  const viewportRef = useRef<HTMLDivElement>(null);
  const resizeRef   = useRef<NodeJS.Timeout | null>(null);

  /* ── fetch ── */
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(API_ENDPOINTS.GET_YOUTUBE_SHORTS, { cache: 'no-store' });
        const data = await res.json();
        if (data?.status === true && Array.isArray(data?.data)) setShorts(data.data);
      } catch (e) {
        console.error('YoutubeShorts fetch failed', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── measure ── */
  const measure = useCallback(() => {
    const pv = window.innerWidth < 768 ? PER_VIEW_MOBILE : PER_VIEW_DESKTOP;
    setPerView(pv);
    if (viewportRef.current) {
      const w = (viewportRef.current.offsetWidth - GAP * (pv - 1)) / pv;
      setCardW(w);
    }
  }, []);

  useEffect(() => {
    measure();
    const onResize = () => {
      if (resizeRef.current) clearTimeout(resizeRef.current);
      resizeRef.current = setTimeout(measure, 120);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [measure]);

  useEffect(() => {
    if (!loading) requestAnimationFrame(measure);
  }, [loading, measure]);

  /* ── nav ── */
  const total  = loading ? PER_VIEW_DESKTOP : shorts.length;
  const maxIdx = Math.max(0, total - perView);
  const prev = () => setIdx(i => Math.max(0, i - 1));
  const next = () => setIdx(i => Math.min(maxIdx, i + 1));

  /* ── touch ── */
  const touchStartX = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    const d = touchStartX.current - e.changedTouches[0].clientX;
    if (d > 40) next(); else if (d < -40) prev();
  };

  const translateX = idx * (cardW + GAP);
  const canPrev    = idx > 0;
  const canNext    = idx < maxIdx;

  if (!loading && shorts.length === 0) return null;

  return (
    <div className="ys-wrap">

      {/* ── Section header ── */}
      <div className="ys-header">
        <div className="ys-header-left">
          <svg className="ys-yt-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="5" fill="#FF0000"/>
            <path d="M9.5 7.5v9l7-4.5-7-4.5z" fill="#fff"/>
          </svg>
          <span className="ys-title-text custom-gujrati-font">GSTV શોર્ટ્સ</span>
        </div>
        <a href={YOUTUBE_CHANNEL_SHORTS} target="_blank" rel="noopener noreferrer"
           className="ys-more-link custom-gujrati-font">
          વધુ જુઓ &nbsp;<span className="ys-more-btn"><i className="fa fa-chevron-right" /></span>
        </a>
      </div>

      {/* ── Carousel ── */}
      {/* outer: positions the overlay arrows */}
      <div className="ys-outer">

        {/* Left arrow — span when at boundary so no events reach cards beneath */}
        {canPrev ? (
          <button
            className="ys-arrow ys-arrow-left btn btn-primary leftLst"
            type="button"
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); prev(); }}
            onMouseDown={(e) => e.stopPropagation()}
            aria-label="Previous"
          >
            <i className="fa fa-chevron-left" />
          </button>
        ) : (
          <span
            className="ys-arrow ys-arrow-left ys-arrow-off over disabled-arrow"
            aria-hidden="true"
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
            onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
            onMouseUp={(e) => { e.stopPropagation(); e.preventDefault(); }}
          >
            <i className="fa fa-chevron-left" />
          </span>
        )}

        {/* Viewport — clips the sliding track */}
        <div className="ys-viewport" ref={viewportRef}
             onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="ys-track"
               style={{ transform: `translateX(-${translateX}px)`, columnGap: `${GAP}px` }}>

            {loading
              ? Array.from({ length: PER_VIEW_DESKTOP }).map((_, i) => (
                  <div key={i} className="ys-card"
                       style={{ width: cardW || `calc((100% - ${GAP*(PER_VIEW_DESKTOP-1)}px)/${PER_VIEW_DESKTOP})` }}>
                    <div className="ys-thumb ys-skel-box">
                      <div className="ys-shimmer" style={{ position:'absolute', inset:0 }} />
                    </div>
                    <div className="ys-shimmer" style={{ height:13, borderRadius:4, width:'80%', marginTop:6 }} />
                    <div className="ys-shimmer" style={{ height:13, borderRadius:4, width:'55%', marginTop:4 }} />
                  </div>
                ))
              : shorts.map((item, i) => (
                  <Link
                    key={item.video_id}
                    href={`/shorts/${item.video_id}`}
                    className="ys-card"
                    style={{ width: cardW || 'auto' }}>
                    <div className="ys-thumb">
                      <img src={item.thumbnail} alt={item.title} loading="lazy"
                           onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/video-default.png'; }} />
                      
                    </div>
                  </Link>
                ))
            }
          </div>
        </div>

        {/* Right arrow — span when at boundary so no events reach cards beneath */}
        {canNext ? (
          <button
            className="ys-arrow ys-arrow-right btn btn-primary rightLst"
            type="button"
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); next(); }}
            onMouseDown={(e) => e.stopPropagation()}
            aria-label="Next"
          >
            <i className="fa fa-chevron-right" />
          </button>
        ) : (
          <span
            className="ys-arrow ys-arrow-right ys-arrow-off over disabled-arrow"
            aria-hidden="true"
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
            onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
            onMouseUp={(e) => { e.stopPropagation(); e.preventDefault(); }}
          >
            <i className="fa fa-chevron-right" />
          </span>
        )}

      </div>

      <style>{`
        /* ─── wrapper ─── */
        .ys-wrap {
          width: 100%;
          margin-bottom: 20px;
          clear: both;
          margin-top:10px;
        }

        /* ─── header ─── */
        .ys-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .ys-header-left  { display: flex; align-items: center; gap: 8px; }
        .ys-yt-icon      { width: 28px; height: 28px; flex-shrink: 0; border-radius: 5px; }
        .ys-title-text   { font-size: 18px; font-weight: 700; color: #1a1a1a; }
        .ys-more-link    { font-size: 14px; font-weight: 600; color: #850E00; text-decoration: none; display: flex; align-items: center; gap: 6px; }
        .ys-more-link:hover { text-decoration: underline; }
        .ys-more-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(133,14,0,0.90); border: 2px solid #b1974f;
          color: #fff; font-size: 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,.20);
          transition: background .2s, transform .2s;
          flex-shrink: 0;
        }
        .ys-more-link:hover .ys-more-btn {
          background: rgba(133,14,0,1);
          transform: scale(1.1);
          text-decoration: none;
        }

        /* ─── outer: relative so arrows can be absolute ─── */
        .ys-outer {
          position: relative;
        }

        /* ─── viewport ─── */
        .ys-viewport {
          overflow: hidden;
          width: 100%;
        }

        /* ─── track ─── */
        .ys-track {
          display: flex;
          transition: transform 0.35s ease;
          will-change: transform;
        }

        /* ─── card ─── */
        .ys-card {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
          text-decoration: none !important;
          color: inherit;
          margin-right: ${GAP}px;
        }
        .ys-card:last-child { margin-right: 0; }
        .ys-card:hover .ys-thumb img { transform: scale(1.04); }
        .ys-card:hover .ys-card-title { color: #850E00; }

        /* ─── thumbnail (portrait ratio) ─── */
        .ys-thumb {
          position: relative;
          width: 100%;
          padding-bottom: 178%;
          border-radius: 10px;
        }
        .ys-thumb img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center 15%;
          display: block;
          transition: transform 0.3s ease;
        }
        .ys-badge {
          position: absolute; bottom: 7px; left: 7px;
          background: rgba(0,0,0,.70);
          color: #fff; font-size: 10px; font-weight: 700;
          padding: 2px 8px 2px 4px;
          border-radius: 20px;
          display: flex; align-items: center; gap: 2px;
          z-index: 2;
        }

        /* ─── card title ─── */
        .ys-card-title {
          font-size: 13px; font-weight: 600;
          color: #1a1a1a; line-height: 1.4; margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2; line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ─── arrows: overlay on left/right of the viewport ─── */
        .ys-arrow {
          position: absolute;
          top: 40%;                   /* vertically centred in the thumb area */
          transform: translateY(-50%);
          z-index: 10;
          width: 32px; height: 32px;
          border-radius: 50%;
          border: 1px solid #bababa;
          background: #fff;
          color: #850e00;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0,0,0,.25);
          transition: background .2s, transform .2s, box-shadow .2s;
          
        }
        .ys-arrow:hover:not(.ys-arrow-off) {
          background: #FFF;
          border-color: rgba(133,14,0,1);
          color: rgba(133,14,0,1);
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 6px 20px rgba(0,0,0,.3);
        }
        .ys-arrow-left  { left: -3px; }
        .ys-arrow-right { right: -3px; }
        .ys-arrow-off   { opacity: .4; cursor: not-allowed; pointer-events: all !important; z-index: 20; background: rgba(180,180,180,0.7); border-color: #ccc; color: #999; }
        .ys-arrow i     { font-size: 16px; }

        /* ─── skeleton ─── */
        .ys-skel-box { background: #e8e8e8; }
        .ys-shimmer {
          background: linear-gradient(110deg,#e0e0e0 25%,#f5f5f5 40%,#e0e0e0 60%);
          background-size: 200% 100%;
          animation: ys-sh 1.4s infinite linear;
          border-radius: 4px;
        }
        @keyframes ys-sh {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }

        /* ─── mobile ─── */
        @media (max-width: 767px) {
          .ys-title-text  { font-size: 16px; }
          .ys-card-title  { font-size: 12px; }
          .ys-arrow       { width: 32px; height: 32px; }
          .ys-arrow-left  { left: -5px; }
          .ys-arrow-right { right: -5px; }
          .ys-arrow i     { font-size: 16px; }
        }
      `}</style>
    </div>
  );
}
