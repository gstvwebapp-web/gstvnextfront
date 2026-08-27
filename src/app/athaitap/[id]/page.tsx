'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_ENDPOINTS, getEkasanaImageUrl } from '@/constants/api';

// TypeScript interfaces for the API response
interface AthaitapEntry {
  id: number;
  userID: number;
  name: string;
  days: number;
  mobile: string;
  address: string;
  featureImage: string;
  video?: string;
  status: string;
  created_at: string;
  updated_at: string;
  featureImageThumb?: string;
}

interface ApiResponse {
  success: boolean;
  data: AthaitapEntry;
}

const AthaitapDetailsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState<AthaitapEntry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false); // Track client-side mounting

  const entryId = params?.id as string;

  // Fetch entry details from API
  useEffect(() => {
    setIsMounted(true); // Set mounted to true after hydration

    const fetchEntryDetails = async () => {
      if (!entryId) {
        setError('Invalid entry ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(API_ENDPOINTS.ATHAITAP_DETAILS, {
          method: 'POST',
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            akasanaid: parseInt(entryId)
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: { success: boolean; data: ApiResponse } = await response.json();

        if (!result.success || !result.data?.success) {
          throw new Error('API returned unsuccessful response');
        }

        setEntry(result.data.data);

      } catch (err) {
        console.error('Error fetching athaitap entry details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load entry details');
      } finally {
        setLoading(false);
      }
    };

    fetchEntryDetails();
  }, [entryId]);

  // Helper functions for media URLs
  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return '/assets/images/gstv-logo-bg.png';
    return getEkasanaImageUrl(imagePath);
  };

  const getVideoUrl = (videoPath: string): string => {
    if (!videoPath) return '';
    return getEkasanaImageUrl(videoPath);
  };

  // Loading state
  if (loading) {
    return (
      <div className="blogs-main-section inner custom-blog-details undefined nextstorydiv">
        <div className="blogs-head-bar inner">
          <span className="blog-category detail-page-heading">
            <Link href="/">Home</Link> / <Link href="/athaitap"><i>તપસ્વીઓના તપ</i></Link>
          </span>
        </div>
        <div className="detail-page-heading-h1">
          <h1>લોડ થઈ રહ્યું છે...</h1>
        </div>
        <div className="row blog-content">
          <div className="col-12 text-center">
            <div className="loading-spinner">
              <p>લોડ થઈ રહ્યું છે...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !entry) {
    return (
      <div className="blogs-main-section inner custom-blog-details undefined nextstorydiv">
        <div className="blogs-head-bar inner">
          <span className="blog-category detail-page-heading">
            <Link href="/">Home</Link> / <Link href="/athaitap"><i>તપસ્વીઓના તપ</i></Link>
          </span>
        </div>
        <div className="detail-page-heading-h1">
          <h1>Error</h1>
        </div>
        <div className="row blog-content">
          <div className="col-12 text-center">
            <div className="error-message">
              <p>{error || 'Entry not found'}</p>
              <Link href="/athaitap" className="btn btn-primary">
                પાછા જાઓ
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blogs-main-section inner custom-blog-details undefined nextstorydiv" itemID={entry.name}>
      <div className="blogs-head-bar inner">
        <span className="blog-category detail-page-heading">
          <Link href="/">Home</Link> / <Link href="/athaitap"><i>તપસ્વીઓના તપ</i></Link>
        </span>
      </div>

      <div className="detail-page-heading-h1">
        <h1>{entry.name}</h1>
      </div>

      <div className="row blog-content">
        <div className="col-lg-12 detail-page">
          <div className="blog-read-content">
            <div className="blog-featured-functions">
              <div className="reading-time-blog">
                <img src="/assets/icons/clock.webp" alt="Last updated time for Athaitap entry" />
                છેલ્લું અપડેટ: {isMounted ? (
                  new Date(entry.created_at).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })
                ) : (
                  entry.created_at.split('T')[0]
                )}
              </div>
            </div>

            <div className="lazyload-wrapper" style={{ textAlign: 'center' }}>
              <img
                style={{ width: '40%', height: 'auto' }}
                src="/assets/images/gstv-logo-bg.png"
                data-srcset={`${getImageUrl(entry.featureImage)} 480w, ${getImageUrl(entry.featureImage)} 800w`}
                data-sizes="auto"
                className="lazyload innerpage"
                alt={entry.name}
              />

              <br /><br />
              <p><b>Days:</b> {entry.days}</p>
              <p><b>Address:</b> {entry.address}</p>
              <p><b>Mobile:</b> {entry.mobile}</p>
              <br /><br />

              {/* Render video if available */}
              {entry.video && (
                <div className="videotagnewscls">
                  <video
                    id="myVideo"
                    className="video-js vjs-default-skin"
                    preload="auto"
                    autoPlay
                    controls
                    controlsList="nodownload"
                    style={{ width: '100%', height: '100%' }}
                  >
                    <source src={getVideoUrl(entry.video)} type="video/mp4" />
                  </video>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AthaitapDetailsPage;