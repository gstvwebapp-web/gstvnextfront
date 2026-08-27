'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_ENDPOINTS } from '@/constants/api';

interface TopMenuItem {
  title: string;
  category_name_guj: string;
  icon: string;
  slug: string;
}

 
function resolveHref(item: TopMenuItem): string {
  return `/category/${item.slug}`;
}

export default function TopMenuBar() {
  const [items, setItems] = useState<TopMenuItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch(API_ENDPOINTS.GET_STATIC_MENU_HOME_PAGE, {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data = await res.json();
        const topMenu = data?.data?.[0]?.top_menu;
        if (Array.isArray(topMenu) && topMenu.length > 0) {
          setItems(topMenu);
        }
      } catch {
        // keep fallback
      }
    };
    load();
  }, []);

  return (
    <div className="tmb-wrap">
      <div className="tmb-scroll">
        {items.map((item, idx) => (
          <Link
            key={item.slug || idx}
            href={resolveHref(item)}
            className="tmb-card"
          >
            <div className="tmb-icon-box">
              <img
                src={item.icon}
                alt={item.category_name_guj}
                className="tmb-icon"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <span className="tmb-title custom-gujrati-font">{item.category_name_guj}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
