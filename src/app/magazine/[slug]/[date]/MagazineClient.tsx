'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Head from 'next/head';

import '@/styles/profile.css';
import '@/styles/styles.css';
import '@/styles/styles_new.css';

import {
  fetchMagazineDetail,
  MagazineItem,
  MagazineDetailResponse
} from '@/services/magazineApi';

import LoadingSpinner from '@/components/LoadingSpinner';
import { COMMON_CLASSES } from '@/utils/uiUtils';

/* Swiper */
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Link from 'next/link';
import LockScreen from '@/components/LockScreen';
import { useAuth } from '@/contexts/AuthContext';
import { useContentLock } from '@/hooks/useContentLock';

const MagazineDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();

  const [magazine, setMagazine] = useState<MagazineItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [magazinlist, setMagazinlist] = useState<Array<{ title?: string; slug?: string; ecatslug?: string; engtitle?: string }>>([]);
  /* zoom & drag */
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  /* footer pagination */
  const [currentPage, setCurrentPage] = useState(1);

  const swiperRef = useRef<any>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const slug = (params as any)?.slug || '';
  const date = (params as any)?.date || '';

 
  const { getUserId } = useAuth();
  const userId = Number(getUserId() || 0);
  const { isLocked: contentLocked, loading: lockLoading } = useContentLock(userId);
  const pageLocked = currentPage > 1 && contentLocked;

  useEffect(() => {
    if (slug && date) loadMagazineDetail(slug, date);
  }, [slug, date]);

  const loadMagazineDetail = async (slugVal: string, dateVal: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const res: MagazineDetailResponse = await fetchMagazineDetail(slugVal, dateVal);

      if (!res?.magazine) {
        setError('Magazine not found');
      } else {
        setMagazine(res.magazine);
         setMagazinlist(res.magazinlist || []);
        setCurrentPage(1);
      }
    } catch {
      setError('Failed to load magazine');
    } finally {
      setLoading(false);
    }
  };
  const handleSlugChange = (newSlug: string) => { if (newSlug && newSlug !== slug) router.push(`/magazine/${newSlug}`); };
  /* zoom controls */
  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.2, 0.5));
  const resetZoom = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  /* click zoom toggle */
  const handleImageClick = () => {
    if (zoomLevel === 1) {
      setZoomLevel(2);
      setImagePosition({ x: 0, y: 0 });
    } else {
      resetZoom();
    }
  };

  /* drag handlers */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const stopDrag = () => setIsDragging(false);

  /* touch handlers */
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel > 1 && e.touches.length === 1) {
      const t = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: t.clientX - imagePosition.x,
        y: t.clientY - imagePosition.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && zoomLevel > 1 && e.touches.length === 1) {
      e.preventDefault();
      const t = e.touches[0];
      setImagePosition({
        x: t.clientX - dragStart.x,
        y: t.clientY - dragStart.y
      });
    }
  };

  const goToPage = (page: number) => {
  if (page === 1) {
    setCurrentPage(1);
    swiperRef.current?.slideTo(0);
    return;
  }

  if (pageLocked) return;

  swiperRef.current?.slideTo(page - 1);
};
  // const goToPage = (page: number) => {
  //   if (!swiperRef.current) return;
  //   swiperRef.current.slideTo(page - 1);
  // };

  const getPages = (current: number, total: number, size = 6) => {
    if (total <= size) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    let start = Math.max(1, current - Math.floor(size / 2));
    let end = start + size - 1;

    if (end > total) {
      end = total;
      start = end - size + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  /* ===================== STATES ===================== */

  if (loading) {
    return (
      <div className="container-fluid epaper-detail-container">
        <div className={COMMON_CLASSES.LOADING_CONTAINER}>
          <LoadingSpinner
            message="મેગેઝિન લોડ કરી રહ્યા છીએ..."
            size="large"
            color="#850E00"
          />
        </div>
      </div>
    );
  }

  if (error || !magazine) {
    return (
      <div className="epaperDetailMain">
        <div className="container text-center p-5">
          <h2 className="custom-gujrati-font" style={{ textAlign:'center'}}>
            આ તારીખ માટે મેગેઝિન ઉપલબ્ધ નથી
          </h2>
          <button
            onClick={() => router.push('/magazine')}
            style={{
              background: '#850e00',
              color: '#fff',
              padding: '10px 25px',
              border: 'none',
              borderRadius: '5px',
              marginTop: 20
            }}
          >
            પાછા જાઓ
          </button>
        </div>
      </div>
    );
  }

  /* ===================== RENDER ===================== */

  return (
    <>
      <Head>
        <title>{magazine.etitle || magazine.title} | GSTV</title>
      </Head>

      <div className="epaperDetailMain">
        <div className="epapperPageDetailFlex">
          <div className="epapperPageDetail">

            {/* HEADER */}
            <div className="epaperDTop epaperdetailpg">
              <div className="epaper-controls-left">
                <Link href="/magazine" className="epaperbackbtn">
                  <i className="fa-solid fa-angle-left"></i>
                </Link>
                <select value={slug} onChange={(e)=>handleSlugChange(e.target.value)} className="city-selector">
              {magazinlist?.length ? (
                magazinlist.map((m:any, idx:number)=>{
                  const s = m?.ecatslug || m?.slug; const t = m?.title || m?.engtitle || s;
                  return <option key={`${s}-${idx}`} value={s}>{t}</option>;
                })
              ) : (
                <option value={slug}>{slug.charAt(0).toUpperCase()+slug.slice(1)}</option>
              )}
            </select>
              </div>

              <div className="epaper-controls-center">
                <div className="zoom-controls">
                  <span>ઝૂમ:</span>
                  <button onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>-</button>
                  <span>{Math.round(zoomLevel * 100)}%</span>
                  <button onClick={handleZoomIn} disabled={zoomLevel >= 3}>+</button>
                  {zoomLevel !== 1 && (
                    <button onClick={resetZoom}>રીસેટ</button>
                  )}
                </div>
              </div>

              <div className="epaper-controls-right">
                <input
                  type="date"
                  value={date.split('-').reverse().join('-')}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) =>
                    router.push(`/magazine/${slug}/${e.target.value.split('-').reverse().join('-')}`)
                  }
                  className="date-picker"
                />
              </div>
            </div>

            {/* IMAGE SLIDER */}
            <div className="epapperDetailImageBox">
               {pageLocked ? (
                <LockScreen userId={userId} />
                ) : (
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
                onSwiper={(s) => (swiperRef.current = s)}
                onSlideChange={(swiper) => {
                  setCurrentPage(swiper.activeIndex + 1);
                  resetZoom();
                }}
                className="epaper-swiper"
              >
                {magazine.Story_data.map((img, i) => (
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
                        ref={imageRef}
                        src={img}
                        alt={`Page ${i + 1}`}
                        className="epaper-detail-image"
                        style={{
                          transform: `scale(${zoomLevel}) translate(${imagePosition.x}px, ${imagePosition.y}px)`
                        }}
                        draggable={false}
                      />
                      
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
             )}
              {/* FOOTER PAGINATION */}
              <div className="epaper-footer-pagination">
                <button
                  className="page-num"
                  disabled={currentPage === 1}
                  onClick={() => goToPage(currentPage - 1)}
                >
                   {"<<"}
                </button>

                {getPages(currentPage, magazine.Story_data.length).map(p => (
                  // <button
                  //   key={p}
                  //   className={`page-num ${p === currentPage ? 'active' : ''}`}
                  //   onClick={() => goToPage(p)}
                  // >
                  //   {p}
                  // </button>
                  <button
                    key={p}
                    className={`page-num ${p === currentPage ? 'active' : ''}`}
                    disabled={Boolean(pageLocked && p > 1)}
                    onClick={() => goToPage(p)}
                    style={{
                      opacity: pageLocked && p > 1 ? 0.4 : 1,
                      cursor: pageLocked && p > 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {p}
                  </button>
                ))}

                <button
                  className="page-num"
                  disabled={currentPage === magazine.Story_data.length}
                  onClick={() => goToPage(currentPage + 1)}
                >
                   {">>"}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

  <style>{`
    /* Swiper container */

    .zoom-controls button {
  background: #850e00;
  color: #ffffff;
  border: 1px solid #850e00;
  padding: 4px 10px;
  margin: 0 3px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.epaper-image-container {
  cursor: zoom-in;
}

.epaper-image-container:active {
  cursor: grabbing;
}
/* Hover effect */
.zoom-controls button:hover:not(:disabled) {
  background: #6d0b00;
  border-color: #6d0b00;
}

/* Disabled state */
.zoom-controls button:disabled {
  background: #e0e0e0;
  border-color: #ccc;
  color: #999;
  cursor: not-allowed;
}

/* Zoom percentage text spacing */
.zoom-controls span {
  margin: 0 6px;
  font-weight: 600;
  color: #333;
}

    .epaper-swiper, .swiper-slide {
      width: 100% !important;
      height: 100%;
    }
      .epapperDetailImageBox .swiper-button-prev  {
    left: calc(50% - 34.8%);
}
    .epapperDetailImageBox .swiper-button-next {
    right: calc(50% - 34%);
}
      .swiper-button-next, .swiper-button-prev { 
          width: 40px !important;
    height: 40px !important;
    top: calc(100vh - 47%);
    z-index: 10;
    position: fixed;
      background-image:none !important; }
    .epaper-swiper .swiper-button-next, .epaper-swiper .swiper-button-prev {
    color: #fff !important;
    background: #850e00;
    }
    .epaperDTop {
  position: sticky;
  top: 0;
  z-index: 1000;
}

/* Sticky footer pagination */
.epaper-footer-pagination {
  position: sticky;
  bottom: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  gap: 6px;
  border-top: 1px solid #eee;
}

/* Pagination numbers */
.page-num {
      border: 1px solid #d7ae1e;
  background: transparent;
  padding: 5px 9px;
  font-size: 13px;
  cursor: pointer;
  border-radius: 3px;
}
.page-num:hover {
    color: #fff !important;
    background-color: #850e00;
    border-color: #850e00;
}

.page-num.active {
  background: #850e00;
  color: #fff;
  border-color: #850e00;
}
    .swiper-button-prev:after, .swiper-button-next:after {
      font-size: 20px;
      font-weight: bold;
    }
    /* Center image properly */
    .epaper-image-container {
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      min-height: calc(100vh - 220px);
      background: #fff;
      border-radius: 0px;
      box-shadow: none;
    }

    /* Image behavior */
    .epaper-detail-image {
      max-width: 100%;
      max-height: 100%;
      user-select: none;
      transition: transform 0.15s ease;
    }

    /* Swiper arrows (keep UI same, just color fix) */
    .epaper-swiper .swiper-button-next,
    .epaper-swiper .swiper-button-prev {
      color: #850e00;
    }

    /* Swiper dots */
    .epaper-swiper .swiper-pagination-bullet {
      background: #ccc;
      opacity: 1;
    }

    .epaper-swiper .swiper-pagination-bullet-active {
      background: #850e00;
    }

    /* Footer pagination */
    .epaper-footer-pagination {
      text-align: center;
      padding: 10px 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
      background: #FFF5D2;
      bottom: -3px;
    }
      @media (max-width: 767px) {
      .epaper-image-container {
    min-height: auto;
  }
  .epaper-detail-image {
    max-width: 100%;
    height: auto;
    touch-action: pan-x pan-y;
  }
    .epapperDetailImageBox .swiper-button-next {
    right: 5px;
}
    .epapperDetailImageBox .swiper-button-prev {
    left: 5px;
}
}
  `}</style>
    </>
  );
};

export default MagazineDetailPage;
