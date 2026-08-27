'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { API_ENDPOINTS } from '@/constants/api';

interface TrendingItem {
  en: string;
  gu: string;
  slug: string;
}

export default function TrendingBar() {
  const [items, setItems] = useState<TrendingItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);

  // ── Fetch trending from CATEGORY_SETTING_WITH_PLAN ──────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch(API_ENDPOINTS.CATEGORY_SETTING_WITH_PLAN, {
          method:  'POST',
          cache:   'no-store',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ user_id: 0 }),
        });
        if (!res.ok) return;
        const data = await res.json();
        const raw = data?.setting?.trending;
        if (raw) {
          const parsed: TrendingItem[] = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (Array.isArray(parsed)) setItems(parsed);
        }
      } catch { /* silently fail */ }
    };
    load();
  }, []);

  // ── Check scroll state ───────────────────────────────────────────────────
  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    setCanScrollLeft(el.scrollLeft > 2);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [items, checkScroll]);

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  if (items.length === 0) return null;

  return (
    <div className="trb-wrap">
      {/* Label */}
      <span className="trb-label custom-gujrati-font">ટ્રેન્ડિંગ</span>

      {/* Left arrow — only when scrolled right */}
      {canScrollLeft && (
        <button className="trb-arrow" onClick={scrollLeft} aria-label="Scroll left">
          <i className="fa fa-angle-left" />
        </button>
      )}

      {/* Scrollable pills */}
      <div
        className="trb-scroll"
        ref={scrollRef}
        onScroll={checkScroll}
      >
        {items.map((item, idx) => (
          <Link
            key={item.slug || idx}
            href={`/tag/${(item.slug || '').replace(/\s+/g, '-')}`}
            className="trb-pill custom-gujrati-font"
          >
            {item.gu || item.en}
          </Link>
        ))}
      </div>

      {/* Right arrow — when more content to scroll */}
      {canScrollRight && (
        <button className="trb-arrow" onClick={scrollRight} aria-label="Scroll right">
          <i className="fa fa-angle-right" />
        </button>
      )}
    </div>
  );
}
