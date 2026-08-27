'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { commonApiGet } from '@/constants/api';

interface RashiData {
  id: number;
  title: string;
  engtitle: string;
  rashiword: string;
  rashiicon: string;
}

export default function RashifalSidebar() {
  const [rashiData, setRashiData] = useState<RashiData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await commonApiGet('rashifal');
        if (!res.ok) return;
        const data = await res.json();

        let list: RashiData[] = [];
        if (Array.isArray(data.rashi))                   list = data.rashi;
        else if (Array.isArray(data.data?.rashifaldata)) list = data.data.rashifaldata;
        else if (Array.isArray(data.data))               list = data.data;
        else if (Array.isArray(data.rashifaldata))       list = data.rashifaldata;
        else if (Array.isArray(data))                    list = data;

        setRashiData(list);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || rashiData.length === 0) return null;

  return (
    <>
      {/* ── Bordered rashifal box ── */}
      <div className="rashifal-sidebar-widget">

        {/* Heading */}
        <div
          className="storySectionNav blogs-head-bar first fastrack_head"
          style={{ marginBottom: 0, paddingBottom: 8 }}
        >
          <div className="storySectionNav-left">
            <h3 className="blog-category custom-gujrati-font">આજનું રાશિફળ</h3>
            <div className="position-relative">
            </div>
          </div>
        </div>

        {/* 3-per-row grid */}
        <div className="rashifal-sidebar-grid">
          {rashiData.map((rashi, index) => (
            <Link
              key={rashi.id || index}
              href={`/rashifal/rashi/${rashi.id || index}/today`}
              className="rashifal-sidebar-item"
            >
              <i className="rashifal-sidebar-icon">
                <img
                  src={rashi.rashiicon}
                  alt={rashi.title || 'Rashi'}
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).src = '/images/default-rashi-icon.png';
                  }}
                />
              </i>
              <h5 className="rashifal-sidebar-name custom-gujrati-font">
                {rashi.title}
              </h5>
              <h6 className="rashifal-sidebar-word custom-gujrati-font">
                ({rashi.rashiword})
              </h6>
            </Link>
          ))}
        </div>

      </div>
      {/* ── END bordered box ── */}

      {/* ── App banner — OUTSIDE the border ── */}
      <a
        href="https://play.google.com/store/apps/details?id=com.tops.gstvapps"
        target="_blank"
        rel="noopener noreferrer"
        className="rashifal-app-banner"
      >
        <img
          src="/images/rightside-rahifal.jpeg"
          alt="GSTV App ડાઉનલોડ કરો"
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8 }}
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      </a>

      <style>{`
        .rashifal-sidebar-widget {
          border: 1px solid #800d00;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 0;
        }

        .rashifal-app-banner {
          display: block;
          margin: 10px 0 16px;
          border-radius: 8px;
          overflow: hidden;
          transition: opacity 0.2s;
        }

        .rashifal-app-banner:hover {
          opacity: 0.92;
        }

        .rashifal-sidebar-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          background: #fff;
          padding: 8px 4px 4px;
        }

        .rashifal-sidebar-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 8px 4px;
          text-decoration: none !important;
          color: #333;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .rashifal-sidebar-item:hover {
          background: #fff5f5;
          color: #850E00;
        }

        .rashifal-sidebar-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #fdf6ec;
          border: 1px solid #f0e0c8;
          margin-bottom: 4px;
          font-style: normal;
        }

        .rashifal-sidebar-icon img {
          width: 30px;
          height: 30px;
          object-fit: contain;
        }

        .rashifal-sidebar-name {
          font-size: 11px;
          font-weight: 700;
          margin: 0;
          line-height: 1.3;
          color: #222;
        }

        .rashifal-sidebar-item:hover .rashifal-sidebar-name {
          color: #850E00;
        }

        .rashifal-sidebar-word {
          font-size: 9px;
          font-weight: 400;
          margin: 0;
          color: #777;
          line-height: 1.2;
        }
      `}</style>
    </>
  );
}
