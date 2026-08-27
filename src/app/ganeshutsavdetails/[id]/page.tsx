'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { API_ENDPOINTS, getGanapatiImageUrl } from '@/constants/api';
import { COMMON_CLASSES, LOADING_MESSAGES } from '@/utils/uiUtils';
import LoadingSpinner from '@/components/LoadingSpinner';

// TypeScript interfaces for the API response
interface GaneshutsavEntry {
  id: number;
  userID: number;
  name: string;
  address: string;
  featureImage: string;
  status: string;
  created_at: string;
  updated_at: string;
  featureImageThumb?: string;
}

const GaneshutsavDetailsPage: React.FC = () => {
  const params = useParams();
  const [entry, setEntry] = useState<GaneshutsavEntry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const entryId = params?.id as string;

  // Fetch entry details from API
  useEffect(() => {
    const fetchEntryDetails = async () => {
      if (!entryId) {
        setError('Invalid entry ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(API_ENDPOINTS.GANESHUTSAV_DETAILS, {
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

        const result: { success: boolean; data: GaneshutsavEntry } = await response.json();

        if (!result.success || !result.data) {
          throw new Error('API returned unsuccessful response');
        }

        setEntry(result.data);

      } catch (err) {
        console.error('Error fetching ganeshutsav entry details:', err);
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
    return getGanapatiImageUrl(imagePath);
  };

  // Loading state
   // ✅ LOADER VIEW (YOUR CODE)
    if (loading) {
      return (
        <div className={COMMON_CLASSES.LOADING_CONTAINER}>
          <LoadingSpinner
            message={LOADING_MESSAGES.LOADING}
            size="large"
            color="#850E00"
          />
        </div>
      );
    }

  // Error state
  if (error || !entry) {
    return (
      <div className="blogs-main-section inner custom-blog-details undefined nextstorydiv">
        <div className="blogs-head-bar inner">
          <span className="blog-category detail-page-heading">
            <Link href="/">Home</Link> / <Link href="/ganeshutsav"><i>ગણેશોત્સવ</i></Link>
          </span>
        </div>
        <div className="detail-page-heading-h1">
          <h1>Error</h1>
        </div>
        <div className="row blog-content">
          <div className="col-12 text-center">
            <div className="error-message">
              <p>{error || 'Entry not found'}</p>
              <Link href="/ganeshutsav" className="btn btn-primary">
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
          <Link href="/">Home</Link> / <Link href="/ganeshutsav"><i>ગણેશોત્સવ</i></Link>
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
                <img src="/assets/icons/clock.webp" alt="Last updated time for Ganeshutsav event" />
                છેલ્લું અપડેટ: {new Date(entry.created_at).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
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
              <p><b>Address:</b> {entry.address}</p>
              <br /><br />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GaneshutsavDetailsPage;
