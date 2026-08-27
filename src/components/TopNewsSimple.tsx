'use client';

import { useState, useEffect } from 'react';
import { API_V5_BASE_URL, MEDIA_BASE_URL } from '@/constants/api';

interface NewsItem {
  id: number;
  title: string;
  englishTitle: string;
  slug: string;
  featureImage: string | null;
  imageURL: string;
  videoURL: string | null;
  description: string;
  created_at: string;
  updated_at: string;
  viewer: number;
  category_slugs: string;
  tags: string;
}

interface TopNewsResponse {
  topnews: NewsItem[];
  livenews: any[];
}

export default function TopNewsSimple() {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false); // Track client-side mounting for date rendering

  useEffect(() => {
    setIsMounted(true); // Set mounted to true after hydration
    fetchTopNews();
  }, []);

  const fetchTopNews = async () => {
    try {
      setLoading(true);
      console.log('Fetching news...');
      
      const response = await fetch(`${API_V5_BASE_URL}/topnewsweb/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: TopNewsResponse = await response.json();
      console.log('Data received:', data);
      setNewsData(data.topnews || []);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'હમણાં જ';
    } else if (diffInHours < 24) {
      return `${diffInHours} કલાક પહેલાં`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} દિવસ પહેલાં`;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const stripHtml = (html: string) => {
    if (typeof window !== 'undefined') {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    }
    return html.replace(/<[^>]*>/g, '');
  };

  const handleNewsClick = (news: NewsItem) => {
    console.log('News clicked:', news.slug);
    window.open(`${MEDIA_BASE_URL}/${news.slug}`, '_blank');
  };

  // if (loading) {
  //   return (
  //     <div style={{ padding: '20px', textAlign: 'center' }}>
  //       <h2>ટોપ ન્યૂઝ</h2>
  //       <p>લોડ થઈ રહ્યું છે...</p>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>ટોપ ન્યૂઝ</h2>
        <p>ભૂલ: {error}</p>
        <button onClick={fetchTopNews}>ફરી પ્રયાસ કરો</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>ટોપ ન્યૂઝ ({newsData.length} items)</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {newsData.slice(0, 8).map((news, index) => (
          <div 
            key={news.id} 
            style={{ 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              padding: '15px', 
              cursor: 'pointer',
              backgroundColor: '#fff'
            }}
            onClick={() => handleNewsClick(news)}
          >
            {(news.featureImage || news.imageURL) && (
              <img
                src={news.featureImage || news.imageURL || '/images/news-default.png'}
                alt={news.title}
                style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/news-default.png';
                }}
              />
            )}
            
            <h3 style={{ fontSize: '16px', margin: '10px 0' }}>
              {truncateText(news.title, 80)}
            </h3>
            
            <p style={{ fontSize: '14px', color: '#666', margin: '10px 0' }}>
              {truncateText(stripHtml(news.description), 120)}
            </p>
            
            <div style={{ fontSize: '12px', color: '#888', display: 'flex', justifyContent: 'space-between' }}>
              <span>{isMounted ? formatDate(news.updated_at) : ''}</span>
              <span>{news.viewer} વ્યૂઝ</span>
            </div>
            
            <div style={{ marginTop: '10px' }}>
              <span style={{ 
                background: '#850E00', 
                color: 'white', 
                padding: '4px 8px', 
                borderRadius: '12px', 
                fontSize: '11px' 
              }}>
                {news.category_slugs.split(',')[0]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
