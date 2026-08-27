'use client';

import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/constants/api';
import Link from 'next/link';
import './BreakingNews.css';

interface BreakingNewsItem {
  id: number;
  title: string;
  slug: string;
  category_slugs?: string;
  created_at?: string;
  url?: string;
}

interface BreakingNewsResponse {
  breakingnews: BreakingNewsItem[];
  newsflash: string;
}

const BreakingNews: React.FC = () => {
  const [items, setItems] = useState<BreakingNewsItem[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [loading, setLoading] = useState(true);

  // ── Fetch ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const fetch_ = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.BREAKING_NEWS, {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: BreakingNewsResponse = await res.json();

        let list: BreakingNewsItem[] = [];
        if (Array.isArray(data.breakingnews) && data.breakingnews.length > 0) {
          list = data.breakingnews.filter(n => n?.title);
        } else if (data.newsflash?.trim()) {
          list = data.newsflash.split('•••')
            .map((t, i) => ({ id: i, title: t.trim(), slug: '' }))
            .filter(n => n.title);
        }
        if (!cancelled) setItems(list);
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch_();
    return () => { cancelled = true; };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => setIsVisible(false), 400);
  };

  if (loading || !isVisible || items.length === 0) return null;

  return (
    <div className={`bn-marquee-wrap${isClosing ? ' bn-closing' : ''}`}>
      {/* Left label */}
      <span className="bn-marquee-label custom-gujrati-font">
        બ્રેકિંગ ન્યૂઝ
        <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff" style={{ marginLeft: 4, flexShrink: 0 }}>
          <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
        </svg>
      </span>

      {/* Divider */}
      <span className="bn-marquee-divider" />

      {/* Marquee Container */}
      <div className="bn-marquee-container">
        <div className="bn-marquee-content">
          {/* Display all items with separator symbols */}
          {items.map((item) => {
            const catSlug = item.category_slugs?.split(',')[0]?.toLowerCase() || 'gujarat';
            const href = item.slug
              ? `/news/${catSlug}/${item.slug}`
              : (item.url || '#');

            return (
              <React.Fragment key={item.id}>
                <Link href={href} className="bn-marquee-title custom-gujrati-font">
                  {item.title}
                </Link>
                {/* Separator after every item including last */}
                <span className="bn-marquee-separator">
                  <i className="fa-solid fa-bolt"></i>
                </span>
              </React.Fragment>
            );
          })}

          {/* Clone items for continuous loop */}
          {items.map((item) => {
            const catSlug = item.category_slugs?.split(',')[0]?.toLowerCase() || 'gujarat';
            const href = item.slug
              ? `/news/${catSlug}/${item.slug}`
              : (item.url || '#');

            return (
              <React.Fragment key={`clone-${item.id}`}>
                <Link href={href} className="bn-marquee-title custom-gujrati-font">
                  {item.title}
                </Link>
                {/* Separator after every item including last */}
                <span className="bn-marquee-separator">
                  <i className="fa-solid fa-bolt"></i>
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Close button */}
      <button className="bn-marquee-close" onClick={handleClose} aria-label="Close">✕</button>
    </div>
  );
};

export default BreakingNews;
