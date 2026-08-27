'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { API_BASE_URL, getCategoryIds, DEFAULT_API_PARAMS, API_ENDPOINTS } from '@/constants/api';
import { getNewsDetailUrl } from '@/utils/newsUtils';
import SEOHead from '@/components/SEOHead';
import { generateNewsDetailSEO } from '@/utils/seoUtils';

interface NewsDetailProps {
  categorySlug: string;
  newsSlug: string;
  subcategorySlug?: string;
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

const NewsDetailGSTV: React.FC<NewsDetailProps> = ({ categorySlug, newsSlug, subcategorySlug }) => {
  const [mounted, setMounted] = useState(false);
  const [newsData, setNewsData] = useState<NewsDetailData | null>(null);
  const [relatedNews, setRelatedNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [processedContent, setProcessedContent] = useState<string>('');

  // Function to process content and embed social media
  const processContentWithEmbeds = (content: string): string => {
    let processedContent = content;

    // YouTube embed
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
    processedContent = processedContent.replace(youtubeRegex, (match, videoId) => {
      return `<div style="margin: 20px 0; text-align: center;">
        <iframe
          width="100%"
          height="400"
          src="https://www.youtube.com/embed/${videoId}"
          frameborder="0"
          allowfullscreen
          style="max-width: 560px; border-radius: 8px;"
        ></iframe>
      </div>`;
    });

    // Twitter embed
    const twitterRegex = /https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/g;
    processedContent = processedContent.replace(twitterRegex, (match, tweetId) => {
      return `<div style="margin: 20px 0; text-align: center;">
        <blockquote class="twitter-tweet" data-theme="light">
          <a href="${match}"></a>
        </blockquote>
      </div>`;
    });

    // Facebook embed
    const facebookRegex = /https?:\/\/(?:www\.)?facebook\.com\/[^\/]+\/posts\/([^\/\?]+)/g;
    processedContent = processedContent.replace(facebookRegex, (match) => {
      return `<div style="margin: 20px 0; text-align: center;">
        <div class="fb-post"
             data-href="${match}"
             data-width="500"
             data-show-text="true">
        </div>
      </div>`;
    });

    // Instagram embed
    const instagramRegex = /https?:\/\/(?:www\.)?instagram\.com\/p\/([a-zA-Z0-9_-]+)/g;
    processedContent = processedContent.replace(instagramRegex, (match, postId) => {
      return `<div style="margin: 20px 0; text-align: center;">
        <blockquote class="instagram-media"
                    data-instgrm-permalink="${match}"
                    data-instgrm-version="14"
                    style="max-width: 540px; margin: 0 auto;">
        </blockquote>
      </div>`;
    });

    // PDF embed
    const pdfRegex = /(https?:\/\/[^\s]+\.pdf)/g;
    processedContent = processedContent.replace(pdfRegex, (match) => {
      return `<div style="margin: 20px 0; text-align: center;">
        <div style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background: #f5f5f5; padding: 10px; font-weight: bold; color: #333;">
            📄 PDF Document
          </div>
          <iframe
            src="${match}"
            width="100%"
            height="600"
            style="border: none;"
            title="PDF Viewer">
          </iframe>
          <div style="padding: 10px; background: #f9f9f9;">
            <a href="${match}" target="_blank" style="color: #337ab7; text-decoration: none;">
              📥 Download PDF
            </a>
          </div>
        </div>
      </div>`;
    });

    return processedContent;
  };

  // Function to fetch single news article using internal API route
  const fetchSingleNews = async (slug: string, isFirstCall: boolean = true, retryCount: number = 0) => {
    console.log(`🔍 [NewsDetailGSTV] Fetching news with slug: "${slug}"`);
    console.log(`📍 [NewsDetailGSTV] Category: ${categorySlug}, Subcategory: ${subcategorySlug || 'none'}`);

    // Calculate category IDs based on URL structure
    const categoryIds = getCategoryIds(categorySlug, subcategorySlug);
    console.log(`🏷️ [NewsDetailGSTV] Calculated categoryIds: "${categoryIds}"`);

    // Use internal API route that handles category ID mapping
    const params = {
      slug: slug,
      user_id: DEFAULT_API_PARAMS.user_id,
      device_id: DEFAULT_API_PARAMS.device_id,
      loadedSlugs: '',
      categoryIds: categoryIds
    };

    console.log(`📤 [NewsDetailGSTV] API Request params:`, params);

    try {
      const response = await fetch(API_ENDPOINTS.NEWS_NEXT_CONTENT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status >= 500 && retryCount < 2) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          return fetchSingleNews(slug, isFirstCall, retryCount + 1);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.message && result.exception && result.file) {
        throw new Error(`Server error: ${result.message}`);
      }

      return result;
    } catch (error) {
      if (retryCount < 2) {
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

      const data = await fetchSingleNews(newsSlug, true);
      
      let newsDetail = null;
      if (data.newsDetail && Array.isArray(data.newsDetail) && data.newsDetail.length > 0) {
        newsDetail = data.newsDetail[0];
      } else if (data.newsDetail && typeof data.newsDetail === 'object' && !Array.isArray(data.newsDetail)) {
        newsDetail = data.newsDetail;
      } else if (data && data.id && data.title) {
        newsDetail = data;
      } else {
        setError('No news data found in API response');
        setLoading(false);
        return;
      }

      if (newsDetail) {
        setNewsData(newsDetail);

        // Process content with social media embeds
        const processed = processContentWithEmbeds(newsDetail.description);
        setProcessedContent(processed);

        if (data.bookmark !== undefined) {
          setIsBookmarked(data.bookmark === 1);
        } else if (newsDetail.bookmark !== undefined) {
          setIsBookmarked(newsDetail.bookmark === 1);
        }

        if (data.relatednews && Array.isArray(data.relatednews)) {
          setRelatedNews(data.relatednews);
        }
      }

    } catch (err) {
      console.error('[NewsDetailGSTV] Error loading news detail:', err);
      
      // Mock data for development
      if (process.env.NODE_ENV === 'development') {
        const mockNewsData = {
          id: 1,
          title: 'Sample News Article - API Currently Unavailable',
          englishTitle: 'Sample News Article',
          slug: newsSlug,
          description: '<p>This is a sample news article displayed because the staging API is currently experiencing issues.</p>',
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

  useEffect(() => {
    if (mounted && newsSlug) {
      loadNewsDetail();
    }
  }, [mounted, newsSlug]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reload social media widgets when content changes
  useEffect(() => {
    if (processedContent && typeof window !== 'undefined') {
      // Reload Twitter widgets
      if ((window as any).twttr && (window as any).twttr.widgets) {
        (window as any).twttr.widgets.load();
      }

      // Reload Facebook widgets
      if ((window as any).FB && (window as any).FB.XFBML) {
        (window as any).FB.XFBML.parse();
      }

      // Reload Instagram widgets
      if ((window as any).instgrm && (window as any).instgrm.Embeds) {
        (window as any).instgrm.Embeds.process();
      }
    }
  }, [processedContent]);

  // Loading state
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Loading news article...</div>
      </div>
    );
  }

  // Error state
  if (error && !newsData) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>
          <h4>⚠️ Unable to Load News</h4>
          <p>{error}</p>
          <button onClick={() => loadNewsDetail()}>🔄 Try Again</button>
          <button onClick={() => window.location.href = '/'}>🏠 Go to Homepage</button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Head */}
      {newsData && (
        <SEOHead
          seoData={generateNewsDetailSEO(newsData, categorySlug)}
          pageType="article"
        />
      )}

      {/* Social Media Scripts */}
      <Script
        src="https://platform.twitter.com/widgets.js"
        strategy="lazyOnload"
        onLoad={() => {
          if (typeof window !== 'undefined' && (window as any).twttr) {
            (window as any).twttr.widgets.load();
          }
        }}
      />

      <Script
        src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0"
        strategy="lazyOnload"
        onLoad={() => {
          if (typeof window !== 'undefined' && (window as any).FB) {
            (window as any).FB.XFBML.parse();
          }
        }}
      />

      <Script
        src="https://www.instagram.com/embed.js"
        strategy="lazyOnload"
        onLoad={() => {
          if (typeof window !== 'undefined' && (window as any).instgrm) {
            (window as any).instgrm.Embeds.process();
          }
        }}
      />

      {/* GSTV Exact Layout */}
      <div className="news-detail-container">
        {/* Breadcrumb - Exact GSTV Style */}
        <div className="breadcrumb-container" style={{
          backgroundColor: '#fff',
          padding: '8px 15px',
          fontSize: '13px',
          borderBottom: '1px solid #ddd',
          fontFamily: '"Hind Vadodara", sans-serif'
        }}>
          <a href="/" className="breadcrumb-link" style={{ color: '#337ab7', textDecoration: 'none' }}>Home</a>
          <span style={{ margin: '0 5px', color: '#999' }}>/</span>
          <a href={`/category/${categorySlug}`} className="breadcrumb-link" style={{ color: '#337ab7', textDecoration: 'none' }}>
            {categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)}
          </a>
          {subcategorySlug && (
            <>
              <span style={{ margin: '0 5px', color: '#999' }}>/</span>
              <a href={`/category/${categorySlug}/${subcategorySlug}`} className="breadcrumb-link" style={{ color: '#337ab7', textDecoration: 'none' }}>
                {subcategorySlug.charAt(0).toUpperCase() + subcategorySlug.slice(1)}
              </a>
            </>
          )}
          <span style={{ margin: '0 5px', color: '#999' }}>/</span>
          <span className="custom-gujrati-font" style={{ color: '#999' }}>
            {(subcategorySlug || categorySlug).charAt(0).toUpperCase() + (subcategorySlug || categorySlug).slice(1)} : <em>{newsData?.title}</em>
          </span>
        </div>

        {/* Main Content Container */}
        <div className="Center-main-div" style={{ maxWidth: '1200px', margin: '0 auto', padding: '15px' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            {/* Main Content Area */}
            <div className="news-detail-content" style={{ flex: '1', backgroundColor: '#fff', padding: '20px', borderRadius: '5px' }}>
              {newsData && (
                <>
                  {/* News Title */}
                  <h1 className="news-title custom-gujrati-font">
                    {newsData.title}
                  </h1>

                  {/* Meta Info Bar */}
                  <div className="news-meta-bar">
                    <div className="last-update-blog">
                      છેલ્લું અપડેટ : {new Date(newsData.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>

                    <div className="share-section">
                      <span style={{ fontSize: '13px', color: '#666' }}>Share With:</span>
                      <div className="social-share-icons">
                        <img src="/assets/images/ico_facebook.svg" alt="Facebook" />
                        <img src="/assets/images/ico_twitter.svg" alt="Twitter" />
                        <img src="/assets/images/ico_whatsapp.svg" alt="WhatsApp" />
                        <img src="/assets/images/ico_telegram.svg" alt="Telegram" />
                      </div>
                    </div>
                  </div>

                  {/* Media Section - Video or Image */}
                  <div className="news-media-section">
                    {newsData.videoURL ? (
                      <video
                        className="news-video"
                        controls
                        poster={newsData.featureImage || "/assets/images/gstv-logo-bg.png"}
                      >
                        <source src={newsData.videoURL} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img
                        className="news-image"
                        src={newsData.featureImage || "/assets/images/gstv-logo-bg.png"}
                        alt={newsData.title}
                      />
                    )}
                  </div>

                  {/* Source Label */}
                  <div className="news-source">
                    <strong>Source :</strong> GSTV
                  </div>

                  {/* News Content with Embedded Social Media */}
                  <div className="news-content custom-gujrati-font desc-text">
                    <div dangerouslySetInnerHTML={{ __html: processedContent || newsData.description }} />
                  </div>

                  {/* Tags Section */}
                  {newsData.tags && (
                    <div className="news-tags-section">
                      <div className="news-tags-title">
                        TOPICS:
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {newsData.tags.split(',').map((tag, index) => (
                          <a
                            key={index}
                            href={`/tags/${tag.trim().toLowerCase().replace(/\s+/g, '-')}`}
                            className="news-tag"
                          >
                            {tag.trim()}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Related News Section */}
                  {relatedNews.length > 0 && (
                    <div className="related-news-section">
                      <h3 className="related-news-title custom-gujrati-font" style={{ textAlign: 'center' }}>
                        આ પણ વાંચો :
                      </h3>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '15px'
                      }}>
                        {relatedNews.slice(0, 4).map((item, index) => (
                          <div key={index} style={{
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            overflow: 'hidden',
                            backgroundColor: '#fff'
                          }}>
                            <img
                              src={item.featureImage || "/assets/images/gstv-logo-bg.png"}
                              alt={item.title}
                              style={{
                                width: '100%',
                                height: '150px',
                                objectFit: 'cover'
                              }}
                            />
                            <div style={{ padding: '12px' }}>
                              <h4 style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: '#333',
                                marginBottom: '8px',
                                lineHeight: '1.3',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}>
                                <Link href={getNewsDetailUrl(item, categorySlug, subcategorySlug)} style={{
                                  color: '#333',
                                  textDecoration: 'none'
                                }}>
                                  {item.title}
                                </Link>
                              </h4>
                              <p style={{
                                fontSize: '11px',
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsDetailGSTV;
