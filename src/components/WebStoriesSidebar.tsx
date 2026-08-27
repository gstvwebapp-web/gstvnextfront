'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { fetchTopWebStories, WebStory } from '@/services/newsApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import '@/styles/WebStories.css';

export default function WebStories() {
  const [webStories, setWebStories] = useState<WebStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(6);
  const [itemWidth, setItemWidth] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  const sliderRef = useRef<HTMLDivElement>(null);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);

  /* Fetch Web Stories */
  useEffect(() => {
    const loadWebStories = async () => {
      try {
        setLoading(true);
        setError(null);

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

    loadWebStories();
  }, []);

  /* Get first image */
  const getFirstStoryImage = (story: WebStory): string => {
    try {
      const storyData = JSON.parse(story.Story_data);
      if (storyData?.[0]?.webimage) {
        return storyData[0].webimage.replace('.webp', '_small.webp');
      }
    } catch {
      /* ignore */
    }
    return '/images/video-default.png';
  };

  /* Navigation */
  const nextSlide = () => {
    const maxSlides = Math.max(0, webStories.length - itemsPerView);
    setCurrentSlide(prev => (prev >= maxSlides ? 0 : prev + 1));
  };

  const prevSlide = () => {
    const maxSlides = Math.max(0, webStories.length - itemsPerView);
    setCurrentSlide(prev => (prev <= 0 ? maxSlides : prev - 1));
  };

  /* Responsive items */
  useEffect(() => {
    const updateItems = () => {
      const w = window.innerWidth;
      let count = 5;

      if (w < 768) count = 3;
      else if (w < 992) count = 3;
      else count = 5;

      setItemsPerView(count);
    };

    updateItems();
    window.addEventListener('resize', updateItems);
    return () => window.removeEventListener('resize', updateItems);
  }, []);

  /* Calculate width */
  useEffect(() => {
    if (sliderRef.current && webStories.length) {
      const container = sliderRef.current.closest('.web-stories-section');
      const width = container ? container.clientWidth : 0;
      setItemWidth(width / 2);
    }
  }, [webStories.length]);

  /* Auto rotate */
  useEffect(() => {
    if (isAutoRotating && webStories.length > itemsPerView) {
      autoRotateRef.current = setInterval(nextSlide, 5000);
    }

    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
        autoRotateRef.current = null;
      }
    };
  }, [isAutoRotating, webStories.length, itemsPerView]);

  /* Loading */
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

  /* Error */
  if (error) {
    return (
      <div className="carousel-inner-top custom-carousel clearfix">
        <div className="section-header">
          <h2 className="section-title">વેબ સ્ટોરીઝ</h2>
        </div>
        <ErrorMessage error={error} onRetry={() => location.reload()} />
      </div>
    );
  }

  if (!webStories.length) return null;

  return (
    <div className="web-stories-section mb-4">
      {/* Header */}
      <div className="storySectionNav blogs-head-bar first">
        <div className="storySectionNav-left">
          <span className="blog-category">વેબ સ્ટોરીઝ</span>
        </div>
        <div className="storySectionNav-right rightstory">
          <Link href="/web-stories" className="custom-link-btn">
            વધુ વાંચો <i className="fas fa-chevron-right"></i>
          </Link>
        </div>
      </div>

      {/* Carousel */}
      <div className="custom-carousel clearfix">
        <div
          className="MultiCarousel"
          data-items="1,3,5,5"
          onMouseEnter={() => setIsAutoRotating(false)}
          onMouseLeave={() => setIsAutoRotating(true)}
        >
          <div
            className="MultiCarousel-inner topwebstory"
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
                style={{ width: itemWidth, flex: 'none' }}
              >
                <Link href={`/web-stories/${story.slug}`}>
                  <div className="card custom-card">
                    <div className="img-wrappers custom-webstory-image">
                      <img
                        src={getFirstStoryImage(story)}
                        loading="lazy"
                        className="video-thumbnail-img"
                        alt={story.title}
                        onError={(e) =>
                          ((e.target as HTMLImageElement).src =
                            '/images/video-default.png')
                        }
                      />
                    </div>

                    {/* TITLE (unchanged – CSS controls visibility) */}
                    <div className="webstory-title-content custom-gujrati-font">
                      <span className="samachar-title">{story.title}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Nav buttons */}
          <button
            className={`btn btn-primary leftLst ${currentSlide === 0 ? 'over' : ''}`}
            onClick={prevSlide}
            disabled={currentSlide === 0}
          >
            <i className="fa fa-chevron-left"></i>
          </button>

          <button
            className={`btn btn-primary rightLst ${
              currentSlide >= Math.max(0, webStories.length - itemsPerView) ? 'over' : ''
            }`}
            onClick={nextSlide}
            disabled={currentSlide >= Math.max(0, webStories.length - itemsPerView)}
          >
            <i className="fa fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
