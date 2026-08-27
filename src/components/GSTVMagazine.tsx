'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo
} from 'react';
import Link from 'next/link';
import {
  fetchMagazineCategories,
  MagazineCategory,
  filterMagazinesByType
} from '@/services/magazineApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import '@/styles/GSTVMagazine.css';

export default function GSTVMagazine() {

  const [magazines, setMagazines] = useState<MagazineCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(6);
  const [itemWidth, setItemWidth] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  const sliderRef = useRef<HTMLDivElement>(null);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);
  const resizeRAF = useRef<number | null>(null);

  // ✅ TOUCH REFS (ADDED)
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Mouse drag refs
  const mouseStartX = useRef(0);
  const mouseEndX = useRef(0);
  const isDragging = useRef(false);
  const dragStartSlide = useRef(0);

  const loadMagazines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchMagazineCategories();

      const list =
        data?.epapercat && Array.isArray(data.epapercat)
          ? filterMagazinesByType(data.epapercat, 'Magazine')
          : [];

      setMagazines(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch magazines');
      setMagazines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMagazines();
  }, [loadMagazines]);

  const retryFetch = () => {
    loadMagazines();
  };

  const updateItemsPerView = useCallback(() => {
    const w = window.innerWidth;

    let incno = 6;
    if (w < 768) incno = 3;
    else if (w < 992) incno = 3;
    else if (w < 1200) incno = 5;

    setItemsPerView(incno);
  }, []);

  useEffect(() => {
    updateItemsPerView();

    const onResize = () => {
      if (resizeRAF.current) cancelAnimationFrame(resizeRAF.current);
      resizeRAF.current = requestAnimationFrame(updateItemsPerView);
    };

    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      if (resizeRAF.current) cancelAnimationFrame(resizeRAF.current);
      window.removeEventListener('resize', onResize);
    };
  }, [updateItemsPerView]);

  useEffect(() => {
    if (!sliderRef.current || !magazines.length) return;

    const containerWidth =
      sliderRef.current.parentElement?.offsetWidth || 0;

    setItemWidth(containerWidth / itemsPerView);
  }, [itemsPerView, magazines.length]);

  const maxSlides = useMemo(
    () => Math.max(0, magazines.length - itemsPerView),
    [magazines.length, itemsPerView]
  );

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => Math.min(prev + 1, maxSlides));
  }, [maxSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  }, [maxSlides]);

  // ✅ TOUCH HANDLERS (ADDED)
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsAutoRotating(false);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextSlide() : prevSlide();
    }
  };

  /* =========================
     Mouse Drag (Desktop Touch-like)
  ========================= */
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = false;
    mouseStartX.current = e.clientX;
    mouseEndX.current = e.clientX;
    dragStartSlide.current = currentSlide;
    setIsAutoRotating(false);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseStartX.current === 0) return;
    
    const diff = Math.abs(e.clientX - mouseStartX.current);
    if (diff > 5) {
      isDragging.current = true;
    }
    
    if (!isDragging.current) return;
    
    mouseEndX.current = e.clientX;
    const dragDiff = mouseStartX.current - mouseEndX.current;
    const slidesMoved = Math.round(dragDiff / (itemWidth || 1));
    const newSlide = Math.max(0, Math.min(maxSlides, dragStartSlide.current + slidesMoved));
    
    setCurrentSlide(newSlide);
  };

  const handleMouseUp = () => {
    mouseStartX.current = 0;
    setTimeout(() => {
      isDragging.current = false;
    }, 50);
  };

  const handleMouseLeave = () => {
    if (isDragging.current) {
      isDragging.current = false;
    }
    mouseStartX.current = 0;
  };

  useEffect(() => {
    if (!isAutoRotating || magazines.length <= itemsPerView) return;

    autoRotateRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev >= maxSlides ? 0 : prev + 1));
    }, 5000);
    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
        autoRotateRef.current = null;
      }
    };
  }, [isAutoRotating, magazines.length, itemsPerView, maxSlides]);

  useEffect(() => {
    setCurrentSlide(0);
  }, [magazines.length]);

  if (loading) {
    return (
      <div className="carousel-inner-top custom-carousel clearfix">
        <div style={{ padding: 40, textAlign: 'center' }}>
          <LoadingSpinner
            message="GSTV મેગેઝિન લોડ થઈ રહ્યા છે..."
            size="large"
            type="dots"
            color="#850E00"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="carousel-inner-top custom-carousel clearfix">
        <div className="section-header">
          <h2 className="section-title">GSTV મેગેઝિન</h2>
        </div>
        <ErrorMessage error={error} onRetry={retryFetch} />
      </div>
    );
  }

  if (!magazines.length) {
    return (
      <div className="carousel-inner-top custom-carousel clearfix">
        <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
          <p>No magazines available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="web-stories-section">
      <div className="storySectionNav" style={{ marginTop: 20 }}>
        <div className="storySectionNav-left">
          <Link href="/magazine">
            <img src="/assets/icons/e-paper-1.svg" alt="GSTV Magazine" />
            <span>GSTV મેગેઝિન</span>
          </Link>
        </div>
        <div className="storySectionNav-right">
          <Link href="/magazine" className="custom-link-btn ws-more-link">
            વધુ વાંચો &nbsp;<span className="ws-more-btn"><i className="fas fa-chevron-right"></i></span>
          </Link>
        </div>
      </div>

      <div className="custom-carousel clearfix">
        <div
          className="MultiCarousel"
          data-items="1,3,5,6"
          data-slide="1"
          data-interval="1000"
          onMouseEnter={() => setIsAutoRotating(false)}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
        >
          {/* ws-clip-wrap clips sliding cards; arrows are siblings so they overflow freely */}
          <div className="ws-clip-wrap">
            <div
              className="MultiCarousel-inner topwebstory"
              ref={sliderRef}
              style={{
                transform: `translateX(-${currentSlide * itemWidth}px)`,
                transition: 'transform 0.3s ease',
                display: 'flex',
                width: itemWidth * magazines.length
              }}
            >
              {magazines.map(magazine => (
                <div
                  key={magazine.id}
                  style={{ width: itemWidth, flex: 'none' }}
                >
                  <Link
                    href={`/magazine/${magazine.slug}`}
                    onClick={(e) => { if (isDragging.current) e.preventDefault(); }}
                  >
                    <div className="card1 custom-card1">
                      <div className="img-wrappers custom-webstory-image magazine-image custom-epaper-cat">
                        <img
                          src={magazine.featureImage}
                          className="video-thumbnail-img"
                          alt={magazine.title}
                          onError={e =>
                            (e.currentTarget.src = magazine.icon || '/images/magazine-default.png')
                          }
                        />
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>{/* end ws-clip-wrap */}

          {/* Left arrow — disabled = non-interactive span, enabled = button */}
          {currentSlide === 0 ? (
            <span
              className="btn btn-primary leftLst over disabled-arrow"
              aria-hidden="true"
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
              onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
              onMouseUp={(e) => { e.stopPropagation(); e.preventDefault(); }}
            >
              <i className="fa fa-chevron-left"></i>
            </span>
          ) : (
            <button
              className="btn btn-primary leftLst"
              type="button"
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); prevSlide(); }}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label="Previous"
            >
              <i className="fa fa-chevron-left"></i>
            </button>
          )}

          {/* Right arrow — disabled = non-interactive span, enabled = button */}
          {currentSlide >= maxSlides ? (
            <span
              className="btn btn-primary rightLst over disabled-arrow"
              aria-hidden="true"
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
              onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
              onMouseUp={(e) => { e.stopPropagation(); e.preventDefault(); }}
            >
              <i className="fa fa-chevron-right"></i>
            </span>
          ) : (
            <button
              className="btn btn-primary rightLst"
              type="button"
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); nextSlide(); }}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label="Next"
            >
              <i className="fa fa-chevron-right"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
