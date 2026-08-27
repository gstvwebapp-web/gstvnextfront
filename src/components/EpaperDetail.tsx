'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import {
  formatDate,
  getImageUrl,
  handleBookmark,
  handleShare,
  isBookmarked as checkIsBookmarked,
  getCurrentDateDDMMYYYY
} from '@/utils/commonUtils';
import { epaperApi, EpaperItem } from '@/services/commonApiService';
import Link from 'next/link';

interface EpaperDetailProps {
  slug: string;
  date: string;
}

interface ImagePosition {
  x: number;
  y: number;
}

export default function EpaperDetail({ slug, date }: EpaperDetailProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [epaper, setEpaper] = useState<EpaperItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Zoom and pan functionality
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState<ImagePosition>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<ImagePosition>({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if epaper is bookmarked on mount
  useEffect(() => {
    if (epaper && mounted) {
      setIsBookmarked(checkIsBookmarked(epaper.id, 'epaper'));
    }
  }, [epaper, mounted]);

  // Load epaper detail
  const loadEpaperDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`[EpaperDetail] Loading epaper detail for: ${slug}/${date}`);

      const response = await epaperApi.getEpaperDetail(slug, date);

      if (response.status === 'success' && response.data) {
        setEpaper(response.data);
        console.log(`[EpaperDetail] Loaded epaper:`, response.data);
      } else {
        setError('Epaper not found');
      }
    } catch (err) {
      console.error('[EpaperDetail] Error loading epaper:', err);
      setError(err instanceof Error ? err.message : 'Failed to load epaper');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount or params change
  useEffect(() => {
    if (slug && date) {
      loadEpaperDetail();
    }
  }, [slug, date]);

  // Handle bookmark toggle
  const toggleBookmark = async () => {
    if (!epaper || !mounted) return;
    
    try {
      const bookmarkData = {
        id: epaper.id,
        title: epaper.etitle || epaper.title || 'Epaper',
        slug: epaper.slug || epaper.ecatslug || `${slug}-${date}`,
        type: 'epaper' as const
      };
      
      const newBookmarkStatus = await handleBookmark(bookmarkData);
      setIsBookmarked(newBookmarkStatus);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  // Handle share
  const shareEpaper = async () => {
    if (!epaper || !mounted) return;

    const currentUrl = window.location.href;
    const shareData = {
      title: `${epaper.etitle || epaper.title} - ${date}`,
      url: currentUrl,
      description: epaper.metadesc || `${epaper.etitle} epaper for ${date}`
    };
    
    await handleShare(shareData);
  };

  // Zoom functions
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
    if (zoomLevel <= 1) {
      setImagePosition({ x: 0, y: 0 });
    }
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel > 1 && e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({
        x: touch.clientX - imagePosition.x,
        y: touch.clientY - imagePosition.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && zoomLevel > 1 && e.touches.length === 1) {
      const touch = e.touches[0];
      setImagePosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Get current page image URL
  const getCurrentImageUrl = (): string => {
    if (!epaper || !epaper.Story_data || epaper.Story_data.length === 0) {
      return '/images/default-epaper.png';
    }
    
    const imageUrl = epaper.Story_data[currentPage] || epaper.Story_data[0];
    return getImageUrl(imageUrl, 'epaper');
  };

  // Navigate pages
  const nextPage = () => {
    if (epaper && currentPage < epaper.Story_data.length - 1) {
      setCurrentPage(currentPage + 1);
      resetZoom();
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      resetZoom();
    }
  };

  // Prevent hydration issues
  if (!mounted) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <LoadingSpinner
          message="ઈ-પેપર લોડ થઈ રહ્યું છે..."
          size="large"
          type="dots"
          color="#850E00"
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <ErrorMessage
          error={error}
          onRetry={loadEpaperDetail}
        />
      </div>
    );
  }

  // No data state
  if (!epaper) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Epaper not found</h3>
        <p>The requested epaper could not be found.</p>
        <button
          onClick={() => router.push('/epaper')}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '15px',
            fontSize: '16px'
          }}
        >
          Back to Epapers
        </button>
      </div>
    );
  }

  const totalPages = epaper.Story_data?.length || 0;

  return (
    <>
      {/* SEO Meta Tags */}
      <Head>
        <title>{epaper.metatitle || `${epaper.etitle} - ${date}`} | GSTV News</title>
        <meta name="description" content={epaper.metadesc || `${epaper.etitle} epaper for ${date}`} />
        <meta name="keywords" content={epaper.metakeyword || 'epaper, newspaper, gstv'} />
        
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${epaper.etitle} - ${date}`} />
        <meta property="og:description" content={epaper.metadesc || `${epaper.etitle} epaper for ${date}`} />
        <meta property="og:image" content={getCurrentImageUrl()} />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${epaper.etitle} - ${date}`} />
        <meta name="twitter:description" content={epaper.metadesc || `${epaper.etitle} epaper for ${date}`} />
        <meta name="twitter:image" content={getCurrentImageUrl()} />
      </Head>

      <div className="contents-main-div epaperDetailMain">
        <div className='epapperPageDetailFlex'>
          <div className='epapperPageDetail'>
        {/* Header */}
        <div className="epaperDTop epaperdetailpg">
          <div className="header-left">
            <button 
              onClick={() => router.push('/epaper')}
              className="back-button"
            >
              <i className="fa fa-chevron-left"></i> Back to Epapers
            </button>
            
            <h1 className="epaper-title custom-gujrati-font">
              {epaper.etitle || epaper.title}
            </h1>
            
            <span className="epaper-date">
              <i className="fa fa-calendar"></i> {date}
            </span>
          </div>
          
          <div className="header-actions">
            {/* Zoom Controls */}
            <div className="zoom-controls">
              <button onClick={zoomOut} disabled={zoomLevel <= 0.5} title="Zoom Out">
                <i className="fa fa-search-minus"></i>
              </button>
              <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
              <button onClick={zoomIn} disabled={zoomLevel >= 3} title="Zoom In">
                <i className="fa fa-search-plus"></i>
              </button>
              <button onClick={resetZoom} title="Reset Zoom">
                <i className="fa fa-refresh"></i>
              </button>
            </div>
            
            {/* Action Buttons */}
            <button
              onClick={toggleBookmark}
              className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
              title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              <i className={`fa ${isBookmarked ? 'fa-bookmark' : 'fa-bookmark-o'}`}></i>
            </button>
            
            <button
              onClick={shareEpaper}
              className="share-btn"
              title="Share epaper"
            >
              <i className="fa fa-share"></i>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="epapperDetailImageBox slider slick-initialized slick-slider slick-dotted">
          <div
            ref={containerRef}
            className="epaper-image-container"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              ref={imageRef}
              src={getCurrentImageUrl()}
              alt={`${epaper.etitle || epaper.title} - Page ${currentPage + 1}`}
              className={`epaper-detail-image ${isDragging ? 'dragging' : ''}`}
              style={{
                transform: `scale(${zoomLevel}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                transformOrigin: 'center center',
                cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
              }}
              onError={(e) => {
                e.currentTarget.src = '/images/default-epaper.png';
              }}
            />
          </div>
        </div>

        {/* Page Navigation */}
        {totalPages > 1 && (
          <div className="page-navigation">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className="nav-btn prev-btn"
            >
              <i className="fa fa-chevron-left"></i> Previous
            </button>
            
            <div className="page-info">
              <span>Page {currentPage + 1} of {totalPages}</span>
              
              {/* Page thumbnails */}
              <div className="page-thumbnails">
                {epaper.Story_data.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentPage(index);
                      resetZoom();
                    }}
                    className={`page-thumb ${index === currentPage ? 'active' : ''}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className="nav-btn next-btn"
            >
              Next <i className="fa fa-chevron-right"></i>
            </button>
          </div>
        )}

        {/* Epaper Info */}
        <div className="epaper-info">
          <div className="epaper-meta">
            <span className="epaper-views">
              <i className="fa fa-eye"></i> {epaper.viewer + epaper.viewer_app} views
            </span>
            {epaper.pdf && (
              <Link 
                href={epaper.pdf} 
                target="_blank" 
                rel="noopener noreferrer"
                className="download-pdf"
              >
                <i className="fa fa-download"></i> Download PDF
              </Link>
            )}
          </div>
        </div></div>
      </div></div>
    </>
  );
}
