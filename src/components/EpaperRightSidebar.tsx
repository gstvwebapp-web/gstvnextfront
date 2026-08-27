'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_ENDPOINTS } from '@/constants/api';

interface Item {
  first_image: string;
  url: string;
}

interface EpaperResponse {
  newspaper?: Item;
  magazine?: Item;
}

const EpaperRightSidebar = () => {
  const [data, setData] = useState<EpaperResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.EPAPERRIGHTSIDEBAR, {
          signal: controller.signal,
          cache: 'no-store'
        });

        if (!res.ok) throw new Error('Failed to load');

        const json = await res.json();
        setData(json);
      } catch (err) {
        if ((err as any).name !== 'AbortError') {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, []);

  if (loading || !data) return null;

  return (
    <>
      <div className="epaper-wrapper">
        {/* Newspaper */}
        {data.newspaper?.first_image && (
          <div className="epaper-left">
            <div className="storySectionNav blogs-head-bar first magazine_head">
              <h3 className="blog-category magazine_head_title">આજનું ઈ-પેપર</h3>
            </div>
            <Link href={data.newspaper.url} target="_blank">
              <img
                src={data.newspaper.first_image}
                alt="Newspaper Epaper"
                loading="lazy"
              />
            </Link>
          </div>
        )}

        {/* Magazine */}
        {data.magazine?.first_image && (
          <div className="epaper-right">
            <div className="storySectionNav blogs-head-bar first magazine_head">
              <h3 className="blog-category magazine_head_title">આજનું મેગેઝિન</h3>
            </div>
            <Link href={data.magazine.url} target="_blank">
              <img
                src={data.magazine.first_image}
                alt="Magazine Epaper"
                loading="lazy"
              />
            </Link>
          </div>
        )}
      </div>

      {/* ✅ Component-scoped CSS (UNCHANGED) */}
      <style jsx>{`
        .magazine_head {
          margin-bottom: 0px;
          justify-content: center;
          border-bottom:2px solid #800d00;
        }
        .magazine_head_title{
          color:#800d00;
          margin-bottom:0px;
          padding:8px 14px 8px 16px;
        }
        .magazine_head h3 {
          font-size: clamp(16px, 1.1vw, 20px);
        }
        .epaper-wrapper {
          display: flex;
          gap: 15px;
        }

        .epaper-left,
        .epaper-right {
          width: 50%;
          margin: 0 0 15px 0;
          border: 1px solid rgb(128, 13, 0);
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
          max-height: 350px;
          overflow: hidden;
        }

        .epaper-left img,
        .epaper-right img {
          width: 100%;
          object-fit: cover;
          display: block;
          border-radius: 6px;
        }

        img {
          width: 100%;
          height: auto;
          border-radius: 8px;
        }

        .papercls {
          text-decoration: none;
          border: 1px solid #ddd;
        }

        /* 📱 Mobile */
        @media (max-width: 768px) {
          .epaper-wrapper {
            flex-direction: column;
          }

          .epaper-left,
          .epaper-right {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default EpaperRightSidebar;
