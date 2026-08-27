'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import SatrangHeaderWithDropdown from './SatrangHeaderWithDropdown';
import { fetchSatrangCategory, SatrangAuthor } from '@/services/newsApi';
import { LOADING_MESSAGES } from '@/utils/uiUtils';

interface GSTVShatrangLayoutProps {
  categorySlug: string;
}

export default function GSTVShatrangLayout({ categorySlug }: GSTVShatrangLayoutProps) {
  const [authors, setAuthors] = useState<SatrangAuthor[]>([]);
  const [visibleProfiles, setVisibleProfiles] = useState(48);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ================= FETCH ================= */

  const fetchAuthors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchSatrangCategory();

      if (!response?.categorychildQuery || !Array.isArray(response.categorychildQuery)) {
        throw new Error('Invalid API response structure');
      }

      const activeAuthors = response.categorychildQuery.filter(
        author => author.status === 'Active'
      );

      setAuthors(activeAuthors);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load authors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  /* ================= LOAD MORE ================= */

  const handleLoadMore = useCallback(() => {
    setVisibleProfiles(prev => prev + 24);
  }, []);

  /* ================= MEMOIZED DATA ================= */

  const visibleAuthors = useMemo(
    () => authors.slice(0, visibleProfiles),
    [authors, visibleProfiles]
  );

  const handleAuthorSelect = useCallback(
    (authorSlug: string | null) => {
      if (authorSlug) {
        window.location.href = `/category/${categorySlug}/${authorSlug}`;
      } else {
        window.location.href = `/category/${categorySlug}`;
      }
    },
    [categorySlug]
  );

  /* ================= STATES ================= */

  if (loading) {
    return (
       <LoadingSpinner
          message={LOADING_MESSAGES.LOADING_MORE_NEWS}
          size="large"
          color="#850E00"
          compact
        />
    );
  }

  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  /* ================= UI (UNCHANGED) ================= */

  return (
    <div className='blogs-main-section'>
      <SatrangHeaderWithDropdown
        categoryName="GSTV શતરંગ"
        categorySlug={categorySlug}
        authors={authors}
        onAuthorSelect={handleAuthorSelect}
      />

      <div className='row blog-content' id="news-container">
        {visibleAuthors.map((author) => (
          <div key={author.id} className="col-lg-3 col-6 custom-video-section">
            <Link
              href={`/category/${categorySlug}/${author.slug}`}
              className="gstv-author-card"
            >
              <div className="blog-read-content">
                <div className="card">
                  <div className="img-wrappers">
                    <div className="videonewscls">
                      <img
                        src={author.icon || "/assets/images/video-default.png"}
                        alt={author.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/assets/images/video-default.png";
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}

        {visibleProfiles < authors.length && (
          <div className="load-more-section">
            <button
              onClick={handleLoadMore}
              className="load-more-btn"
            >
              વધુ લોડ કરો
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
