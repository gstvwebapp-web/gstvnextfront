'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '@/styles/RashiForecast.css';

interface RashiNews {
  id: number;
  slug: string;
  news_title: string;
  videoURL: string;
  category_slugs: string;
}

interface RashiData {
  id: number;
  title: string;
  slug: string;
  rashiimage: string;
  rashiword: string;
  news: RashiNews;
}

interface RashiForecastResponse {
  status: boolean;
  data: RashiData[];
}

export default function RashiForecast() {
  const [rashiData, setRashiData] = useState<RashiData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch rashi data
  useEffect(() => {
    const fetchRashiData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/religionRashi', {
          method: 'GET',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          console.error(`Rashi API error: ${res.status}`);
          setRashiData([]);
          setLoading(false);
          return;
        }

        const data = await res.json();

        // Handle various response formats
        if (data?.status === true && data?.data && Array.isArray(data.data) && data.data.length > 0) {
          setRashiData(data.data);
        } else if (Array.isArray(data)) {
          // If response is directly an array
          setRashiData(data);
        } else {
          console.warn('Invalid Rashi API response format:', data);
          setRashiData([]);
        }
      } catch (err) {
        console.error('RashiForecast fetch error:', err);
        setRashiData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRashiData();
  }, []);

  if (loading) return null;
  if (rashiData.length === 0) return null;

  return (
    <>
    <div className="rashi-forecast-section">
      {/* Header Section - Matching WebStories style */}
      <div className="forecastSectionNav">
        <div className="forecastSectionNav-left">
          <Link href="/rashifal">
            <img
              src="/assets/icons/bookmark.svg"
              alt="આજનું રાશિફળ"
            />
            <span className="custom-gujrati-font">આજનું રાશિફળ</span>
          </Link>
        </div>
        {/* <div className="forecastSectionNav-right">
          <Link href="/rashifal" className="forecast-more-link">
            વધુ વાંચો &nbsp;<span className="forecast-more-btn"><i className="fas fa-chevron-right"></i></span>
          </Link>
        </div> */}
      </div>

      {/* Grid Wrapper */}
      <div className="rashi-forecast-wrap">
        {/* Grid Container - 3 columns */}
        <div className="rashi-forecast-grid">
          {/* Rashi grid items */}
          {rashiData.map((rashi) => (
            <Link
              key={rashi.id}
              href={`/rashifal/rashi/${rashi.slug}`}
              className="rashi-forecast-item"
            >
              <div className="rashi-forecast-card">
                {/* Icon - Circular background */}
                <div className="rashi-forecast-icon">
                  <img
                    src={
                      rashi.rashiimage?.startsWith('http')
                        ? rashi.rashiimage
                        : rashi.rashiimage?.startsWith('/')
                        ? rashi.rashiimage
                        : `/assets/icons/${rashi.rashiimage}` || '/images/video-default.png'
                    }
                    alt={rashi.title}
                    loading="lazy"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.dataset.fb) {
                        img.dataset.fb = '1';
                        img.src = '/assets/icons/business.webp';
                      }
                    }}
                  />
                </div>

                {/* Rashi Name */}
                <p className="rashi-forecast-name custom-gujrati-font">
                  {rashi.title}
                </p>

                {/* Rashi Word (Letters) */}
                <p className="rashi-forecast-word custom-gujrati-font">
                  {rashi.rashiword}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
      <div style={{ clear: 'both' }}></div>
      </>
  );
}
