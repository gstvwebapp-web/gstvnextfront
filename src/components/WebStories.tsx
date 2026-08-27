'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { fetchTopWebStories, WebStory } from '@/services/newsApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import '@/styles/WebStories.css';

export default function WebStories() {
  console.log('WebStories component rendering...');

  // State management for WebStories component (matching TopVideos)
  const [webStories, setWebStories] = useState<WebStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(6);
  const [itemWidth, setItemWidth] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Mouse drag refs
  const mouseStartX = useRef(0);
  const mouseEndX = useRef(0);
  const isDragging = useRef(false);
  const dragStartSlide = useRef(0);

 

  // Fetch web stories data on component mount
  useEffect(() => {
    const loadWebStories = async () => {
      try {
        console.log('WebStories: Starting to fetch data...');
        setLoading(true);
        setError(null);

        const data = await fetchTopWebStories();
        console.log('WebStories: Data received:', data);

        if (data.topwebstory && Array.isArray(data.topwebstory)) {
          setWebStories(data.topwebstory);
          console.log('WebStories: Set web stories data, count:', data.topwebstory.length);
        } else {
          console.warn('WebStories: No topwebstory data found in response');
          setWebStories([]);
        }
      } catch (err) {
        console.error('WebStories: Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch web stories');
      } finally {
        setLoading(false);
      }
    };

    loadWebStories();
  }, []);

  /* =========================
     Mouse Drag (Desktop Touch-like)
  ========================= */
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = false;
    mouseStartX.current = e.clientX;
    mouseEndX.current = e.clientX;
    dragStartSlide.current = currentSlide;
    setIsAutoRotating(false);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseStartX.current === 0) return;
    
    const diff = Math.abs(e.clientX - mouseStartX.current);
    if (diff > 5) {
      isDragging.current = true;
    }
    
    if (!isDragging.current) return;
    
    mouseEndX.current = e.clientX;
    const dragDiff = mouseStartX.current - mouseEndX.current;
    const maxSlides = Math.max(0, webStories.length - itemsPerView);
    const slidesMoved = Math.round(dragDiff / (itemWidth || 1));
    const newSlide = Math.max(0, Math.min(maxSlides, dragStartSlide.current + slidesMoved));
    
    setCurrentSlide(newSlide);
  };

  const handleMouseUp = () => {
    mouseStartX.current = 0;
    setTimeout(() => {
      isDragging.current = false;
    }, 50);
  };

  const handleMouseLeave = () => {
    if (isDragging.current) {
      isDragging.current = false;
    }
    mouseStartX.current = 0;
  };

  /* ===============================
   MOBILE TOUCH SCROLL (ADDED)
================================ */
useEffect(() => {
  const slider = sliderRef.current;
  if (!slider) return;

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;

    if (Math.abs(distance) > 50) {
      if (distance > 0) {
        nextSlide();   // swipe left
      } else {
        prevSlide();   // swipe right
      }
    }
  };

  slider.addEventListener('touchstart', handleTouchStart, { passive: true });
  slider.addEventListener('touchmove', handleTouchMove, { passive: true });
  slider.addEventListener('touchend', handleTouchEnd);

  return () => {
    slider.removeEventListener('touchstart', handleTouchStart);
    slider.removeEventListener('touchmove', handleTouchMove);
    slider.removeEventListener('touchend', handleTouchEnd);
  };
}, [webStories.length, itemsPerView]);


  // Helper function to get the first image from story data
  const getFirstStoryImage = (story: WebStory): string => {
    try {
      const storyData = JSON.parse(story.Story_data);
      if (storyData.length > 0 && storyData[0].webimage) {
        // Convert to small image format like in Laravel
        return storyData[0].webimage.replace('.webp', '_small.webp');
      }
    } catch (error) {
      console.error('Error parsing story data:', error);
    }
    return '/images/video-default.png'; // fallback image
  };

  // Navigation functions
  const nextSlide = () => {
    const maxSlides = Math.max(0, webStories.length - itemsPerView);
    setCurrentSlide(prev => Math.min(prev + 1, maxSlides));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  // Retry function for error handling
  const retryFetch = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await fetchTopWebStories();
      if (data.topwebstory && Array.isArray(data.topwebstory)) {
        setWebStories(data.topwebstory);
      } else {
        setWebStories([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch web stories');
    } finally {
      setLoading(false);
    }
  };

  // Responsive items per view based on data-items="1,3,5,6" (original WebStories logic)
  useEffect(() => {
    const updateItemsPerView = () => {
      const bodyWidth = window.innerWidth;
      let incno = 5; // default

      // data-items="1,3,5,6" means: [mobile, tablet, desktop, large]
      // Original WebStories responsive logic
      if (bodyWidth >= 1200) {
        incno = 5; // itemsSplit[3] - large desktop
      } else if (bodyWidth >= 992) {
        incno = 5; // itemsSplit[2] - desktop
      } else if (bodyWidth >= 768) {
        incno = 3; // itemsSplit[1] - tablet
      } else {
        incno = 3; // itemsSplit[0] - mobile
      }


      setItemsPerView(incno);
      console.log('WebStories: Updated items per view:', incno, 'for width:', bodyWidth);
    };

    updateItemsPerView();

    const handleResize = () => {
      updateItemsPerView();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate item width based on container and items per view (matching TopVideos)
  useEffect(() => {
    if (sliderRef.current && webStories.length > 0) {
      const containerWidth = sliderRef.current.parentElement?.offsetWidth || 0;
      const calculatedItemWidth = containerWidth / itemsPerView;
      setItemWidth(calculatedItemWidth);
      console.log('WebStories: Container width:', containerWidth, 'Item width:', calculatedItemWidth);
    }
  }, [itemsPerView, webStories.length]);

  // Auto-rotation with data-interval="1000" (matching TopVideos)
  useEffect(() => {
    if (isAutoRotating && webStories.length > itemsPerView) {
      autoRotateRef.current = setInterval(() => {
        setCurrentSlide(prev => {
          const maxSlides = Math.max(0, webStories.length - itemsPerView);
          return prev >= maxSlides ? 0 : prev + 1;
        });
      }, 5000); // data-interval="1000"    } else {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
        autoRotateRef.current = null;
      }
    }

    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
        autoRotateRef.current = null;
      }
    };
  }, [isAutoRotating, webStories.length, itemsPerView]);

  // Cleanup on unmount (matching TopVideos)
  useEffect(() => {
    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="carousel-inner-top custom-carousel clearfix">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <LoadingSpinner
            message="વેબ સ્ટોરીઝ લોડ થઈ રહ્યા છે..."
            size="large"
            type="dots"
            color="#850E00"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="carousel-inner-top custom-carousel clearfix">
        <div className="section-header">
          <h2 className="section-title">વેબ સ્ટોરીઝ</h2>
        </div>
        <ErrorMessage error={error} onRetry={retryFetch} />
      </div>
    );
  }

  if (webStories.length === 0) {
    return (
      <div className="carousel-inner-top custom-carousel clearfix">
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>No web stories available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="web-stories-section">
      {/* Header Section - Exact match to Laravel Blade */}
      <div className="storySectionNav">
        <div className="storySectionNav-left">
          <Link href="/web-stories">
            <img
              src="/assets/icons/e-paper-1.svg"
              alt="Web Stories"
            />
            <span>વેબ સ્ટોરીઝ</span>
          </Link>
        </div>
        <div className="storySectionNav-right">
          <Link href="/web-stories" className="custom-link-btn ws-more-link">
            વધુ વાંચો &nbsp;<span className="ws-more-btn"><i className="fas fa-chevron-right"></i></span>
          </Link>
        </div>
      </div>

      {/* Carousel - Matching TopVideos structure exactly */}
      <div className="custom-carousel clearfix">
        <div
          className="MultiCarousel"
          data-items="1,3,5,5"
          data-slide="1"
          id="MultiCarousel"
          data-interval="1000"
          onMouseEnter={() => setIsAutoRotating(false)}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
        >
          {/* ws-clip-wrap clips sliding cards; arrows are siblings so they overflow freely */}
          <div className="ws-clip-wrap">
            <div
              className="MultiCarousel-inner topwebstory"
              id="topwebstory-container"
              ref={sliderRef}
              style={{
                transform: `translateX(-${currentSlide * itemWidth}px)`,
                transition: 'transform 0.3s ease',
                display: 'flex',
                width: `${itemWidth * webStories.length}px`
              }}
            >
              {webStories.map((story, index) => (
                <div
                  key={`${story.id}-${index}`}
                  style={{ width: `${itemWidth}px`, flex: 'none' }}
                >
                  <Link
                    href={`/web-stories/${story.slug}`}
                    onClick={(e) => { if (isDragging.current) e.preventDefault(); }}
                  >
                    <div className="card custom-card">
                      <div className="img-wrappers custom-webstory-image">
                        <img
                          src={getFirstStoryImage(story)}
                          className="video-thumbnail-img"
                          alt={story.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/video-default.png';
                          }}
                        />
                      </div>
                      <div className="webstory-title-content custom-gujrati-font">
                        <span className="samachar-title">{story.title}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>{/* end ws-clip-wrap */}

          {/* Navigation Buttons — span when disabled so clicks cannot reach cards beneath */}
          {currentSlide === 0 ? (
            <span
              className="btn btn-primary leftLst over disabled-arrow"
              aria-hidden="true"
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
              onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
              onMouseUp={(e) => { e.stopPropagation(); e.preventDefault(); }}
            >
              <i className="fa fa-chevron-left"></i>
            </span>
          ) : (
            <button
              className="btn btn-primary leftLst"
              type="button"
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); prevSlide(); }}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label="Previous"
            >
              <i className="fa fa-chevron-left"></i>
            </button>
          )}

          {currentSlide >= Math.max(0, webStories.length - itemsPerView) ? (
            <span
              className="btn btn-primary rightLst over disabled-arrow"
              aria-hidden="true"
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
              onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
              onMouseUp={(e) => { e.stopPropagation(); e.preventDefault(); }}
            >
              <i className="fa fa-chevron-right"></i>
            </span>
          ) : (
            <button
              className="btn btn-primary rightLst"
              type="button"
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); nextSlide(); }}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label="Next"
            >
              <i className="fa fa-chevron-right"></i>
            </button>
          )}
         
        </div>
      </div>
    </div>
  );
}