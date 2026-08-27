'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { API_ENDPOINTS } from '@/constants/api';

interface NewsDetailProps {
  categorySlug: string;
  newsSlug: string;
}

interface NewsDetailData {
  id: number;
  title: string;
  englishTitle?: string;
  slug: string;
  description: string;
  videoURL?: string;
  featureImage?: string;
  tags?: string;
  catID: string;
  created_at: string;
  updated_at: string;
  like_count: number;
  dislike_count: number;
  bookmark: number;
  category_slugs: string;
  metatitle?: string; // SEO meta title field
  metadesc?: string;  // SEO meta description field
}

interface SEOData {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  ogUrl: string;
  canonicalUrl: string;
}

const NewsDetailSingle: React.FC<NewsDetailProps> = ({ categorySlug, newsSlug }) => {
  const [mounted, setMounted] = useState(false);
  const [newsData, setNewsData] = useState<NewsDetailData | null>(null);
  const [relatedNews, setRelatedNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [seoData, setSeoData] = useState<SEOData | null>(null);

  // Function to fetch single news article
  const fetchSingleNews = async (slug: string, isFirstCall: boolean = true, retryCount: number = 0) => {
    // Set parameters based on whether it's first call or subsequent call
    const params: any = {
      slug: slug,
      user_id: '', // Always blank as per requirement
      device_id: '', // Always blank as per requirement
    };

    if (isFirstCall) {
      // First API call - loadedSlugs and categoryIds should be blank
      params.loadedSlugs = '';
      params.categoryIds = '';
    } else {
      // Subsequent API calls - set loadedSlugs and categoryIds values
      // These would be populated from previous API responses
      params.loadedSlugs = ''; // Will be set when we have loaded slugs
      params.categoryIds = ''; // Will be set when we have category IDs
    }

    const formData = new URLSearchParams(params);

    console.log(`[NewsDetailSingle] ===== SINGLE NEWS API CALL =====`);
    console.log(`[NewsDetailSingle] URL: ,API_ENDPOINTS.NEWS_NEXT_CONTENT`);
    console.log(`[NewsDetailSingle] Parameters:`, params);
    console.log(`[NewsDetailSingle] Form Data:`, formData.toString());
    console.log(`[NewsDetailSingle] Retry count: ${retryCount}`);
    console.log(`[NewsDetailSingle] ===============================`);

    try {
      const response = await fetch(API_ENDPOINTS.NEWS_NEXT_CONTENT, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        body: formData
      });

      console.log(`[NewsDetailSingle] Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[NewsDetailSingle] Response error:`, errorText);

        // If it's a server error (500) and we haven't retried too many times, try again
        if (response.status >= 500 && retryCount < 2) {
          console.log(`[NewsDetailSingle] Server error detected, retrying in 2 seconds... (attempt ${retryCount + 1})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return fetchSingleNews(slug, isFirstCall, retryCount + 1);
        }

        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();

      // Check if the response contains a Laravel error
      if (result.message && result.exception && result.file) {
        throw new Error(`Server error: ${result.message}`);
      }

      console.log(`[NewsDetailSingle] API call successful after ${retryCount} retries`);
      console.log(`[NewsDetailSingle] Raw API response:`, result);
      return result;
    } catch (error) {
      console.error(`[NewsDetailSingle] Fetch error:`, error);
      
      // If it's a network error and we haven't retried too many times, try again
      if (retryCount < 2) {
        console.log(`[NewsDetailSingle] Network error detected, retrying in 3 seconds... (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        return fetchSingleNews(slug, isFirstCall, retryCount + 1);
      }
      
      throw error;
    }
  };

  // Load single news detail
  const loadNewsDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`[NewsDetailSingle] Loading single news detail for: ${newsSlug}`);

      const data = await fetchSingleNews(newsSlug, true); // true = first call
      console.log(`[NewsDetailSingle] API Response:`, data);

      // Extract news data from API response - handle both array and object formats
      let newsDetail = null;

      console.log(`[NewsDetailSingle] Analyzing API response structure:`);
      console.log(`[NewsDetailSingle] Response keys:`, Object.keys(data));
      console.log(`[NewsDetailSingle] newsDetail type:`, typeof data.newsDetail);
      console.log(`[NewsDetailSingle] newsDetail is array:`, Array.isArray(data.newsDetail));

      if (data.newsDetail && Array.isArray(data.newsDetail) && data.newsDetail.length > 0) {
        newsDetail = data.newsDetail[0]; // Get the first news item from array
        console.log(`[NewsDetailSingle] News data extracted from array[0]:`, newsDetail);
      } else if (data.newsDetail && typeof data.newsDetail === 'object' && !Array.isArray(data.newsDetail)) {
        // Handle case where newsDetail is an object (not array)
        newsDetail = data.newsDetail;
        console.log(`[NewsDetailSingle] News data extracted as object:`, newsDetail);
      } else if (data && data.id && data.title) {
        // Handle case where news data is at root level
        newsDetail = data;
        console.log(`[NewsDetailSingle] News data found at root level:`, newsDetail);
      } else {
        console.error(`[NewsDetailSingle] No valid news data found in response`);
        console.error(`[NewsDetailSingle] Full response:`, data);
        setError('No news data found in API response');
        setLoading(false);
        return;
      }

      if (newsDetail) {
        setNewsData(newsDetail);
        console.log(`[NewsDetailSingle] Successfully loaded news: ${newsDetail.title}`);

        // Set SEO data
        if (typeof window !== 'undefined') {
          const currentUrl = `${window.location.origin}/news/${categorySlug}/${newsSlug}`;
          const cleanDescription = newsDetail.description.replace(/<[^>]*>/g, '').substring(0, 160);

          // SEO title priority: metatitle > englishTitle > title
          const seoTitle = newsDetail.metatitle || newsDetail.englishTitle || newsDetail.title;
          const finalTitle = seoTitle.includes('GSTV') ? seoTitle : `${seoTitle} | GSTV News`;

          // SEO description priority: metadesc > englishTitle > cleanDescription
          const seoDescription = newsDetail.metadesc || newsDetail.englishTitle || cleanDescription;

          setSeoData({
            title: finalTitle,
            description: seoDescription,
            keywords: newsDetail.tags || `${categorySlug}, news, gstv, gujarat`,
            ogImage: newsDetail.featureImage || '/assets/images/gstv-logo-bg.png',
            ogUrl: currentUrl,
            canonicalUrl: currentUrl
          });
        }

        // Set bookmark status if available
        if (data.bookmark !== undefined) {
          setIsBookmarked(data.bookmark === 1);
        } else if (newsDetail.bookmark !== undefined) {
          setIsBookmarked(newsDetail.bookmark === 1);
        }

        // Set related news if available
        if (data.relatednews && Array.isArray(data.relatednews)) {
          console.log(`[NewsDetailSingle] Found related news: ${data.relatednews.length} items`);
          setRelatedNews(data.relatednews);
        }
      } else {
        console.error(`[NewsDetailSingle] No news detail found in API response`);
        setError('No news data found');
      }

    } catch (err) {
      console.error('[NewsDetailSingle] Error loading news detail:', err);

      // For development/testing, provide mock data if API fails
      if (process.env.NODE_ENV === 'development') {
        console.log('[NewsDetailSingle] Using mock data for development');
        const mockNewsData = {
          id: 1,
          title: 'Sample News Article - API Currently Unavailable',
          englishTitle: 'Sample News Article',
          slug: newsSlug,
          description: '<p>This is a sample news article displayed because the staging API is currently experiencing issues. The actual news content would be loaded from the API when it\'s working properly.</p><p>The API error was: ' + (err instanceof Error ? err.message : 'Unknown error') + '</p>',
          videoURL: '',
          featureImage: '/assets/images/gstv-logo-bg.png',
          tags: 'sample, development, api-error',
          catID: '1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          like_count: 0,
          dislike_count: 0,
          bookmark: 0,
          category_slugs: categorySlug
        };

        setNewsData(mockNewsData);
        setIsBookmarked(false);
        setRelatedNews([]);
        setLoading(false);
        return;
      }

      // Provide more specific error messages based on error type
      let errorMessage = 'Failed to load news';
      if (err instanceof Error) {
        if (err.message.includes('500')) {
          errorMessage = 'Server is temporarily unavailable. Please try again in a few moments.';
        } else if (err.message.includes('404')) {
          errorMessage = 'News article not found. It may have been moved or deleted.';
        } else if (err.message.includes('Network')) {
          errorMessage = 'Network connection error. Please check your internet connection and try again.';
        } else if (err.message.includes('Server error')) {
          errorMessage = 'The news server is experiencing technical difficulties. Please try again later.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    if (mounted && newsSlug) {
      console.log(`[NewsDetailSingle] Component mounted, loading news: ${newsSlug}`);
      loadNewsDetail();
    }
  }, [mounted, newsSlug]);

  // Set mounted flag
  useEffect(() => {
    setMounted(true);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="news-detail-loading" style={{ padding: '40px', textAlign: 'center' }}>
        <div className="spinner-border" role="status">
          <span className="sr-only">લોડ થઈ રહ્યું છે...</span>
        </div>
        <p style={{ marginTop: '20px' }}>સમાચાર લોડ થઈ રહ્યા છે...</p>
      </div>
    );
  }

  // Error state
  if (error && !newsData) {
    return (
      <div className="news-detail-error" style={{ padding: '40px', textAlign: 'center' }}>
        <div className="alert alert-danger">
          <h4>⚠️ Unable to Load News</h4>
          <p style={{ marginBottom: '20px' }}>{error}</p>
          <div style={{ marginBottom: '15px' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => loadNewsDetail()}
              style={{ marginRight: '10px' }}
            >
              🔄 Try Again
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => window.location.href = '/'}
            >
              🏠 Go to Homepage
            </button>
          </div>
          <small style={{ color: '#666' }}>
            If the problem persists, please try refreshing the page or contact support.
          </small>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Head Section */}
      {seoData && (
        <Head>
          <title>{seoData.title}</title>
          <meta name="description" content={seoData.description} />
          <meta name="keywords" content={seoData.keywords} />
          <link rel="canonical" href={seoData.canonicalUrl} />

          {/* Open Graph Tags */}
          <meta property="og:title" content={seoData.title} />
          <meta property="og:description" content={seoData.description} />
          <meta property="og:image" content={seoData.ogImage} />
          <meta property="og:url" content={seoData.ogUrl} />
          <meta property="og:type" content="article" />
          <meta property="og:site_name" content="GSTV News" />

          {/* Twitter Card Tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={seoData.title} />
          <meta name="twitter:description" content={seoData.description} />
          <meta name="twitter:image" content={seoData.ogImage} />

          {/* Additional Meta Tags */}
          <meta name="author" content="GSTV News" />
          <meta name="robots" content="index, follow" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
      )}

      <div className="news-detail-container" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        {/* Breadcrumb Navigation - Exact GSTV Style */}
        <nav aria-label="breadcrumb" style={{
          padding: '10px 20px',
          backgroundColor: '#fff',
          fontSize: '14px',
          color: '#666',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <a href="/" style={{ color: '#007bff', textDecoration: 'none' }}>Home</a>
            <span style={{ margin: '0 5px' }}>/</span>
            <a href={`/category/${categorySlug}`} style={{ color: '#007bff', textDecoration: 'none' }}>
              {categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)}
            </a>
            <span style={{ margin: '0 5px' }}>/</span>
            <span style={{ color: '#666' }}>
              {categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)} : <em>{newsData?.title || 'News Detail'}</em>
            </span>
          </div>
        </nav>

        {/* Main News Content - Exact GSTV Layout */}
        {newsData && (
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <article className="news-article" style={{
              backgroundColor: '#fff',
              padding: '30px',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              {/* News Title - Exact GSTV Style */}
              <h1 style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#333',
                lineHeight: '1.4',
                marginBottom: '20px',
                fontFamily: 'Arial, sans-serif'
              }}>
                {newsData.title}
              </h1>

              {/* Meta Information - Exact GSTV Style */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                paddingBottom: '15px',
                borderBottom: '1px solid #e0e0e0'
              }}>
                {/* Date and Time */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  <img
                    src="https://www.gstv.in/public/assets/icons/clock.webp"
                    alt="Clock"
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>છેલ્લું અપડેટ : {new Date(newsData.created_at).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}</span>
                </div>

                {/* Social Share and Actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>Share With:</span>

                  {/* Social Share Buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '5px'
                    }}>
                      <img src="/assets/images/ico_facebook.svg" alt="Facebook" style={{ width: '20px', height: '20px' }} />
                    </button>
                    <button style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '5px'
                    }}>
                      <img src="/assets/images/ico_twitter.svg" alt="Twitter" style={{ width: '20px', height: '20px' }} />
                    </button>
                    <button style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '5px'
                    }}>
                      <img src="/assets/images/ico_whatsapp.svg" alt="WhatsApp" style={{ width: '20px', height: '20px' }} />
                    </button>
                    <button style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '5px'
                    }}>
                      <img src="/assets/images/ico_telegram.svg" alt="Telegram" style={{ width: '20px', height: '20px' }} />
                    </button>
                  </div>

                  {/* Bookmark Button */}
                  <button style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: isBookmarked ? '#850E00' : '#666',
                    fontSize: '14px'
                  }}>
                    <img
                      src="/assets/images/ico_bookmark.svg"
                      alt="Bookmark"
                      style={{ width: '16px', height: '16px' }}
                    />
                  </button>
                </div>
              </div>

              {/* Media Section - Video or Image */}
              <div style={{ marginBottom: '25px', textAlign: 'center' }}>
                {newsData.videoURL ? (
                  // Show video if videoURL exists
                  <video
                    controls
                    poster={newsData.featureImage || "/assets/images/gstv-logo-bg.png"}
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      height: 'auto',
                      borderRadius: '8px'
                    }}
                  >
                    <source src={newsData.videoURL} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  // Show image if no videoURL
                  <img
                    src={newsData.featureImage || "/assets/images/gstv-logo-bg.png"}
                    alt={newsData.title}
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      height: 'auto',
                      borderRadius: '8px'
                    }}
                  />
                )}
              </div>

              {/* Source Label - Exact GSTV Style */}
              <div style={{
                marginBottom: '20px',
                fontSize: '16px',
                color: '#333',
                fontWeight: 'bold'
              }}>
                <strong>Source :</strong> GSTV
              </div>

              {/* News Content - Exact GSTV Style */}
              <div style={{
                fontSize: '18px',
                lineHeight: '1.8',
                color: '#333',
                marginBottom: '30px',
                fontFamily: 'Arial, sans-serif'
              }}>
                <div dangerouslySetInnerHTML={{ __html: newsData.description }} />
              </div>

              {/* Video Player - if available */}
              {newsData.videoURL && (
                <div className="news-video" style={{ marginBottom: '25px', textAlign: 'center' }}>
                  <video
                    controls
                    className="video-player"
                    poster={newsData.featureImage}
                    style={{
                      width: '100%',
                      maxWidth: '600px',
                      height: 'auto',
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <source src={newsData.videoURL} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {/* Tags Section - Exact GSTV Style */}
              {newsData.tags && (
                <div style={{
                  marginTop: '30px',
                  marginBottom: '30px'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: '10px'
                  }}>
                    TOPICS:
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {newsData.tags.split(',').map((tag, index) => (
                      <a
                        key={index}
                        href={`/tags/${tag.trim().toLowerCase().replace(/\s+/g, '-')}`}
                        style={{
                          display: 'inline-block',
                          padding: '5px 12px',
                          backgroundColor: '#f8f9fa',
                          color: '#007bff',
                          textDecoration: 'none',
                          borderRadius: '15px',
                          fontSize: '14px',
                          border: '1px solid #e0e0e0'
                        }}
                      >
                        {tag.trim()}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Related News Section - GSTV Style */}
              {relatedNews.length > 0 && (
                <div style={{
                  marginTop: '40px',
                  padding: '30px 0',
                  borderTop: '2px solid #e0e0e0'
                }}>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: '25px',
                    textAlign: 'center'
                  }}>
                    આ પણ વાંચો :
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '20px'
                  }}>
                    {relatedNews.slice(0, 4).map((item, index) => (
                      <div key={index} style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: '#fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s ease'
                      }}>
                        <img
                          src={item.featureImage || "/assets/images/gstv-logo-bg.png"}
                          alt={item.title}
                          style={{
                            width: '100%',
                            height: '180px',
                            objectFit: 'cover'
                          }}
                        />
                        <div style={{ padding: '15px' }}>
                          <h4 style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#333',
                            marginBottom: '10px',
                            lineHeight: '1.4',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            <Link href={`/news/${categorySlug}/${item.slug}`} style={{
                              color: '#333',
                              textDecoration: 'none'
                            }}>
                              {item.title}
                            </Link>
                          </h4>
                          <p style={{
                            fontSize: '12px',
                            color: '#999',
                            margin: '0'
                          }}>
                            {new Date(item.created_at).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </div>
        )}
      </div>
    </>
  );
};

export default NewsDetailSingle;
