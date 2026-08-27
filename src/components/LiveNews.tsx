'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_V5_BASE_URL } from '@/constants/api';
import LoadingSpinner from './LoadingSpinner';

interface LiveNewsItem {
  livetitle: string;
  livenewsdate: string;
  lid?: number;
}

interface LiveNewsData {
  id: number;
  slug: string;
  title: string;
  featureImage: string;
  videoURL: string | null;
  description: string;
  created_at: string;
  news_id: number;
  live: LiveNewsItem[];
  max_lid: number;
  catID: string;
  category_slugs: string;
}

interface LiveNewsResponse {
  livenews: LiveNewsData[];
}

const LiveNews: React.FC = () => {
  const [liveNewsData, setLiveNewsData] = useState<LiveNewsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLiveNews();
  }, []);

  const fetchLiveNews = async () => {
    try {
      setLoading(true);

      
      const response = await fetch(`${API_V5_BASE_URL}/topnewsweb`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      

      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: LiveNewsResponse = await response.json();

      
      // Only use livenews array from the response
      setLiveNewsData(data.livenews || []);
      setError(null);
    } catch (err) {
      console.error('🔴 Error fetching live news:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getCategorySlug = (categorySlugs: string): string => {
    // Convert comma to forward slash and get first part
    const categorySlugs1 = categorySlugs.replace(/,/g, '/');
    return categorySlugs1.split('/')[0];
  };

  const getImageUrl = (newsItem: LiveNewsData): string => {
    if (newsItem.featureImage && newsItem.featureImage !== '') {
      const featureImage = newsItem.featureImage;
      const fileExtension = featureImage.split('.').pop()?.toLowerCase() || '';
      
      if (newsItem.videoURL && newsItem.videoURL !== '') {
        return featureImage;
      } else {
        // Add _small before file extension
        const regex = new RegExp(`\\.${fileExtension}$`, 'i');
        return featureImage.replace(regex, `_small.${fileExtension}`);
      }
    } else {
      if (newsItem.videoURL && newsItem.videoURL !== '') {
        const featureImage = newsItem.videoURL;
        const fileExtension = featureImage.split('.').pop()?.toLowerCase() || '';
        // Replace extension with _video.gif
        const regex = new RegExp(`\\.${fileExtension}$`, 'i');
        return featureImage.replace(regex, '_video.webp');
      }
    }
    
    return '/assets/images/gstv-logo-bg.png';
  };

  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return '';
    }
  };

  const getUniqueLiveData = (liveData: LiveNewsItem[]): LiveNewsItem[] => {
    const uniqueData: { [key: string]: LiveNewsItem } = {};
    
    if (Array.isArray(liveData)) {
      liveData.forEach((item) => {
        const key = item.lid ? item.lid.toString() : `${item.livetitle}_${item.livenewsdate}`;
        if (!uniqueData[key]) {
          uniqueData[key] = item;
        }
      });
    }
    
    return Object.values(uniqueData);
  };

  


  if (!liveNewsData || liveNewsData.length === 0) {
    return null; // Don&apos;t show anything if no live news
  }

  return (
    <div className="blogs-main-section" style={{ float: 'left', width:'100%', marginTop:'20px' }}>
      
        <div className="row blog-content liveNewsHblock">
          {liveNewsData.map((newsItem) => {
            const categorySlug = getCategorySlug(newsItem.category_slugs);
            const imageUrl = getImageUrl(newsItem);
            const uniqueLiveData = getUniqueLiveData(newsItem.live);

            return (
              <React.Fragment key={newsItem.id}>
                <div className="col-lg-4 column">
                  <div className="hover-image" style={{ minHeight: '180px' }}>
                    <div className="lazyload-wrapper">
                      <img
                        src="/assets/images/gstv-logo-bg.png"
                        data-srcset={`${imageUrl} 480w, ${imageUrl} 800w`}
                        data-sizes="auto"
                        className="lazyload gridimg custom-image"
                        alt={newsItem.title}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/assets/images/gstv-logo-bg.png';
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-8 column">
                  <h4>
                    <span><em>લાઇવ</em></span>{' '}
                    <Link href={`/news/${categorySlug}/${newsItem.slug}`}>
                      {newsItem.title}
                    </Link>
                  </h4>
                  
                  <div className="row liveNewsAddSectionhome">
                    {uniqueLiveData.slice(0, 3).map((liveItem, index) => (
                      <div key={index} className="col-lg-12 colLeft d-flex">
                        <h6>{formatTime(liveItem.livenewsdate)}</h6>
                        <h4>{liveItem.livetitle}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
    
    </div>
  );
};

export default LiveNews;