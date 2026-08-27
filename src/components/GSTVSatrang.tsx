'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { fetchSatrangCategory, SatrangAuthor } from '@/services/newsApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import '@/styles/WebStories.css';

export default function GSTVSatrang() {
  const [satrangCategories, setSatrangCategories] = useState<SatrangAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(6);
  const [itemWidth, setItemWidth] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  const sliderRef = useRef<HTMLDivElement>(null);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);

  /* FETCH */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchSatrangCategory();
        setSatrangCategories(data.categorychildQuery || []);
      } catch (e) {
        setError('Failed to fetch GSTV Satrang categories');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* RESPONSIVE */
  useEffect(() => {
    const calc = () => {
      if (!sliderRef.current) return;

      const w = window.innerWidth;
      let items = 5;
      if (w < 768) items = 3;

      setItemsPerView(items);

      const cw = sliderRef.current.parentElement?.offsetWidth || 0;
      setItemWidth(cw / items);
    };

    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [satrangCategories.length]);

  /* AUTO ROTATE */
  useEffect(() => {
    if (!isAutoRotating || satrangCategories.length <= itemsPerView) return;

    autoRotateRef.current = setInterval(() => {
      setCurrentSlide(p =>
        p >= satrangCategories.length - itemsPerView ? 0 : p + 1
      );
    }, 5000);

    return () => {
      if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    };
  }, [isAutoRotating, satrangCategories.length, itemsPerView]);

  /* BUTTONS */
  const nextSlide = () =>
    setCurrentSlide(p =>
      p >= satrangCategories.length - itemsPerView ? 0 : p + 1
    );

  const prevSlide = () =>
    setCurrentSlide(p => Math.max(p - 1, 0));

  /* =============================
      MOBILE TOUCH SCROLL
  ============================== */
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let startX = 0;
    let deltaX = 0;

    const touchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      deltaX = 0;
      setIsAutoRotating(false);
    };

    const touchMove = (e: TouchEvent) => {
      deltaX = e.touches[0].clientX - startX;
    };

    const touchEnd = () => {
      const threshold = itemWidth / 4;

      if (Math.abs(deltaX) > threshold) {
        if (deltaX < 0) nextSlide();
        else prevSlide();
      }

      setTimeout(() => setIsAutoRotating(true), 1500);
    };

    slider.addEventListener('touchstart', touchStart, { passive: true });
    slider.addEventListener('touchmove', touchMove, { passive: true });
    slider.addEventListener('touchend', touchEnd);

    return () => {
      slider.removeEventListener('touchstart', touchStart);
      slider.removeEventListener('touchmove', touchMove);
      slider.removeEventListener('touchend', touchEnd);
    };
  }, [itemWidth, satrangCategories.length, itemsPerView]);

  if (loading)
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <LoadingSpinner message="GSTV શતરંગ લોડ થઈ રહ્યું છે..." />
      </div>
    );

  if (error)
    return <ErrorMessage error={error} onRetry={() => location.reload()} />;

  return (
    <div className="web-stories-section" style={{ marginTop: 20 }}>
      <div className="storySectionNav">
        <div className="storySectionNav-left">
          <Link href="/category/gstv-satrang">
            <img src="/assets/icons/e-paper-1.svg" />
            <span>GSTV શતરંગ</span>
          </Link>
        </div>

        <div className="storySectionNav-right">
          <Link href="/category/gstv-satrang" className="custom-link-btn">
            વધુ વાંચો <i className="fas fa-chevron-right"></i>
          </Link>
        </div>
      </div>

      <div className="custom-carousel clearfix">
        <div className="MultiCarousel">
          <div
            ref={sliderRef}
            className="MultiCarousel-inner topwebstory"
            style={{
              transform: `translateX(-${currentSlide * itemWidth}px)`,
              transition: 'transform .3s ease',
              display: 'flex',
              width: itemWidth * satrangCategories.length
            }}
          >
            {satrangCategories.map(cat => (
              <div key={cat.id} style={{ width: itemWidth, flex: 'none' }}>
                <Link href={`/category/gstv-satrang/${cat.slug}`}>
                  <div className="card custom-card">
                    <div className="img-wrappers videonewscls">
                      <img
                        src={cat.icon || '/assets/images/video-default.png'}
                        className="video-thumbnail-img"
                      />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <button className="btn btn-primary leftLst" onClick={prevSlide}>
            <i className="fa fa-chevron-left" />
          </button>

          <button className="btn btn-primary rightLst" onClick={nextSlide}>
            <i className="fa fa-chevron-right" />
          </button>
        </div>
      </div>
    </div>
  );
}
