'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { API_ENDPOINTS } from '@/constants/api';
import { getImageUrl } from '@/utils/commonUtils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { LOADING_MESSAGES } from '@/utils/uiUtils';

interface MagazineItem {
  id: number;
  created_at: string;
  slug: string;
  title: string;
  videoURL: string | null;
  featureImage: string | null;
  category_slugs: string;
}

interface GstvMagazineBoxProps {
  className?: string;
}

const GstvMagazineBox: React.FC<GstvMagazineBoxProps> = ({ className = '' }) => {
  const [data, setData] = useState<MagazineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  /* ================= FETCH ================= */

  const fetchMagazineNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(API_ENDPOINTS.GSTV_MAGAZINE_NEWSDATA);

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}`);
      }

      const json = await res.json();

      if (!json?.gstvfasttrack || !Array.isArray(json.gstvfasttrack)) {
        throw new Error('Invalid API response');
      }

      const formatted: MagazineItem[] = json.gstvfasttrack
        .slice(0, 10)
        .map((item: any) => ({
          id: item.id,
          created_at: item.created_at,
          slug: item.slug,
          title: item.title,
          videoURL: item.videoURL ?? null,
          featureImage: item.featureImage ?? null,
          category_slugs: item.category_slugs || 'magazines'
        }));

      setData(formatted);
      setCurrentSlide(0);
    } catch (e: any) {
      setError(e.message || 'Failed to load magazine news');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMagazineNews();
  }, [fetchMagazineNews]);

  /* ================= HELPERS ================= */

  const getOptimizedImage = useCallback((item: MagazineItem): string => {
    let imageUrl = '';

    if (item.featureImage) {
      const base = getImageUrl(item.featureImage, 'news');
      const ext = item.featureImage.split('.').pop()?.toLowerCase() || '';
      imageUrl = base.replace(new RegExp(`\\.${ext}$`, 'i'), `_small.${ext}`);
    } else if (item.videoURL) {
      const ext = item.videoURL.split('.').pop()?.toLowerCase() || '';
      imageUrl = item.videoURL.replace(new RegExp(`\\.${ext}$`, 'i'), '_video_small.jpg');
    }

    return imageUrl || '/images/gstv-logo-bg.png';
  }, []);

  const formatCategory = useCallback(
    (slug: string) => slug.replace(/,/g, '/'),
    []
  );

  /* ================= CHUNKING ================= */

  const chunks = useMemo(() => {
    const result: MagazineItem[][] = [];
    for (let i = 0; i < data.length; i += 5) {
      result.push(data.slice(i, i + 5));
    }
    return result;
  }, [data]);

  const currentChunk = useMemo(
    () => chunks[currentSlide] || [],
    [chunks, currentSlide]
  );

  /* ================= AUTOSLIDE ================= */

  useEffect(() => {
    if (chunks.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % chunks.length);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [chunks.length]);

  /* ================= STATES ================= */

  if (loading) {
    return (
      <div className={`gstv-magazine-container ${className}`}>
        <Header />
        <LoadingSpinner
          message={LOADING_MESSAGES.LOADING_NEWS}
          size="small"
          color="#850E00"
          compact
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`gstv-magazine-container ${className}`}>
        <Header />
        <div className="text-center p-3">
          <p style={{ color: '#dc3545' }}>
            મેગેઝિન લોડ કરવામાં ભૂલ: {error}
          </p>
          <button
            onClick={fetchMagazineNews}
            className="btn btn-sm"
            style={{ background: '#850E00', color: '#fff' }}
          >
            ફરી પ્રયાસ કરો
          </button>
        </div>
      </div>
    );
  }

  if (!data.length) return null;

  /* ================= UI (UNCHANGED) ================= */

  return (
    <div
      className={`gstv-magazine-container ${className}`}
      style={{
        border: '1px solid #800d00',
        borderRadius: '10px',
        overflow: 'hidden'
      }}
    >
      <Header />

      <div className="row blog-read-content m-0 p-0">
        {currentChunk.map((item, idx) => (
          <div
            key={item.id}
            className="col-12 d-flex align-items-center"
            style={{
              padding: '8px 15px',
              borderBottom:
                idx < currentChunk.length - 1 ? '1px solid #f0f0f0' : 'none'
            }}
          >
            <div style={{ flex: '0 0 60px', marginRight: '12px' }}>
              <Link href={`/news/${formatCategory(item.category_slugs)}/${item.slug}`}>
                <img
                  src={getOptimizedImage(item)}
                  alt={item.title}
                  style={{
                    width: '60px',
                    height: '45px',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/gstv-logo-bg.png';
                  }}
                />
              </Link>
            </div>

            <div style={{ flex: 1 }}>
              <h4
                style={{
                  fontSize: '16px',
                  lineHeight: '25px',
                  margin: 0,
                  fontWeight: 600
                }}
              >
                <Link
                  href={`/news/${formatCategory(item.category_slugs)}/${item.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  {item.title}
                </Link>
              </h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ================= HEADER (UNCHANGED) ================= */

const Header = () => (
  <div className="storySectionNav blogs-head-bar first fastrack_head" style={{ marginBottom: 0 }}>
    <div className="storySectionNav-left">
      <Link href="/category/magazines">
        <h3 className="blog-category">મેગેઝિન</h3>
      </Link>
    </div>
    <style jsx>{`
      .storySectionNav {
        display: flex;
        justify-content: center !important;
        align-items: center;
        margin-bottom: 15px;
        padding: 0;
        text-align: center;
      }
    `}</style>
  </div>
);

export default GstvMagazineBox;
