'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import '@/styles/profile.css';
import '@/styles/styles.css';
import '@/styles/styles_new.css';
import { getBuddhiImageUrl, formatBuddhiDate, formatBuddhiDateUrl, BuddhiItem, fetchBuddhiDetail } from '@/services/buddhiprakashApi';

/* Swiper */
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// ── Detail page ───────────────────────────────────────────────────────────────
export default function BuddhiDetailPage() {
  const params  = useParams() as { slug: string; date: string };
  const router  = useRouter();

  const [item, setItem]           = useState<BuddhiItem | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  /* zoom */
  const [zoomLevel, setZoomLevel]         = useState(1);
  const [isDragging, setIsDragging]       = useState(false);
  const [dragStart, setDragStart]         = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  const swiperRef = useRef<any>(null);

  useEffect(() => {
    if (!params.slug) return;
    fetchBuddhiDetail(params.slug).then((data) => {
      setItem(data);
      setLoading(false);
      if (!data) setError('બુદ્ધિપ્રકાશ મળ્યું નહીં');
    });
  }, [params.slug]);

  /* zoom helpers */
  const zoomIn  = () => setZoomLevel(z => Math.min(z + 0.25, 3));
  const zoomOut = () => setZoomLevel(z => Math.max(z - 0.25, 0.5));
  const resetZoom = () => { setZoomLevel(1); setImagePosition({ x: 0, y: 0 }); };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) { setIsDragging(true); setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y }); }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) setImagePosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const stopDrag = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel > 1 && e.touches.length === 1) {
      const t = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: t.clientX - imagePosition.x, y: t.clientY - imagePosition.y });
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && zoomLevel > 1 && e.touches.length === 1) {
      e.preventDefault();
      const t = e.touches[0];
      setImagePosition({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
    }
  };

  const handleImageClick = () => {
    if (zoomLevel === 1) { setZoomLevel(2); setImagePosition({ x: 0, y: 0 }); }
    else resetZoom();
  };

  const goToPage = (page: number) => {
    swiperRef.current?.slideTo(page - 1);
  };

  const getPages = (current: number, total: number, size = 6) => {
    if (total <= size) return Array.from({ length: total }, (_, i) => i + 1);
    let start = Math.max(1, current - Math.floor(size / 2));
    let end   = start + size - 1;
    if (end > total) { end = total; start = end - size + 1; }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>બુદ્ધિપ્રકાશ લોડ કરી રહ્યા છીએ...</p>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !item) {
    return (
      <div className="epaperDetailMain">
        <div className="container text-center p-5">
          <h2 className="custom-gujrati-font">બુદ્ધિપ્રકાશ ઉપલબ્ધ નથી</h2>
          <button
            onClick={() => router.push('/buddhiprakash')}
            style={{ background: '#850e00', color: '#fff', padding: '10px 25px', border: 'none', borderRadius: 5, marginTop: 20 }}
          >
            પાછા જાઓ
          </button>
        </div>
      </div>
    );
  }

  const images = item.Story_data ?? [];
  const title  = item.title || item.etitle || 'બુદ્ધિપ્રકાશ';

  /* ── Render ── */
  return (
    <>
      <div className="epaperDetailMain">
        <div className="epapperPageDetailFlex">
          <div className="epapperPageDetail">

            {/* Header */}
            <div className="epaperDTop epaperdetailpg">
              <div className="epaper-controls-left">
                <Link href="/buddhiprakash" className="epaperbackbtn">
                  <i className="fa-solid fa-angle-left" />
                </Link>
              </div>

              <div className="epaper-controls-center">
                <span className="custom-gujrati-font" style={{ fontWeight: 700, fontSize: 15, color: '#222' }}>
                  {title}
                </span>
              </div>

              <div className="epaper-controls-right">
                <div className="zoom-controls">
                  <button onClick={zoomOut}  disabled={zoomLevel <= 0.5}>−</button>
                  <span>{Math.round(zoomLevel * 100)}%</span>
                  <button onClick={zoomIn}   disabled={zoomLevel >= 3}>+</button>
                  {zoomLevel !== 1 && <button onClick={resetZoom}>Reset</button>}
                </div>
              </div>
            </div>

            {/* Image slider */}
            <div className="epapperDetailImageBox">
              {images.length > 0 ? (
                <Swiper
                  modules={[Navigation, Pagination, Keyboard]}
                  slidesPerView={1}
                  navigation
                  pagination={{ clickable: true }}
                  keyboard={{ enabled: true }}
                  speed={300}
                  allowTouchMove={zoomLevel === 1}
                  preventClicks={false}
                  preventClicksPropagation={false}
                  onSwiper={s => (swiperRef.current = s)}
                  onSlideChange={s => { setCurrentPage(s.activeIndex + 1); resetZoom(); }}
                  className="epaper-swiper"
                >
                  {images.map((img, i) => (
                    <SwiperSlide key={i}>
                      <div
                        className="epaper-image-container"
                        onClick={handleImageClick}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={stopDrag}
                        onMouseLeave={stopDrag}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={stopDrag}
                        style={{ touchAction: zoomLevel > 1 ? 'none' : 'auto' }}
                      >
                        <img
                          src={img}
                          alt={`${title} - Page ${i + 1}`}
                          className="epaper-detail-image"
                          style={{ transform: `scale(${zoomLevel}) translate(${imagePosition.x}px, ${imagePosition.y}px)` }}
                          draggable={false}
                          onError={e => { (e.target as HTMLImageElement).src = '/images/news-default.png'; }}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                  <p className="custom-gujrati-font">કોઈ છબી ઉપલબ્ધ નથી</p>
                </div>
              )}

              {/* Footer pagination */}
              {images.length > 1 && (
                <div className="epaper-footer-pagination">
                  <button className="page-num" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>{'<<'}</button>
                  {getPages(currentPage, images.length).map(p => (
                    <button key={p} className={`page-num ${p === currentPage ? 'active' : ''}`} onClick={() => goToPage(p)}>{p}</button>
                  ))}
                  <button className="page-num" disabled={currentPage === images.length} onClick={() => goToPage(currentPage + 1)}>{'>>'}</button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <style>{`
        .zoom-controls { display:flex; align-items:center; gap:4px; }
        .zoom-controls button { background:#850e00; color:#fff; border:1px solid #850e00; padding:4px 10px; font-size:13px; border-radius:4px; cursor:pointer; }
        .zoom-controls button:disabled { background:#e0e0e0; border-color:#ccc; color:#999; cursor:not-allowed; }
        .zoom-controls span { margin:0 5px; font-weight:600; color:#333; font-size:13px; }
        .epaper-image-container { display:flex; justify-content:center; align-items:center; overflow:hidden; min-height:calc(100vh - 220px); background:#fff; cursor:zoom-in; }
        .epaper-image-container:active { cursor:grabbing; }
        .epaper-detail-image { max-width:100%; max-height:100%; user-select:none; transition:transform 0.15s ease; }
        .epaper-swiper, .swiper-slide { width:100% !important; height:100%; }
        .epapperDetailImageBox .swiper-button-prev { left:calc(50% - 34.8%); }
        .epapperDetailImageBox .swiper-button-next { right:calc(50% - 34%); }
        .swiper-button-next, .swiper-button-prev { width:40px !important; height:40px !important; top:calc(100vh - 47%); z-index:10; position:fixed; background-image:none !important; }
        .epaper-swiper .swiper-button-next, .epaper-swiper .swiper-button-prev { color:#fff !important; background:#850e00; }
        .epaper-footer-pagination { position:sticky; bottom:0; z-index:1000; display:flex; justify-content:center; gap:6px; border-top:1px solid #eee; text-align:center; padding:10px 0; font-size:14px; font-weight:600; color:#333; background:#FFF5D2; }
        .page-num { border:1px solid #d7ae1e; background:transparent; padding:5px 9px; font-size:13px; cursor:pointer; border-radius:3px; }
        .page-num:hover { color:#fff !important; background-color:#850e00; border-color:#850e00; }
        .page-num.active { background:#850e00; color:#fff; border-color:#850e00; }
        .swiper-button-prev:after, .swiper-button-next:after { font-size:20px; font-weight:bold; }
        .epaper-swiper .swiper-pagination-bullet { background:#ccc; opacity:1; }
        .epaper-swiper .swiper-pagination-bullet-active { background:#850e00; }
        @media (max-width:767px) {
          .epaper-image-container { min-height:auto; }
          .epaper-detail-image { max-width:100%; height:auto; touch-action:pan-x pan-y; }
          .epapperDetailImageBox .swiper-button-next { right:5px; }
          .epapperDetailImageBox .swiper-button-prev { left:5px; }
        }
      `}</style>
    </>
  );
}
