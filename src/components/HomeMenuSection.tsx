'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_ENDPOINTS, MEDIA_BASE_URL } from '@/constants/api';

interface MenuItem {
  title: string;
  eng_title?: string;
  description?: string;
  eng_description?: string;
  icon: string;
  icon_dark: string;
  slug: string;
  redirect_path: string;
  color_code?: string;
}

function getIconUrl(iconName: string): string {
  if (!iconName) return '';
  if (iconName.startsWith('http')) return iconName;
  return `${MEDIA_BASE_URL}/backend/public/uploads/category/icon/${iconName}`;
}

function resolveHref(item: MenuItem): string {
  if (item.slug === 'livetv' || item.slug === 'live-tv') {
    return '/livetv';
  }

  if (item.slug === 'rashifal' || item.slug === 'jyotish') {
    return '/rashifal';
  }

  return `/category/${item.slug}`;
}
const FALLBACK_MENU: MenuItem[] = [
  { title: 'લાઈવ TV',      description: 'સમાચાર અને વિડિઓઝ Live',      icon: 'live-tv-card.png',   icon_dark: '', slug: 'livetv',        redirect_path: 'livetv',        color_code: '#bd0c0c' },
  { title: 'વેબ સ્ટોરીઝ', description: 'ઇન્ટરેસ્ટિંગ સ્ટોરીઝ વાંચો',  icon: 'web-stories.png',   icon_dark: '', slug: 'web-stories',   redirect_path: 'web-stories',   color_code: '#d56008' },
  { title: 'ફોટો ગેલેરી', description: 'શાનદાર તસ્વીરો જુઓ',           icon: 'photo-gallery.png', icon_dark: '', slug: 'photo-gallery', redirect_path: 'photo-gallery', color_code: '#1a7a1a' },
  { title: 'ઓટો-ટેક',     description: 'નવી કાર અને ટેક વિષે',          icon: 'auto-tech.png',     icon_dark: '', slug: 'auto-tech',     redirect_path: 'auto-tech',     color_code: '#1565c0' },
  { title: 'જ્યોતિષ',     description: 'રાશિફળ અને ઉપાય',               icon: 'astrology.png',     icon_dark: '', slug: 'astrology',     redirect_path: 'astrology',     color_code: '#6a0dad' },
];

export default function HomeMenuSection() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(FALLBACK_MENU);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.GET_STATIC_MENU_HOME_PAGE, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const menu = data?.data?.[0]?.magazine_menu;
        if (Array.isArray(menu) && menu.length > 0) setMenuItems(menu);
      } catch { /* keep fallback */ }
    };
    load();
  }, []);

  if (menuItems.length === 0) return null;

  return (
    <>
      <div className="hms-wrap">
        {/* Desktop: horizontal row — Mobile: 2-col grid */}
        <div
          className="hms-grid"
          style={{ gridTemplateColumns: `repeat(${Math.min(menuItems.length, 5)}, 1fr)` }}
        >
          {menuItems.map((item, idx) => {
            const bg = item.color_code || '#850E00';
            const iconSrc = item.icon;

            return (
              <Link
                key={item.slug || idx}
                href={resolveHref(item)}
                className="hms-card custom-gujrati-font"
                 style={{
    background: `${item.color_code}`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 100%',
    backgroundPosition: 'center',
  }}
              >
                {/* Title */}
                <span className="hms-title">{item.title}</span>

                {/* Description */}
                {item.description && (
                  <span className="hms-desc">{item.description}</span>
                )}

                
              </Link>
            );
          })}
        </div>
      </div>
      <div style={{ clear: 'both' }} />

      <style>{`
        .hms-wrap {
          width: 100%;
          float: left;
          padding: 0px;
          margin-bottom: 12px;
        }

        /* ── Desktop: 5 equal columns in one row ── */
        .hms-grid {
          display: grid;
          gap: 8px;
        }

        /* ── Card ── */
        .hms-card {
          position: relative;
          border-radius: 10px;
          padding: 14px 12px 44px;
          min-height: 150px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          gap: 5px;
          text-decoration: none !important;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
        }

        .hms-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0,0,0,0.25);
        }

        .hms-title {
          color: #fff;
          font-size: 18px;
          font-weight: 700;
          line-height: 1.3;
          display: block;
          position: relative;
          z-index: 1;
          text-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .hms-desc {
          color: rgba(255,255,255,0.88);
          font-size: 16px;
          font-weight: 500;
          line-height: 1.4;
          position: relative;
          z-index: 1;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Icon — bottom right corner, semi-transparent white */
       
        /* ── Mobile: single horizontal scrollable row ── */
        @media (max-width: 767px) {
          .hms-wrap { padding: 0px; }

          .hms-grid {
            display: flex !important;
            flex-direction: row !important;
            grid-template-columns: unset !important;
            overflow-x: auto;
            overflow-y: visible;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            gap: 8px;
            flex-wrap: nowrap;
            padding-bottom: 4px;
          }

          .hms-grid::-webkit-scrollbar { display: none; }

          .hms-card {
            flex-shrink: 0;
            width: 150px;          /* fixed card width so next card peeks */
            min-height: 150px;
            padding: 14px 12px 50px;
          }

          .hms-title { font-size: 18px; }
          .hms-desc  { font-size: 16px; }
          .hms-icon  { width: 56px; height: 56px; bottom: 8px; right: 8px; }
        }
      `}</style>
    </>
  );
}
