'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import '@/styles/WebStories.css';
import { API_ENDPOINTS } from '@/constants/api';

interface SatrangCategory {
  id: number;
  title: string;
  slug: string;
  icon: string;
  latest_news_date: string;
}

export default function GSTVSatrangBox() {
  const [categories, setCategories] = useState<SatrangCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(5);
  const [itemWidth, setItemWidth] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  const sliderRef = useRef<HTMLDivElement>(null);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);

  // Mouse drag refs
  const mouseStartX = useRef(0);
  const mouseEndX = useRef(0);
  const isDragging = useRef(false);
  const dragStartSlide = useRef(0);

  /* ================= Fetch API (optimized) ================= */
  useEffect(() => {
    const controller = new AbortController();

    const fetchSatrang = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(API_ENDPOINTS.GSTV_SATRANG_NEWSDATA, {
          signal: controller.signal,
          cache: 'no-store',
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        if (json?.satarangcat && Array.isArray(json.satarangcat)) {
          setCategories(json.satarangcat);
        } else {
          setCategories([]);
        }
      } catch (err) {
        if ((err as any).name !== 'AbortError') {
          setError(err instanceof Error ? err.message : 'Failed to load Satrang');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSatrang();

    return () => controller.abort();
  }, []);

  /* ================= Responsive items (optimized) ================= */
  useEffect(() => {
    let rafId: number;

    const updateItems = () => {
      rafId = requestAnimationFrame(() => {
        const w = window.innerWidth;
        let count = 5;

        if (w >= 1200) count = 2;
        else if (w >= 992) count = 2;
        else if (w >= 768) count = 3;
        else count = 3;

        setItemsPerView(count);
      });
    };

    updateItems();
    window.addEventListener('resize', updateItems);

    return () => {
      window.removeEventListener('resize', updateItems);
      cancelAnimationFrame(rafId);
    };
  }, []);

  /* ================= Item width (optimized) ================= */
  useEffect(() => {
    if (!sliderRef.current || !categories.length) return;

    const container = sliderRef.current.closest('.satrang-section');
    if (!container) return;

    setItemWidth(container.clientWidth / itemsPerView);
  }, [itemsPerView, categories.length]);

  /* ================= Auto rotate (safe & smooth) ================= */
  useEffect(() => {
    if (!isAutoRotating || categories.length <= itemsPerView) return;

    autoRotateRef.current = setInterval(() => {
      setCurrentSlide(prev => {
        const max = Math.max(0, categories.length - itemsPerView);
        return prev >= max ? 0 : prev + 1;
      });
    }, 5000);

    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
        autoRotateRef.current = null;
      }
    };
  }, [isAutoRotating, categories.length, itemsPerView]);

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
    const maxSlides = Math.max(0, categories.length - itemsPerView);
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

  const nextSlide = () => {
    const max = Math.max(0, categories.length - itemsPerView);
    setCurrentSlide(prev => (prev >= max ? 0 : prev + 1));
  };

  const prevSlide = () => {
    const max = Math.max(0, categories.length - itemsPerView);
    setCurrentSlide(prev => (prev <= 0 ? max : prev - 1));
  };

  const retryFetch = () => window.location.reload();

  /* ================= UI States (UNCHANGED) ================= */
  if (loading) {
    return (
      <div className="custom-carousel clearfix">
        <LoadingSpinner
          message="GSTV શતરંગ લોડ થઈ રહ્યું છે..."
          size="large"
          type="dots"
          color="#850E00"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="custom-carousel clearfix">
        <ErrorMessage error={error} onRetry={retryFetch} />
      </div>
    );
  }

  if (!categories.length) return null;

  /* ================= Render (UNCHANGED UI) ================= */
  return (
    <div className="satrang-section mb-4">
      <div className="storySectionNav blogs-head-bar first">
        <div className="storySectionNav-left">
          <span className="blog-category">GSTV શતરંગ</span>
        </div>
        <div className="storySectionNav-right rightstory">
          <Link href="/category/satrang" className="custom-link-btn">
            વધુ વાંચો <i className="fas fa-chevron-right"></i>
          </Link>
        </div>
      </div>

      <div
        className="custom-carousel clearfix"
        onMouseEnter={() => setIsAutoRotating(false)}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
      >
        <div className="MultiCarousel">
          <div
            className="MultiCarousel-inner"
            ref={sliderRef}
            style={{
              display: 'flex',
              transform: `translateX(-${currentSlide * itemWidth}px)`,
              transition: 'transform 0.3s ease',
              width: `${itemWidth * categories.length}px`
            }}
          >
            {categories.map(cat => (
              <div key={cat.id} style={{ width: itemWidth, flex: 'none' }}>
                <Link 
                  href={`/category/satrang/${cat.slug}`}
                  onClick={(e) => {
                    if (isDragging.current) {
                      e.preventDefault();
                    }
                  }}
                >
                  <div className="card custom-card text-center">
                    <div className="img-wrappers">
                      <img
                        src={cat.icon}
                        alt={cat.title}
                        className="video-thumbnail-img"
                        onError={(e) =>
                          ((e.target as HTMLImageElement).src =
                            '/images/gstv-logo-bg.png')
                        }
                      />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <button
            className={`btn btn-primary leftLst ${
              currentSlide === 0 ? 'over' : ''
            }`}
            onClick={prevSlide}
          >
            <i className="fa fa-chevron-left"></i>
          </button>

          <button
            className={`btn btn-primary rightLst ${
              currentSlide >= categories.length - itemsPerView ? 'over' : ''
            }`}
            onClick={nextSlide}
          >
            <i className="fa fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
