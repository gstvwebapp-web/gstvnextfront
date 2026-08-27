'use client';

import { useState, useEffect, useCallback } from 'react';
// Note: SEO meta tags are handled by the page component in App Router
import { API_ENDPOINTS, MEDIA_BASE_URL, DEFAULT_API_PARAMS } from '@/constants/api';

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
  previousslug?: string;
  nextslug?: string;
  like_count: number;
  dislike_count: number;
  bookmark: number;
  category_slugs: string;
  metatitle?: string; // SEO meta title field
  metadesc?: string;  // SEO meta description field
}

export default function NewsDetail({ categorySlug, newsSlug }: NewsDetailProps) {
  console.log(`[NewsDetail] Component initialized with categorySlug: ${categorySlug}, newsSlug: ${newsSlug}`);

  const [mounted, setMounted] = useState(false);
  const [newsData, setNewsData] = useState<NewsDetailData | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsDetailData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingNext, setLoadingNext] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loadedSlugs, setLoadedSlugs] = useState<string[]>([]);
  const [currentCategoryIds, setCurrentCategoryIds] = useState<string>('');
  const [currentSlug, setCurrentSlug] = useState<string>(newsSlug); // Track current slug separately
  const [hasScrolledForNext, setHasScrolledForNext] = useState(false); // Prevent multiple scroll triggers
  const [isScrollThrottled, setIsScrollThrottled] = useState(false); // Throttle scroll events
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(null); // Debounce scroll events

  // Enhanced function to process content and embed social media URLs, PDFs, and other media
  const processContent = (content: string) => {
    if (!content) return '';

    console.log(`🔍 [NewsDetail] Processing content for social media embeds:`, {
      contentLength: content.length,
      contentPreview: content.substring(0, 200) + '...',
      hasTwitter: content.includes('twitter.com') || content.includes('x.com'),
      hasYoutube: content.includes('youtube.com') || content.includes('youtu.be'),
      hasFacebook: content.includes('facebook.com'),
      hasInstagram: content.includes('instagram.com'),
      hasPdf: content.includes('.pdf')
    });

    // Debug: Check for social media URLs in content
    const twitterUrls = content.match(/(https:\/\/(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/[0-9]+)/g);
    const youtubeUrls = content.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/g);
    const facebookUrls = content.match(/(https:\/\/(?:www\.)?facebook\.com\/[^\/\s]+\/posts\/[^\/\s]+)/g);
    const instagramUrls = content.match(/(https:\/\/(?:www\.)?instagram\.com\/(p|reel)\/[a-zA-Z0-9_-]+)\/?/g);

    console.log(`🔍 [NewsDetail] Found URLs:`, {
      twitter: twitterUrls?.length || 0,
      youtube: youtubeUrls?.length || 0,
      facebook: facebookUrls?.length || 0,
      instagram: instagramUrls?.length || 0,
      twitterUrls: twitterUrls,
      youtubeUrls: youtubeUrls
    });

    let processedContent = content;

    // YouTube embed - Enhanced to handle multiple URL formats
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/g;
    processedContent = processedContent.replace(youtubeRegex, (_match, videoId) => {
      console.log(`🎥 [NewsDetail] Embedding YouTube video: ${videoId}`);
      return `<div style="margin: 20px 0; text-align: center;">
        <iframe
          width="100%"
          height="400"
          src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1"
          frameborder="0"
          allowfullscreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          style="max-width: 560px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"
        ></iframe>
      </div>`;
    });

    // Facebook post, video, and reel embed - Enhanced to handle all Facebook content types
    const facebookRegex = /(https:\/\/(?:www\.)?facebook\.com\/(?:[^\/\s]+\/)?(?:posts|videos|reel)\/[^\/\s]+)/g;
    processedContent = processedContent.replace(facebookRegex, (match) => {
      console.log(`📘 [NewsDetail] Embedding Facebook content: ${match}`);

      // Determine content type
      const isVideo = match.includes('/videos/');
      const isReel = match.includes('/reel/');
      const contentType = isReel ? 'Reel' : isVideo ? 'Video' : 'Post';

      // For Facebook embeds, we'll use a more reliable approach
      return `<div style="margin: 20px 0; text-align: center;">
        <div style="border: 2px solid #1877f2; border-radius: 12px; padding: 20px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); max-width: 500px; margin: 0 auto;">
          <div style="background: #1877f2; color: white; padding: 15px; margin: -20px -20px 20px -20px; border-radius: 12px 12px 0 0; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 18px; font-weight: bold;">📘 Facebook ${contentType}</span>
          </div>

          <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div style="width: 40px; height: 40px; background: #1877f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                <span style="color: white; font-weight: bold;">f</span>
              </div>
              <div>
                <div style="font-weight: bold; color: #1c1e21;">Facebook ${contentType}</div>
                <div style="color: #65676b; font-size: 12px;">Click to view on Facebook</div>
              </div>
            </div>

            <div style="background: #f0f2f5; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
              <p style="margin: 0; color: #1c1e21; font-size: 14px;">
                ${isReel ? '🎬 Facebook Reel content' : isVideo ? '🎥 Facebook Video content' : '📝 Facebook Post content'}
              </p>
              <p style="margin: 5px 0 0 0; color: #65676b; font-size: 12px;">
                Click the link below to view this ${contentType.toLowerCase()} on Facebook
              </p>
            </div>

            <a href="${match}" target="_blank" style="display: inline-block; background: #1877f2; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              🔗 Open Facebook ${contentType}
            </a>
          </div>

          <div style="font-size: 12px; color: #65676b;">
            💡 Facebook content opens in a new tab for the best viewing experience
          </div>
        </div>
      </div>`;
    });

    // Instagram post embed - Working version
    const instagramRegex = /(https:\/\/(?:www\.)?instagram\.com\/(p|reel)\/[a-zA-Z0-9_-]+)\/?/g;
    processedContent = processedContent.replace(instagramRegex, (match, _fullUrl, type) => {
      console.log(`📷 [NewsDetail] Embedding Instagram ${type}: ${match}`);
      // Clean URL and add embed
      const cleanUrl = match.replace(/\/$/, ''); // Remove trailing slash
      const embedUrl = `${cleanUrl}/embed`;
      return `<div style="margin: 20px 0; text-align: center;">
        <div style="border: 1px solid #ddd; border-radius: 12px; overflow: hidden; max-width: 400px; margin: 0 auto; background: white;">
          <div style="background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); color: white; padding: 12px; font-weight: bold;">
            📷 Instagram ${type === 'reel' ? 'Reel' : 'Post'}
          </div>
          <iframe
            src="${embedUrl}"
            width="400"
            height="500"
            frameborder="0"
            scrolling="no"
            allowtransparency="true"
            style="border: none; max-width: 100%; display: block;">
          </iframe>
          <div style="padding: 10px; background: #f8f9fa;">
            <a href="${match}" target="_blank" style="color: #e4405f; text-decoration: none; font-weight: bold;">
              🔗 View on Instagram
            </a>
          </div>
        </div>
      </div>`;
    });

    // Twitter/X post embed - Fixed implementation
    const twitterRegex = /(https:\/\/(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/[0-9]+)/g;
    processedContent = processedContent.replace(twitterRegex, (match) => {
      console.log(`🐦 [NewsDetail] Embedding Twitter/X post: ${match}`);
      // Convert x.com URLs to twitter.com for better embed compatibility
      const twitterUrl = match.replace('x.com', 'twitter.com');
      return `<div style="margin: 20px 0; text-align: center;">
        <blockquote class="twitter-tweet" data-theme="light" data-width="550">
          <a href="${twitterUrl}"></a>
        </blockquote>
      </div>`;
    });

    // PDF embed - Enhanced with proper PDF viewer
    const pdfRegex = /(https?:\/\/[^\s]+\.pdf)/g;
    processedContent = processedContent.replace(pdfRegex, (match) => {
      console.log(`📄 [NewsDetail] Embedding PDF document: ${match}`);
      return `<div style="margin: 20px 0; text-align: center;">
        <div style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden; max-width: 800px; margin: 0 auto;">
          <div style="background: #dc3545; color: white; padding: 12px; font-weight: bold; display: flex; align-items: center; justify-content: space-between;">
            <span>📄 PDF Document</span>
            <a href="${match}" target="_blank" download style="color: white; text-decoration: none; background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; font-size: 12px;">
              📥 Download
            </a>
          </div>
          <iframe
            src="${match}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH"
            width="100%"
            height="600"
            style="border: none; background: #f5f5f5;"
            title="PDF Viewer">
            <p>Your browser does not support PDFs.
              <a href="${match}" target="_blank">Download the PDF</a>
            </p>
          </iframe>
          <div style="padding: 10px; background: #f9f9f9; text-align: center;">
            <a href="${match}" target="_blank" style="color: #dc3545; text-decoration: none; font-weight: bold;">
              🔗 Open in New Tab
            </a>
          </div>
        </div>
      </div>`;
    });

    return processedContent;
  };

  // Handle client-side mounting
  useEffect(() => {
    console.log(`[NewsDetail] Component mounting...`);
    setMounted(true);
  }, []);

  // Load external scripts for social media embeds
  useEffect(() => {
    // Load Twitter widgets script
    if (typeof window !== 'undefined' && !(window as Window & { twttr?: any }).twttr) {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        console.log('✅ [NewsDetail] Twitter widgets script loaded');
      };
    }

    // Load Facebook SDK
    if (typeof window !== 'undefined' && !(window as Window & { FB?: any }).FB) {
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0';
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        console.log('✅ [NewsDetail] Facebook SDK loaded');
      };
    }
  }, []);

  // Reload Twitter widgets when content changes
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).twttr?.widgets) {
      (window as any).twttr.widgets.load();
    }
  }, [newsData]);

  // Function to fetch single news article - using newsnextContent API
  const fetchSingleNews = async (slug: string, retryCount: number = 0) => {
    // Updated parameters for newsnextContent API - with new v5 parameters
    const params = {
      slug: slug,
      user_id: DEFAULT_API_PARAMS.user_id,
      device_id: DEFAULT_API_PARAMS.device_id,
      loadedSlugs: '',
      categoryIds: ''
    };
    const formData = new URLSearchParams(params);

    console.log(`[NewsDetail] ===== SINGLE NEWS API CALL (newsnextContent) =====`);
    console.log(`[NewsDetail] URL: ${API_ENDPOINTS.NEWS_NEXT_CONTENT}`);
    console.log(`[NewsDetail] Slug: ${slug}`);
    console.log(`[NewsDetail] Parameters:`, params);
    console.log(`[NewsDetail] Retry count: ${retryCount}`);
    console.log(`[NewsDetail] ===============================`);

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

      console.log(`[NewsDetail] Response status: ${response.status}`);
      console.log(`[NewsDetail] Response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[NewsDetail] Response error:`, errorText);

        // If it's a server error (500) and we haven't retried too many times, try again
        if (response.status >= 500 && retryCount < 2) {
          console.log(`[NewsDetail] Server error detected, retrying in 2 seconds... (attempt ${retryCount + 1})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return fetchSingleNews(slug, retryCount + 1);
        }

        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log(`[NewsDetail] API call successful after ${retryCount} retries`);
      console.log(`[NewsDetail] Raw API response:`, result);
      return result;
    } catch (error) {
      console.error(`[NewsDetail] Fetch error:`, error);

      // If it's a network error and we haven't retried too many times, try again
      if (retryCount < 2) {
        console.log(`[NewsDetail] Network error detected, retrying in 3 seconds... (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        return fetchSingleNews(slug, retryCount + 1);
      }

      throw error;
    }
  };

  // Load single news detail - simplified for single news loading
  const loadNewsDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`[NewsDetail] Loading single news detail for: ${currentSlug}`);

      // Use the simplified API call for single news loading
      const data = await fetchSingleNews(currentSlug);
      console.log(`[NewsDetail] API Response:`, data);

      // Extract news data from API response - the API returns newsDetail as an object at root level
      let newsDetail = null;
      if (data.newsDetail && typeof data.newsDetail === 'object') {
        newsDetail = data.newsDetail;
        console.log(`[NewsDetail] News data extracted successfully:`, newsDetail);
      } else {
        console.error(`[NewsDetail] No newsDetail found in response`);
        console.error(`[NewsDetail] Available keys:`, Object.keys(data));
        setError('No news data found in API response');
        setLoading(false);
        return;
      }

      if (newsDetail) {
        // Set the news data
        setNewsData(newsDetail);
        console.log(`[NewsDetail] Successfully loaded news: ${newsDetail.title}`);

        // Set bookmark status if available
        if (data.bookmark !== undefined) {
          setIsBookmarked(data.bookmark === 1);
        } else if (newsDetail.bookmark !== undefined) {
          setIsBookmarked(newsDetail.bookmark === 1);
        }

        console.log(`[NewsDetail] Single news loaded successfully: ${newsDetail.title}`);
      }

    } catch (err) {
      console.error('[NewsDetail] Error loading news detail:', err);

      // Provide more specific error messages based on error type
      let errorMessage = 'Failed to load news';
      if (err instanceof Error) {
        if (err.message.includes('500')) {
          errorMessage = 'Server is temporarily unavailable. Please try again in a few moments.';
        } else if (err.message.includes('404')) {
          errorMessage = 'News article not found. It may have been moved or deleted.';
        } else if (err.message.includes('Network')) {
          errorMessage = 'Network connection error. Please check your internet connection and try again.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
      setLoadingNext(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    if (mounted && currentSlug) {
      console.log(`[NewsDetail] Component mounted, loading initial news: ${currentSlug}`);
      loadNewsDetail();
    }
  }, [mounted, currentSlug]);

  // Update current slug when newsSlug prop changes
  useEffect(() => {
    if (newsSlug !== currentSlug) {
      console.log(`[NewsDetail] NewsSlug prop changed from ${currentSlug} to ${newsSlug}`);
      setCurrentSlug(newsSlug);
    }
  }, [newsSlug]);

  // Scroll event handler for loading next news
  const handleScroll = useCallback(() => {
    // Prevent multiple calls if already loading, no data, already scrolled, or throttled
    if (loadingNext || !newsData || hasScrolledForNext || isScrollThrottled) return;

    // Clear existing timeout
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }

    // Debounce scroll events - only trigger after 300ms of no scrolling
    const timeout = setTimeout(() => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Load next news when user scrolls to 85% of the page (increased threshold)
      if (scrollTop + windowHeight >= documentHeight * 0.85) {
        console.log(`[NewsDetail] Scroll threshold reached, loading next news...`);
        console.log(`[NewsDetail] Current slug: ${currentSlug}`);
        console.log(`[NewsDetail] Loaded slugs: [${loadedSlugs.join(', ')}]`);

        // Set flags to prevent multiple triggers
        setHasScrolledForNext(true);
        setIsScrollThrottled(true);

        // Throttle for 3 seconds to prevent rapid calls
        setTimeout(() => {
          setIsScrollThrottled(false);
        }, 3000);

        // Load next news using current slug to get the next one from API
        loadNextNewsFromAPI();
      }
    }, 300);

    setScrollTimeout(timeout);
  }, [loadingNext, newsData, hasScrolledForNext, isScrollThrottled, scrollTimeout, currentSlug, loadedSlugs, categorySlug]);

  // Function to load next news from API
  const loadNextNewsFromAPI = async () => {
    try {
      setLoadingNext(true);

      console.log(`[NewsDetail] ===== LOADING NEXT NEWS =====`);
      console.log(`[NewsDetail] Current slug: ${currentSlug}`);
      console.log(`[NewsDetail] Current loaded slugs: [${loadedSlugs.join(', ')}]`);
      console.log(`[NewsDetail] Current category IDs: ${currentCategoryIds}`);
      console.log(`[NewsDetail] API Call will include: slug + categoryId + loadedSlugs`);

      // Call the API with current slug, categoryId, and loaded slugs to get NEXT news
      const data = await fetchSingleNews(currentSlug, 0);
      console.log(`[NewsDetail] Next news API Response:`, data);

      // Extract the next news data from API response
      if (data.newsDetail && typeof data.newsDetail === 'object') {
        const nextNewsDetail = data.newsDetail;

        // Check if this is actually a different news item
        if (nextNewsDetail.slug === currentSlug || nextNewsDetail.id === newsData?.id) {
          console.log(`[NewsDetail] API returned same news, no more news available`);
          setLoadingNext(false);
          setHasScrolledForNext(false); // Reset flag to allow future attempts
          return;
        }

        console.log(`[NewsDetail] Next news data extracted:`, nextNewsDetail);
        console.log(`[NewsDetail] Next news title: ${nextNewsDetail.title}`);
        console.log(`[NewsDetail] Next news slug: ${nextNewsDetail.slug}`);

        // Add current slug to loaded slugs BEFORE updating to next news
        setLoadedSlugs(prev => {
          const prevSlug = currentSlug;
          console.log(`[NewsDetail] Adding previous slug to loaded: ${prevSlug}`);
          return prev.includes(prevSlug) ? prev : [...prev, prevSlug];
        });

        // Update to the new news data
        setNewsData(nextNewsDetail);

        // Update current slug to the new news slug
        const newSlug = nextNewsDetail.slug || nextNewsDetail.id?.toString();
        if (newSlug) {
          setCurrentSlug(newSlug);
          console.log(`[NewsDetail] Updated current slug to: ${newSlug}`);

          // Update URL without page reload
          const newUrl = `/news/${categorySlug}/${newSlug}`;
          console.log(`[NewsDetail] Updating URL to: ${newUrl}`);
          window.history.pushState({}, '', newUrl);
        }

        // Update category IDs if available
        if (nextNewsDetail.catID) {
          setCurrentCategoryIds(nextNewsDetail.catID);
          console.log(`[NewsDetail] Updated category ID to: ${nextNewsDetail.catID}`);
        }

        // Update bookmark status if available
        if (data.bookmark !== undefined) {
          setIsBookmarked(data.bookmark === 1);
        } else if (nextNewsDetail.bookmark !== undefined) {
          setIsBookmarked(nextNewsDetail.bookmark === 1);
        }

        // Update related news if available
        if (data.relatednews && Array.isArray(data.relatednews)) {
          console.log(`[NewsDetail] Updated related news: ${data.relatednews.length} items`);
          setRelatedNews(data.relatednews);
        }

        // Scroll to top of the new article
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          // Reset scroll flag after scrolling to allow next scroll detection
          setTimeout(() => {
            setHasScrolledForNext(false);
            console.log(`[NewsDetail] Reset scroll flag, ready for next scroll detection`);
          }, 1000);
        }, 100);

        console.log(`[NewsDetail] Successfully loaded next news: ${nextNewsDetail.title}`);
        console.log(`[NewsDetail] ===== NEXT NEWS LOADING COMPLETE =====`);
      } else {
        console.log(`[NewsDetail] No more news available from API`);
        setHasScrolledForNext(false); // Reset flag
      }
    } catch (err) {
      console.error('[NewsDetail] Error loading next news:', err);
      setHasScrolledForNext(false); // Reset flag on error
    } finally {
      setLoadingNext(false);
    }
  };

  // Add scroll event listener (disabled when loading to prevent continuous calls)
  useEffect(() => {
    if (mounted && !loadingNext) {
      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
        // Clear any pending scroll timeout
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }
      };
    }
  }, [mounted, handleScroll, loadingNext, scrollTimeout]);

  // Prevent hydration issues
  if (!mounted) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading component...</p>
      </div>
    );
  }

  // Loading state
  if (loading && !newsData) {
    return (
      <div className="news-detail-loading" style={{ padding: '40px', textAlign: 'center' }}>
        <div className="spinner-border" role="status">
          <span className="sr-only">લોડ થઈ રહ્યું છે...</span>
        </div>
        <p>સમાચાર લોડ થઈ રહ્યા છે...</p>
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

  // SEO data will be handled by the page component in App Router

  return (
    <>
      {/* SEO data is available in seoData object for the page component to use */}
      <div className="news-detail-container">
        {/* Breadcrumb Navigation - Matching GSTV Style */}
        <nav aria-label="breadcrumb" style={{
          padding: '15px 20px',
          backgroundColor: '#fff',
          borderBottom: '1px solid #e0e0e0',
          fontSize: '14px',
          color: '#666'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a href="/" style={{ color: '#333', textDecoration: 'none' }}>Home</a>
            <span style={{ color: '#999' }}>/</span>
            <a
              href={`/category/${categorySlug}`}
              style={{ color: '#333', textDecoration: 'none' }}
            >
              {categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)}
            </a>
            <span style={{ color: '#999' }}>/</span>
            <span style={{ color: '#999' }}>
              {newsData?.category_slugs && newsData.category_slugs !== categorySlug ?
                newsData.category_slugs.charAt(0).toUpperCase() + newsData.category_slugs.slice(1) :
                'Bhavnagar'
              }
            </span>
            <span style={{ color: '#999' }}>:</span>
            <span style={{ color: '#666', fontStyle: 'italic' }}>
              {newsData?.englishTitle || 'Policeman arrested for killing 2 in hit-and-run incident'}
            </span>
          </div>
        </nav>

        {/* Main News Content - Matching GSTV Layout */}
        {newsData && (
          <article className="news-article" style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px',
            backgroundColor: '#fff'
          }}>
            {/* News Header - GSTV Style */}
            <header className="news-header" style={{ marginBottom: '25px' }}>
              <h1 className="news-title" style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#333',
                lineHeight: '1.3',
                marginBottom: '15px',
                fontFamily: 'Arial, sans-serif',
                textAlign: 'left'
              }}>
                {newsData.title}
              </h1>

              <div className="news-meta-bar" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1px solid #e0e0e0',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                {/* Left side - Date and Live/Google News icons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div className="news-date" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#666',
                    fontSize: '14px'
                  }}>
                    <img
                      src="/assets/icons/clock.webp"
                      alt="Clock"
                      style={{ width: '16px', height: '16px' }}
                    />
                    છેલ્લું અપડેટ : {new Date(newsData.updated_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <a href={`${MEDIA_BASE_URL}/livetv`} style={{ textDecoration: 'none' }}>
                      <img
                        src="/assets/images/live-ico.svg"
                        alt="Live TV"
                        style={{ width: '20px', height: '20px' }}
                      />
                    </a>
                    <a href="https://news.google.com/publications/CAAqIAgKIhpDQklTRFFnTWFna0tCMmR6ZEhZdWFXNG9BQVAB?hl=gu-IN&gl=IN&ceid=IN%3Agu" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                      <img
                        src="/assets/images/Google_News_icon.svg"
                        alt="Google News"
                        style={{ width: '20px', height: '20px' }}
                      />
                    </a>
                  </div>
                </div>

                {/* Right side - Share and Bookmark */}
                <div className="news-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div className="share-buttons" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#666' }}>Share With:</span>
                    <button className="share-btn facebook" style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px'
                    }}>
                      <div style={{ width: '24px', height: '24px', backgroundColor: '#3b5998', borderRadius: '3px' }}></div>
                    </button>
                    <button className="share-btn twitter" style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px'
                    }}>
                      <div style={{ width: '24px', height: '24px', backgroundColor: '#1da1f2', borderRadius: '3px' }}></div>
                    </button>
                    <button className="share-btn whatsapp" style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px'
                    }}>
                      <div style={{ width: '24px', height: '24px', backgroundColor: '#25d366', borderRadius: '3px' }}></div>
                    </button>
                  </div>

                  <button
                    className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <img
                      src="/assets/images/ico_bookmark.svg"
                      alt="Bookmark"
                      style={{
                        width: '20px',
                        height: '20px',
                        filter: isBookmarked ? 'brightness(0) saturate(100%) invert(85%) sepia(95%) saturate(1352%) hue-rotate(2deg) brightness(119%) contrast(107%)' : 'none'
                      }}
                    />
                  </button>
                </div>
              </div>

              {/* Duplicate meta bar for mobile - GSTV has this */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px'
              }}>
                <img
                  src="/assets/images/Google_News_icon.svg"
                  alt="Google News"
                  style={{ width: '20px', height: '20px' }}
                />
                <button
                  className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <img
                    src="/assets/images/ico_bookmark.svg"
                    alt="Bookmark"
                    style={{
                      width: '20px',
                      height: '20px',
                      filter: isBookmarked ? 'brightness(0) saturate(100%) invert(85%) sepia(95%) saturate(1352%) hue-rotate(2deg) brightness(119%) contrast(107%)' : 'none'
                    }}
                  />
                </button>
              </div>
            </header>

            {/* News Content - GSTV Style */}
            <div className="news-content">
              {/* Feature Image with GSTV placeholder */}
              <div className="news-image" style={{ marginBottom: '25px', textAlign: 'center' }}>
                <img
                  src={newsData.featureImage || "/assets/images/gstv-logo-bg.png"}
                  alt={newsData.title}
                  className="feature-image"
                  style={{
                    width: '100%',
                    maxWidth: '600px',
                    height: 'auto',
                    border: '1px solid #e0e0e0'
                  }}
                />
              </div>

              {/* Source Label - GSTV Style */}
              <div style={{
                marginBottom: '20px',
                fontSize: '14px',
                color: '#666'
              }}>
                <strong>Source :</strong> GSTV
              </div>

              {/* News Description with Social Media Embeds */}
              <div className="news-description" style={{
                fontSize: '16px',
                lineHeight: '1.7',
                color: '#333',
                marginBottom: '30px',
                textAlign: 'justify'
              }}>
                <div dangerouslySetInnerHTML={{ __html: processContent(newsData.description) }} />
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

              {/* Also Read Section - GSTV Style */}
              {relatedNews && relatedNews.length > 0 && (
                <div className="also-read-section" style={{ marginBottom: '30px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: '15px'
                  }}>
                    આ પણ વાંચો :
                  </h3>
                  {relatedNews.slice(0, 2).map((relatedItem, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      marginBottom: '15px',
                      padding: '10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px'
                    }}>
                      <img
                        src={relatedItem.featureImage || "/assets/images/gstv-logo-bg.png"}
                        alt={relatedItem.title}
                        style={{
                          width: '80px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: '#333',
                          margin: '0',
                          lineHeight: '1.4'
                        }}>
                          {relatedItem.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tags Section - GSTV Style */}
              {newsData.tags && (
                <div className="news-tags" style={{
                  padding: '20px 0',
                  borderTop: '1px solid #e0e0e0',
                  marginTop: '30px'
                }}>
                  <strong style={{
                    color: '#333',
                    marginRight: '10px',
                    fontSize: '16px'
                  }}>
                    TOPICS:
                  </strong>
                  {newsData.tags.split(',').map((tag, index) => (
                    <a
                      key={index}
                      href={`/tags/${tag.trim().toLowerCase().replace(/\s+/g, '-')}`}
                      className="tag"
                      style={{
                        display: 'inline-block',
                        backgroundColor: 'transparent',
                        color: '#007bff',
                        padding: '2px 0',
                        margin: '2px 8px 2px 0',
                        fontSize: '14px',
                        textDecoration: 'underline',
                        cursor: 'pointer'
                      }}
                    >
                      {tag.trim()}
                    </a>
                  ))}
                </div>
              )}

              {/* WhatsApp Channel Section - GSTV Style */}
              <div className="whatsapp-section" style={{
                textAlign: 'center',
                margin: '30px 0'
              }}>
                <a
                  href="https://whatsapp.com/channel/0029VaqvWtlDeONF0hwapL2m"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <img
                    src={`${MEDIA_BASE_URL}/public/assets/images/gstvchannel.jpeg`}
                    alt="GSTV WhatsApp Channel"
                    style={{
                      maxWidth: '300px',
                      width: '100%',
                      height: 'auto',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                </a>
              </div>

              {/* App Download Section - GSTV Style */}
              <div className="app-download-section" style={{
                backgroundColor: '#f8f9fa',
                padding: '25px',
                borderRadius: '8px',
                margin: '30px 0',
                textAlign: 'center',
                border: '1px solid #e0e0e0'
              }}>
                <h3 style={{
                  marginBottom: '20px',
                  color: '#333',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  GSTVની એપ્લિકેશન ડાઉનલોડ કરો
                </h3>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '20px',
                  flexWrap: 'wrap'
                }}>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.tops.gstvapps"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <img
                      src={`${MEDIA_BASE_URL}/public/assets/images/play-store.png`}
                      alt="Download from Play Store"
                      style={{ height: '50px', width: 'auto' }}
                    />
                  </a>
                  <a
                    href="https://apps.apple.com/in/app/gstv-gujarat-samachar/id1609602449"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <img
                      src={`${MEDIA_BASE_URL}/public/assets/images/appstore.png`}
                      alt="Download from App Store"
                      style={{ height: '50px', width: 'auto' }}
                    />
                  </a>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* Loading Next News Indicator */}
        {loadingNext && (
          <div className="loading-next-news" style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            zIndex: 9999,
            textAlign: 'center',
            border: '2px solid #007bff'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #007bff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 15px'
            }}></div>
            <p style={{
              fontSize: '16px',
              color: '#333',
              margin: '0',
              fontWeight: '600'
            }}>
              આગળનો સમાચાર લોડ થઈ રહ્યો છે...
            </p>
            <p style={{
              fontSize: '14px',
              color: '#666',
              margin: '5px 0 0 0'
            }}>
              Loading next news...
            </p>
          </div>
        )}

        {/* CSS for spinner animation */}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>

        {/* Scroll Progress Indicator */}
        {!hasScrolledForNext && !loadingNext && (
          <div className="scroll-progress" style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#007bff',
            color: 'white',
            padding: '12px 18px',
            borderRadius: '30px',
            fontSize: '13px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 1000,
            display: mounted ? 'flex' : 'none',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            📰 Scroll for next news
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px'
            }}>
              ↓
            </div>
          </div>
        )}

        {/* Debug Info - Remove in production */}
        {mounted && (
          <div style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '11px',
            zIndex: 999,
            maxWidth: '200px'
          }}>
            <div>Current: {currentSlug}</div>
            <div>Loaded: {loadedSlugs.length}</div>
            <div>Scrolled: {hasScrolledForNext ? 'Yes' : 'No'}</div>
            <div>Loading: {loadingNext ? 'Yes' : 'No'}</div>
          </div>
        )}
      </div>
    </>
  );
}
