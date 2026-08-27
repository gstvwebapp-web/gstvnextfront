'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
// Removed commonApiPost import as we're using internal API routes
import styles from './NewsDetailWithInfiniteScroll.module.css';
import { getCategoryIds, DEFAULT_API_PARAMS, API_ENDPOINTS } from '@/constants/api';
import '../styles/smooth-scroll.css';
import '../styles/also-read.css';


interface NewsItem {
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
  categoryIds?: number[] | number; // Add categoryIds from API response
  metatitle?: string;
  metadesc?: string;
  img_credit_txt?: string | null; // Image credit text from API
  relatednews?: NewsItem[]; // Related news array from API response
  relatedNewsIddata?: Array<{
    id: number;
    title: string;
    slug: string;
    featureImage: string | null;
    videoURL: string | null;
    created_at: string;
  }>; // Related news ID data array from API response (8 items)
  categories?: Array<{id: number, title: string, category_name_guj: string, slug: string}>; // Categories array from API
}

interface NewsDetailProps {
  categorySlug: string;
  newsSlug: string;
  subcategorySlug?: string;
}

const NewsDetailWithInfiniteScroll: React.FC<NewsDetailProps> = ({
  categorySlug,
  newsSlug,
  subcategorySlug
}) => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlug, setCurrentSlug] = useState(newsSlug);
  const [categoryIds, setCategoryIds] = useState('');
  const [bookmarkUpdate, setBookmarkUpdate] = useState(0); // Force re-render on bookmark changes

  // Infinite scroll state management (as per requirements)
  const [initialSlug] = useState(newsSlug); // Store initial article slug (never changes)
  const [loadedSlugs, setLoadedSlugs] = useState<string[]>([newsSlug]); // Accumulate ALL viewed slugs
  const [hasMoreData, setHasMoreData] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Throttle mechanism to prevent too many API calls
  const [lastScrollTime, setLastScrollTime] = useState(0);

  // Track consecutive duplicate attempts to prevent infinite loops
  const [consecutiveDuplicateAttempts, setConsecutiveDuplicateAttempts] = useState(0);
  const MAX_DUPLICATE_ATTEMPTS = 2; // Reduced from 3 to 2 to prevent excessive retries

  // Debounce URL updates for smoother transitions (like GSTV)
  const [urlUpdateTimeout, setUrlUpdateTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isUpdatingUrl, setIsUpdatingUrl] = useState(false); // Flag to prevent multiple URL updates

  // Format date function
  const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',  // Nov
      year: 'numeric'
    });
  } catch {
    return 'Unknown Date';
  }
};

  // Enhanced function to process content and embed social media URLs, PDFs, and other media
  const processContent = (content: string) => {
    if (!content) return '';

    // Debug: Check for social media URLs in content
    const twitterUrls = content.match(/(https:\/\/(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/[0-9]+)/g);
    const youtubeUrls = content.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/g);
    const facebookUrls = content.match(/(https:\/\/(?:www\.)?facebook\.com\/[^\/\s]+\/posts\/[^\/\s]+)/g);
    const instagramUrls = content.match(/(https:\/\/(?:www\.)?instagram\.com\/(p|reel)\/[a-zA-Z0-9_-]+)\/?/g);

    console.log(`🔍 Found URLs:`, {
      twitter: twitterUrls?.length || 0,
      youtube: youtubeUrls?.length || 0,
      facebook: facebookUrls?.length || 0,
      instagram: instagramUrls?.length || 0,
      twitterUrls: twitterUrls,
      youtubeUrls: youtubeUrls,
      facebookUrls: facebookUrls,
      instagramUrls: instagramUrls
    });

    let processedContent = content;

    // YouTube embed - Enhanced to handle multiple URL formats
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/g;
    processedContent = processedContent.replace(youtubeRegex, (match, videoId) => {
      return `<div style="margin: 20px 0; text-align: center; border: 1px solid #ddd; border-radius: 8px; padding: 15px; background: #f8f9fa;">
        <div style="background: #ff0000; color: white; padding: 10px; margin: -15px -15px 15px -15px; border-radius: 8px 8px 0 0;">
          🎥 YouTube Video
        </div>
        <iframe
          width="100%"
          height="400"
          src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1"
          frameborder="0"
          allowfullscreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          style="max-width: 560px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"
        ></iframe>
        <div style="margin-top: 10px;">
          <a href="${match}" target="_blank" style="color: #ff0000; text-decoration: none; font-weight: bold;">
            🔗 Watch on YouTube
          </a>
        </div>
      </div>`;
    });

    // Facebook post, video, and reel embed - Enhanced to handle all Facebook content types
    const facebookRegex = /(https:\/\/(?:www\.)?facebook\.com\/(?:[^\/\s]+\/)?(?:posts|videos|reel)\/[^\/\s]+)/g;
    processedContent = processedContent.replace(facebookRegex, (match) => {
      // Determine content type
      const isVideo = match.includes('/videos/');
      const isReel = match.includes('/reel/');
      const contentType = isReel ? 'Reel' : isVideo ? 'Video' : 'Post';

      // For Facebook embeds, we'll use a more reliable approach
      // Facebook's embed system often requires authentication, so we'll provide a styled preview with link
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

            <a href="${match}" target="_blank" style="display: inline-block; background: #1877f2; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; transition: background 0.3s;">
              🔗 Open Facebook ${contentType}
            </a>
          </div>

          <div style="font-size: 12px; color: #65676b;">
            💡 Facebook content opens in a new tab for the best viewing experience
          </div>
        </div>
      </div>`;
    });

    // Instagram post and reel embed - Enhanced to handle real URLs
    const instagramRegex = /(https:\/\/(?:www\.)?instagram\.com\/(p|reel)\/([a-zA-Z0-9_-]+))\/?/g;
    processedContent = processedContent.replace(instagramRegex, (match, _fullUrl, type, postId) => {
      // Clean URL for embed
      const cleanUrl = match.replace(/\/$/, '');
      const embedUrl = `${cleanUrl}/embed/`;

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
            style="border: none; max-width: 100%; background: white; border-radius: 8px;">
          </iframe>
          <div style="padding: 10px; background: #f8f9fa;">
            <a href="${match}" target="_blank" style="color: #e4405f; text-decoration: none; font-weight: bold;">
              🔗 View on Instagram
            </a>
          </div>
        </div>
      </div>`;
    });

    // Twitter/X post embed - Simplified working implementation
    const twitterRegex = /(https:\/\/(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/[0-9]+)/g;
    processedContent = processedContent.replace(twitterRegex, (match) => {
      // Convert x.com URLs to twitter.com for better embed compatibility
      const twitterUrl = match.replace('x.com', 'twitter.com');
      return `<div style="margin: 20px 0; text-align: center; border: 1px solid #ddd; border-radius: 8px; padding: 15px; background: #f8f9fa;">
        <div style="background: #1da1f2; color: white; padding: 10px; margin: -15px -15px 15px -15px; border-radius: 8px 8px 0 0;">
          🐦 Twitter/X Post
        </div>
        <blockquote class="twitter-tweet" data-theme="light" data-width="550" data-dnt="true">
          <a href="${twitterUrl}" target="_blank">View Tweet</a>
        </blockquote>
        <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
        <div style="margin-top: 10px;">
          <a href="${match}" target="_blank" style="color: #1da1f2; text-decoration: none; font-weight: bold;">
            🔗 View on Twitter/X
          </a>
        </div>
      </div>`;
    });

    // Reddit post embed
    const redditRegex = /(https:\/\/(?:www\.)?reddit\.com\/r\/[^\/]+\/comments\/[^\/\s]+)/g;
    processedContent = processedContent.replace(redditRegex, (match) => {
      console.log(`🔴 Embedding Reddit post: ${match}`);
      return `<div style="margin: 20px 0; text-align: center;">
        <div style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden; max-width: 600px; margin: 0 auto;">
          <div style="background: #FF4500; color: white; padding: 10px; font-weight: bold;">
            🔴 Reddit Post
          </div>
          <iframe
            src="${match}?embed=true&theme=light"
            width="100%"
            height="500"
            frameborder="0"
            scrolling="no"
            style="border: none;">
          </iframe>
          <div style="padding: 10px; background: #f9f9f9;">
            <a href="${match}" target="_blank" style="color: #FF4500; text-decoration: none;">
              🔗 View on Reddit
            </a>
          </div>
        </div>
      </div>`;
    });

    // PDF embed - Enhanced with proper PDF viewer and Google Docs fallback
    const pdfRegex = /(https?:\/\/[^\s]+\.pdf)/g;
    processedContent = processedContent.replace(pdfRegex, (match) => {
      // Use Google Docs viewer as fallback for better compatibility
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(match)}&embedded=true`;

      return `<div style="margin: 20px 0; text-align: center;">
        <div style="border: 2px solid #dc3545; border-radius: 12px; overflow: hidden; max-width: 800px; margin: 0 auto; background: white;">
          <div style="background: #dc3545; color: white; padding: 15px; font-weight: bold; display: flex; align-items: center; justify-content: space-between;">
            <span>📄 PDF Document</span>
            <a href="${match}" target="_blank" download style="color: white; text-decoration: none; background: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 6px; font-size: 14px;">
              📥 Download
            </a>
          </div>
          <div style="padding: 20px; background: #f8f9fa;">
            <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">
              📄 PDF document viewer (powered by Google Docs)
            </p>
            <iframe
              src="${googleDocsUrl}"
              width="100%"
              height="500"
              style="border: 1px solid #ddd; border-radius: 8px; background: white;"
              title="PDF Viewer">
              <p>Your browser does not support PDFs.
                <a href="${match}" target="_blank">Download the PDF</a>
              </p>
            </iframe>
            <div style="margin-top: 15px; padding: 10px; background: #e9ecef; border-radius: 6px;">
              <p style="margin: 0; font-size: 12px; color: #666;">
                💡 If the PDF doesn&apos;t load above, try the direct link or download option below.
              </p>
            </div>
          </div>
          <div style="padding: 15px; background: #f1f3f4; text-align: center; border-top: 1px solid #ddd;">
            <a href="${match}" target="_blank" style="color: #dc3545; text-decoration: none; font-weight: bold; margin-right: 20px;">
              🔗 Open PDF Directly
            </a>
            <a href="${match}" target="_blank" download style="color: #28a745; text-decoration: none; font-weight: bold;">
              📥 Download PDF
            </a>
          </div>
        </div>
      </div>`;
    });

    // Generic file embed for other document types (DOC, DOCX, XLS, XLSX, PPT, PPTX)
    const documentRegex = /(https?:\/\/[^\s]+\.(doc|docx|xls|xlsx|ppt|pptx))/g;
    processedContent = processedContent.replace(documentRegex, (match, extension) => {
      console.log(`📋 Embedding document: ${match} (${extension})`);
      const docType = extension.toUpperCase();
      const docIcon = extension.includes('doc') ? '📝' : extension.includes('xls') ? '📊' : '📽️';

      return `<div style="margin: 20px 0; text-align: center;">
        <div style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden; max-width: 600px; margin: 0 auto;">
          <div style="background: #28a745; color: white; padding: 12px; font-weight: bold; display: flex; align-items: center; justify-content: space-between;">
            <span>${docIcon} ${docType} Document</span>
            <a href="${match}" target="_blank" download style="color: white; text-decoration: none; background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; font-size: 12px;">
              📥 Download
            </a>
          </div>
          <div style="padding: 20px; background: #f8f9fa; text-align: center;">
            <p style="margin: 0 0 15px 0; color: #666;">
              ${docIcon} ${docType} file ready for download
            </p>
            <a href="${match}" target="_blank" style="color: #28a745; text-decoration: none; font-weight: bold; background: white; padding: 10px 20px; border-radius: 5px; border: 2px solid #28a745; display: inline-block;">
              📂 Open Document
            </a>
          </div>
        </div>
      </div>`;
    });

    return processedContent;
  };

  // Share functionality
  const handleShare = (platform: string, newsItem: NewsItem) => {
    const url = `${window.location.origin}/news/${categorySlug}/${newsItem.slug}`;
    const title = newsItem.title;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
    }
  };

  // Function to get bookmark icon based on bookmark status
  const getBookmarkIcon = (newsId: number): string => {
    if (typeof window === 'undefined') return '/images/ico_bookmark_line.svg';

    try {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      const isBookmarked = bookmarks.some((bookmark: any) => bookmark.id === newsId);
      const iconPath = isBookmarked ? '/images/ico_bookmark_solid.svg' : '/images/ico_bookmark_line.svg';

      // Add bookmarkUpdate as dependency to force re-evaluation
      console.log(`🔖 Getting bookmark icon for news ${newsId}: ${iconPath} (update: ${bookmarkUpdate})`);

      return iconPath;
    } catch {
      return '/images/ico_bookmark_line.svg';
    }
  };

  // Update bookmark icons when component mounts or bookmarks change
  useEffect(() => {
    const updateBookmarkIcons = () => {
      if (typeof window === 'undefined') return;

      try {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        const bookmarkedIds = bookmarks.map((bookmark: any) => bookmark.id);

        // Update all bookmark icons on the page
        const bookmarkIcons = document.querySelectorAll('[class*="bookmark-icon-"]') as NodeListOf<HTMLImageElement>;
        bookmarkIcons.forEach((icon) => {
          const className = icon.className;
          const match = className.match(/bookmark-icon-(\d+)/);
          if (match) {
            const newsId = parseInt(match[1]);
            if (bookmarkedIds.includes(newsId)) {
              icon.src = '/images/ico_bookmark_solid.svg';
            } else {
              icon.src = '/images/ico_bookmark_line.svg';
            }
          }
        });
      } catch (error) {
        console.error('Error updating bookmark icons:', error);
      }
    };

    updateBookmarkIcons();

    // Listen for storage changes (bookmark updates from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bookmarks') {
        updateBookmarkIcons();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [newsItems]);

  // Bookmark functionality with API integration
  const handleBookmark = async (newsItem: NewsItem) => {
    try {
      console.log('🔖 Bookmarking news item:', newsItem.id, newsItem.title?.substring(0, 50));

      // Import the bookmark function from commonUtils
      const { handleBookmark: handleBookmarkCommon } = await import('@/utils/commonUtils');

      // Call the bookmark API
      const result = await handleBookmarkCommon({
        id: newsItem.id,
        title: newsItem.title,
        slug: newsItem.slug,
        type: 'news'
      });

      console.log('🔖 Bookmark API result:', result);

      // Force update all bookmark icons for this news item
      const bookmarkIcons = document.querySelectorAll(`.bookmark-icon-${newsItem.id}`) as NodeListOf<HTMLImageElement>;
      bookmarkIcons.forEach(icon => {
        if (result) {
          icon.src = '/images/ico_bookmark_solid.svg';
          console.log('✅ Updated bookmark icon to solid for news:', newsItem.id);
        } else {
          icon.src = '/images/ico_bookmark_line.svg';
          console.log('📝 Updated bookmark icon to line for news:', newsItem.id);
        }
      });

      // Trigger bookmark update to force re-render of bookmark icons
      setBookmarkUpdate(prev => prev + 1);

    } catch (error) {
      console.error('❌ Error bookmarking news:', error);
    }
  };



  // State for related news
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);

  // Fetch related news for "આ પણ વાંચો :" sections using categoryIds from API response
  const fetchRelatedNews = useCallback(async () => {
    try {
      // Check if we have the main news item with categoryIds from API response
      let apiCategoryIds = '';

      if (newsItems.length > 0 && newsItems[0].categoryIds) {
        const mainNewsItem = newsItems[0];
        const categoryIdsArray = Array.isArray(mainNewsItem.categoryIds)
          ? mainNewsItem.categoryIds
          : [mainNewsItem.categoryIds];
        apiCategoryIds = categoryIdsArray.join(',');
        console.log('📰 Using categoryIds from API response:', apiCategoryIds);
      } else if (categoryIds) {
        apiCategoryIds = categoryIds;
        console.log('📰 Using categoryIds from props:', apiCategoryIds);
      } else {
        apiCategoryIds = categoryIds; // Default fallback
        console.log('📰 Using default categoryId: 1');
      }

      // Fetch related content using categoryIds (call API only once)
      console.log('🔄 Making related news API call with:', {
        slug: '',
        user_id: '1',
        categoryIds: apiCategoryIds,
        pageNumber: 1
      });

      const response = await fetch('/api/newsnextcontent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: '', // Use empty string if no slug provided
          user_id: DEFAULT_API_PARAMS.user_id,
          device_id: DEFAULT_API_PARAMS.device_id,
          loadedSlugs: '',
          categoryIds: apiCategoryIds
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📥 Related news API response:', data);

        if (data && data.newsDetail) {
          const relatedArray = Array.isArray(data.newsDetail) ? data.newsDetail : [data.newsDetail];

          // Create set of existing news IDs to avoid duplicates
          const existingIds = new Set([
            ...newsItems.map(item => item.id),
            newsItems[0]?.id // Current article ID
          ]);

          // Filter out current news item and any already loaded items
          const filteredRelated = relatedArray.filter((item: any) => {
            // Exclude current article by slug and ID
            if (item.slug === newsSlug || item.slug === currentSlug) return false;
            if (existingIds.has(item.id)) return false;
            return true;
          });

          setRelatedNews(filteredRelated.slice(0, 12)); // Get 12 related articles for multiple sections
          console.log(`✅ Related news set: ${filteredRelated.length} items`);
          console.log('📋 Related news items:', filteredRelated.map((item: any) => ({ id: item.id, title: item.title?.substring(0, 50) })));
          return;
        } else {
          console.warn('⚠️ API response missing newsDetail:', data);
        }
      } else {
        console.error('❌ Related news API call failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
      }

      // Fallback: use other loaded news items
      const fallbackRelated = newsItems.slice(1, 10).filter(item => item.slug !== currentSlug);
      setRelatedNews(fallbackRelated);
    } catch (error) {
      console.error('Error fetching related news:', error);
      // Final fallback to using current news items
      const fallbackRelated = newsItems.slice(1, 10);
      setRelatedNews(fallbackRelated);
    }
  }, [categoryIds, newsItems, currentSlug]);

  // Fetch related news only if not already provided by API response
  useEffect(() => {
    if (newsItems.length > 0 && relatedNews.length === 0) {
      console.log('🔄 No related news from API response, triggering fetchRelatedNews');
      console.log('📰 Main news item categoryIds:', newsItems[0]?.categoryIds);
      // Only call if we don&apos;t already have related news from API response
      fetchRelatedNews();
    } else if (relatedNews.length > 0) {
      console.log('✅ Related news already available from API response:', relatedNews.length);
    }
  }, [newsItems.length, fetchRelatedNews, relatedNews.length]);

  // Function to split content and add dynamic "આ પણ વાંચો :" sections
  const renderContentWithAlsoRead = (content: string, newsIndex: number) => {
    if (!content) return [];

    // Get current article's related news only (not global accumulated)
    const currentArticle = newsItems[newsIndex];
    const currentArticleRelatedNews = currentArticle?.relatedNewsIddata || [];

    // Split content into paragraphs
    const paragraphs = content.split(/\n\s*\n|\r\n\s*\r\n|<\/p>\s*<p>|<br\s*\/?>\s*<br\s*\/?>/).filter(p => p.trim());

    console.log(`📝 Processing content for news ${newsIndex}:`, {
      articleId: currentArticle?.id,
      articleTitle: currentArticle?.title?.substring(0, 50),
      totalParagraphs: paragraphs.length,
      currentArticleRelatedNews: currentArticleRelatedNews.length,
      globalRelatedNews: relatedNews.length,
      paragraphsPreview: paragraphs.slice(0, 3).map(p => p.substring(0, 50) + '...')
    });

    const elements: React.ReactElement[] = [];

    paragraphs.forEach((paragraph, index) => {
      // Clean up paragraph HTML
      const cleanParagraph = paragraph
        .replace(/<\/?p[^>]*>/gi, '')
        .replace(/<br\s*\/?>/gi, '')
        .trim();

      if (cleanParagraph) {
        console.log(`📄 Adding paragraph ${index + 1}/${paragraphs.length}: ${cleanParagraph.substring(0, 50)}...`);

        elements.push(
          <p key={`para-${newsIndex}-${index}`} className={styles.newsContent}>
            <span dangerouslySetInnerHTML={{ __html: cleanParagraph }} />
          </p>
        );

        // Add "આ પણ વાંચો :" section after every 2 paragraphs (only if current article has related news)
        const shouldAddAlsoRead = (index + 1) % 2 === 0 && index < paragraphs.length - 1 && currentArticleRelatedNews.length > 0;
        console.log(`🔍 Paragraph ${index + 1}: shouldAddAlsoRead = ${shouldAddAlsoRead} (index+1=${index+1}, mod2=${(index + 1) % 2}, hasMore=${index < paragraphs.length - 1}, hasRelatedNews=${currentArticleRelatedNews.length > 0})`);

        if (shouldAddAlsoRead) {
          // Calculate which 2 news items to show for this section from CURRENT ARTICLE's relatedNewsIddata
          const sectionIndex = Math.floor(index / 2); // 0, 1, 2, 3...
          const startIndex = sectionIndex * 2; // 0, 2, 4, 6...
          const endIndex = startIndex + 2; // 2, 4, 6, 8...

          // Get 2 related articles for this section from CURRENT ARTICLE's relatedNewsIddata only
          const sectionRelatedNews = currentArticleRelatedNews.slice(startIndex, endIndex);

          console.log(`📰 Adding "આ પણ વાંચો" section after paragraph ${index + 1}:`, {
            articleId: currentArticle?.id,
            sectionIndex,
            startIndex,
            endIndex,
            sectionRelatedNewsCount: sectionRelatedNews.length,
            currentArticleRelatedNewsTotal: currentArticleRelatedNews.length,
            globalRelatedNewsTotal: relatedNews.length,
            sectionItems: sectionRelatedNews.map(item => ({ id: item.id, title: item.title?.substring(0, 30) }))
          });

          if (sectionRelatedNews.length > 0) {
            elements.push(
              <div key={`also-read-${newsIndex}-${index}`} className="also-read-section" style={{
                margin: '30px 0',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '15px',
                  borderBottom: '2px solid #ff6b35',
                  paddingBottom: '8px',
                  display: 'inline-block'
                }}>આ પણ વાંચો :</h3>
                <div className="also-read-items" style={{
                  display: 'grid',
                  gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '15px',
                  marginTop: '15px'
                }}>
                  {sectionRelatedNews.map((relatedNewsItem, relatedIndex) => (
                    <div key={`related-${newsIndex}-${index}-${relatedIndex}`} className="also-read-item" style={{
                      display: 'flex',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}>
                      <Link href={`/news/${categorySlug}/${relatedNewsItem.slug}`} style={{
                        display: 'flex',
                        textDecoration: 'none',
                        color: 'inherit',
                        width: '100%'
                      }}>
                        {relatedNewsItem.featureImage && (
                          <img
                            src={relatedNewsItem.featureImage}
                            alt={relatedNewsItem.title}
                            style={{
                              width: window.innerWidth <= 768 ? '100px' : '120px',
                              height: window.innerWidth <= 768 ? '70px' : '80px',
                              objectFit: 'cover',
                              flexShrink: 0
                            }}
                            loading="lazy"
                          />
                        )}
                        <div style={{
                          padding: '12px',
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <span style={{
                            fontSize: '14px',
                            lineHeight: '1.4',
                            color: '#333',
                            fontWeight: '500',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>{relatedNewsItem.title}</span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
        }
      }
    });

    return elements;
  };

  // Update SEO metadata for current news item (optimized for smooth updates)
  const updateSEOMetadata = useCallback((newsItem: NewsItem) => {
    // Use requestAnimationFrame to ensure smooth updates
    requestAnimationFrame(() => {
      try {
        // ✅ Browser title — English first → metatitle → Gujarati fallback
        const englishTitle = newsItem.englishTitle || newsItem.metatitle || newsItem.title;
        const browserTitle = englishTitle
          ? (englishTitle.includes('GSTV') ? englishTitle : `${englishTitle} | GSTV Gujarat News`)
          : 'GSTV Gujarat News';

        if (document.title !== browserTitle) {
          document.title = browserTitle;
        }

        // Batch DOM updates to prevent layout thrashing
        const metaUpdates = [];

        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        const newDescription = newsItem.metadesc || newsItem.description?.substring(0, 160) || '';
        if (metaDescription) {
          if (metaDescription.getAttribute('content') !== newDescription) {
            metaUpdates.push(() => metaDescription.setAttribute('content', newDescription));
          }
        } else {
          metaUpdates.push(() => {
            const newMetaDesc = document.createElement('meta');
            newMetaDesc.name = 'description';
            newMetaDesc.content = newDescription;
            document.head.appendChild(newMetaDesc);
          });
        }

        // Optimized meta tag update function
        const updateOrCreateMetaTag = (property: string, content: string, isProperty = true) => {
          const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
          let metaTag = document.querySelector(selector);

          if (metaTag) {
            if (metaTag.getAttribute('content') !== content) {
              metaUpdates.push(() => metaTag.setAttribute('content', content));
            }
          } else {
            metaUpdates.push(() => {
              const newTag = document.createElement('meta');
              if (isProperty) {
                newTag.setAttribute('property', property);
              } else {
                newTag.setAttribute('name', property);
              }
              newTag.setAttribute('content', content);
              document.head.appendChild(newTag);
            });
          }
        };

        // Update Open Graph metadata
        const newUrl = `${window.location.origin}/news/${categorySlug}/${newsItem.slug}`;
        updateOrCreateMetaTag('og:title', newsItem.metatitle || newsItem.title);
        updateOrCreateMetaTag('og:description', newDescription);
        updateOrCreateMetaTag('og:url', newUrl);
        updateOrCreateMetaTag('og:type', 'article');

        if (newsItem.featureImage) {
          updateOrCreateMetaTag('og:image', newsItem.featureImage);
        }

        // Update Twitter Card metadata
        updateOrCreateMetaTag('twitter:card', 'summary_large_image', false);
        updateOrCreateMetaTag('twitter:title', newsItem.metatitle || newsItem.title, false);
        updateOrCreateMetaTag('twitter:description', newDescription, false);

        if (newsItem.featureImage) {
          updateOrCreateMetaTag('twitter:image', newsItem.featureImage, false);
        }

        // Execute all DOM updates in a single batch
        metaUpdates.forEach(update => update());

        // Update URL smoothly without page refresh (like GSTV live site)
        // Build dynamic URL based on category and subcategory
        let newUrlPath = '';

        // Check if we have subcategory information
        if (subcategorySlug && subcategorySlug !== categorySlug) {
          newUrlPath = `/news/${categorySlug}/${subcategorySlug}/${newsItem.slug}`;
        } else {
          newUrlPath = `/news/${categorySlug}/${newsItem.slug}`;
        }

        const currentPath = window.location.pathname;

        if (currentPath !== newUrlPath && !isUpdatingUrl) {
          // Set flag to prevent multiple simultaneous updates
          setIsUpdatingUrl(true);

          // Update URL using history.pushState for smooth navigation
          const historyState = {
            newsId: newsItem.id,
            newsSlug: newsItem.slug,
            categorySlug: categorySlug,
            subcategorySlug: subcategorySlug,
            title: newsItem.title,
            categoryIds: categoryIds,
            timestamp: Date.now(),
            isInfiniteScroll: true
          };

          try {
            // Direct history manipulation (like GSTV.in)
            const currentState = window.history.state;

            // Create new state object preserving Next.js internal state
            const newState = {
              ...currentState,
              ...historyState,
              __nextInternalKey: currentState?.__nextInternalKey,
              __nextDefaultLocale: currentState?.__nextDefaultLocale,
              __nextLocale: currentState?.__nextLocale
            };

            // Use original replaceState method to bypass Next.js interception
            const originalMethod = (window as any).__originalReplaceState || window.history.replaceState;
            originalMethod.call(window.history, newState, newsItem.title, newUrlPath);

            // Update current slug for internal state
            setCurrentSlug(newsItem.slug);

            // Dispatch custom event to notify other components
            window.dispatchEvent(new CustomEvent('urlUpdated', {
              detail: { newsItem, newUrlPath, historyState: newState }
            }));

          } catch (error) {
            console.error('Error updating URL:', error);
          } finally {
            // Reset flag for next update
            setTimeout(() => {
              setIsUpdatingUrl(false);
            }, 150);
          }
        }

        // Update canonical URL
        const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (canonical) {
          const newCanonicalUrl = `${window.location.origin}${newUrlPath}`;
          if (canonical.href !== newCanonicalUrl) {
            canonical.href = newCanonicalUrl;
          }
        }

        // Update JSON-LD structured data
        updateStructuredData(newsItem);
      } catch (error) {
        console.error('Error updating SEO metadata:', error);
      }
    });
  }, [categorySlug]);

  // Update JSON-LD structured data for better SEO (optimized for smooth updates)
  const updateStructuredData = useCallback((newsItem: NewsItem) => {
    // Use requestIdleCallback for non-critical updates to avoid blocking
    const updateStructuredDataAsync = () => {
      try {
        // Find existing JSON-LD script with a specific ID for easier management
        let existingScript = document.querySelector('script[id="news-structured-data"]');

        // Create new JSON-LD structured data
        const structuredData: any = {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": newsItem.title,
          "description": newsItem.metadesc || newsItem.description?.substring(0, 160) || '',
          "url": `${window.location.origin}/news/${categorySlug}/${newsItem.slug}`,
          "datePublished": newsItem.created_at,
          "dateModified": newsItem.updated_at,
          "author": {
            "@type": "Organization",
            "name": "GSTV"
          },
          "publisher": {
            "@type": "Organization",
            "name": "GSTV",
            "logo": {
              "@type": "ImageObject",
              "url": `${window.location.origin}/assets/images/gstv-logo.png`
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${window.location.origin}/news/${categorySlug}/${newsItem.slug}`
          }
        };

        // Add image if available
        if (newsItem.featureImage) {
          structuredData.image = {
            "@type": "ImageObject",
            "url": newsItem.featureImage,
            "width": 1200,
            "height": 630
          };
        }

        // Add video if available
        if (newsItem.videoURL) {
          structuredData.video = {
            "@type": "VideoObject",
            "contentUrl": newsItem.videoURL,
            "thumbnailUrl": newsItem.featureImage || ''
          };
        }

        const newContent = JSON.stringify(structuredData);

        // Update existing script or create new one
        if (existingScript) {
          // Only update if content has changed
          if (existingScript.textContent !== newContent) {
            existingScript.textContent = newContent;
          }
        } else {
          // Create new script tag with ID for easier management
          const script = document.createElement('script');
          script.id = 'news-structured-data';
          script.type = 'application/ld+json';
          script.textContent = newContent;
          document.head.appendChild(script);
        }

        console.log(`📊 Structured data updated smoothly for: ${newsItem.title}`);
      } catch (error) {
        console.error('Error updating structured data:', error);
      }
    };

    // Use requestIdleCallback if available, otherwise use setTimeout
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(updateStructuredDataAsync);
    } else {
      setTimeout(updateStructuredDataAsync, 0);
    }
  }, [categorySlug]);

  // Fetch news data from API
  const fetchNewsData = async (slug: string, page: number = 1, isLoadMore: boolean = false) => {
    try {
      // Logic for category IDs:
      // - Page 1 (initial load): Use empty categoryIds to get the specific news article
      // - Page 2+ (infinite scroll): Use extracted categoryIds to get more news from same category
      let requestCategoryIds = '';

      if (page === 1 && !isLoadMore && slug) {
        // First page: Load the specific news article using its slug
        requestCategoryIds = '';
        console.log(`📰 First page: Loading specific article with slug: "${slug}"`);
      } else {
        // Subsequent pages: Load more news using only categoryIds (no slug)
        if (categoryIds) {
          // categoryIds might be a comma-separated string like "1,23"
          requestCategoryIds = categoryIds;
          console.log(`📂 Page ${page}: Loading more news using categoryIds: "${requestCategoryIds}" (no slug)`);
        } else {
          // Fallback: use centralized getCategoryIds function
          requestCategoryIds = getCategoryIds(categorySlug, subcategorySlug);
          console.log(`⚠️ Using fallback category ID: ${requestCategoryIds} for category: ${categorySlug}${subcategorySlug ? `/${subcategorySlug}` : ''}`);
        }
      }

      console.log(`🔄 Fetching news data - Slug: "${slug}", Page: ${page}, LoadMore: ${isLoadMore}, CategoryIds: "${requestCategoryIds}"`);

      const requestBody = {
        slug: slug || '', // Use empty string if no slug provided
        user_id: DEFAULT_API_PARAMS.user_id,
        device_id: DEFAULT_API_PARAMS.device_id,
        loadedSlugs: '',
        categoryIds: requestCategoryIds
      };

      console.log('📤 Request Body:', requestBody);

      // Log the strategy being used
      if (page === 1 && slug) {
        console.log('📋 Strategy: Using specific news slug for first page');
      } else if (requestCategoryIds) {
        console.log('📋 Strategy: Using categoryIds only (no slug) for infinite scroll');
      } else {
        console.log('📋 Strategy: Using fallback category mapping');
      }

      // Use internal API route
      const response = await fetch('/api/newsnextcontent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 API Response for page', page, ':', data);

      // Debug: Check if relatedNewsIddata exists in the response
      if (data && data.data && data.data.length > 0) {
        const firstItem = data.data[0];
        console.log('🔍 First item structure check:', {
          id: firstItem.id,
          hasRelatedNewsIddata: !!firstItem.relatedNewsIddata,
          relatedNewsIddataLength: firstItem.relatedNewsIddata ? firstItem.relatedNewsIddata.length : 0,
          relatedNewsIddataPreview: firstItem.relatedNewsIddata ? firstItem.relatedNewsIddata.slice(0, 2).map((item: any) => ({ id: item.id, title: item.title?.substring(0, 30) })) : []
        });
      }

      // Handle paginated response structure
      if (data && data.data && Array.isArray(data.data)) {
        console.log('📄 Detected paginated response structure');
        return {
          newsDetail: data.data, // Extract news items from data array
          pagination: {
            current_page: data.current_page,
            last_page: data.last_page,
            per_page: data.per_page,
            total: data.total,
            next_page_url: data.next_page_url,
            prev_page_url: data.prev_page_url
          }
        };
      }

      // Handle direct data response (fallback)
      if (data && Array.isArray(data)) {
        console.log('📄 Detected direct array response structure');
        return {
          newsDetail: data
        };
      }

      return data;
    } catch (error) {
      console.error('❌ Error fetching news data:', error);
      throw error;
    }
  };

  // Load initial news
  const loadInitialNews = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔄 Loading initial news for slug: ${currentSlug}`);
      const data = await fetchNewsData(currentSlug, 1);

      if (data && data.newsDetail) {
        const newsArray = Array.isArray(data.newsDetail) ? data.newsDetail : [data.newsDetail];
        console.log(`📰 Initial news loaded: ${newsArray.length} items`);

        setNewsItems(newsArray);

        // Initialize loadedSlugs with the current article slug (as per requirements)
        const initialSlug = newsArray[0]?.slug || currentSlug;
        setLoadedSlugs([initialSlug]);

        // Also initialize GSTV-style slug tracking
        newsSlugsSet.current.clear();
        newsSlugsSet.current.add(initialSlug);

        console.log(`📝 Initialized loadedSlugs with initial article: "${initialSlug}"`);

        // For infinite scroll, always assume there's more data initially
        setHasMoreData(true);
        console.log(`📄 [Infinite Scroll] Initial load complete, assuming more data available`);

        // Extract category IDs from the news item's categories array
        if (newsArray.length > 0) {
          const firstNews = newsArray[0];
          console.log(`🔍 Extracting categoryIds from first news item:`, firstNews);

          let extractedCategoryIds = '';

          // Check if the news item has categories array (from API response structure)
          if (firstNews.categories && Array.isArray(firstNews.categories)) {
            const categoryIdsArray = firstNews.categories.map((cat: any) => cat.id);
            extractedCategoryIds = categoryIdsArray.join(',');
            console.log(`✅ Extracted categoryIds from categories array: [${categoryIdsArray.join(', ')}] -> "${extractedCategoryIds}"`);
          } else if (data.categoryIds) {
            // Fallback: check if API response has categoryIds field
            const apiCategoryIds = data.categoryIds;
            if (Array.isArray(apiCategoryIds)) {
              extractedCategoryIds = apiCategoryIds.join(',');
            } else {
              extractedCategoryIds = apiCategoryIds.toString();
            }
            console.log(`✅ Using categoryIds from API response: "${extractedCategoryIds}"`);
          } else {
            // Check other possible fields that might contain category ID
            if (firstNews.catID) {
              extractedCategoryIds = firstNews.catID.toString();
              console.log(`✅ Found catID in news item: ${extractedCategoryIds}`);
            } else if (firstNews.cat_id) {
              extractedCategoryIds = firstNews.cat_id.toString();
              console.log(`✅ Found cat_id in news item: ${extractedCategoryIds}`);
            } else {
              // Final fallback: use category mapping
              const categoryMap: { [key: string]: string } = {
                'gujarat': '1',
                'india': '47', // Based on API response, India category has ID 47
                'world': '3',
                'business': '4',
                'entertainment': '5',
                'sports': '6',
                'auto-tech': '7',
                'lifestyle': '8',
                'career': '9',
                'trending': '10',
                'videos': '11'
              };

              extractedCategoryIds = categoryMap[categorySlug] || '47';
              console.log(`⚠️ Using fallback mapping for "${categorySlug}": ${extractedCategoryIds}`);
            }
          }

          if (extractedCategoryIds && extractedCategoryIds !== categoryIds) {
            setCategoryIds(extractedCategoryIds);
            console.log(`🏷️ Category IDs updated to: "${extractedCategoryIds}"`);
          }
        }

        // Debug: Check what's in the first news item
        if (newsArray.length > 0) {
          const firstNews = newsArray[0];
          console.log(`🔍 Debugging first news item structure:`, {
            id: firstNews.id,
            title: firstNews.title?.substring(0, 50),
            hasRelatedNewsIddata: !!firstNews.relatedNewsIddata,
            relatedNewsIddataLength: firstNews.relatedNewsIddata ? firstNews.relatedNewsIddata.length : 0,
            hasRelatednews: !!firstNews.relatednews,
            relatednewsLength: firstNews.relatednews ? firstNews.relatednews.length : 0,
            allKeys: Object.keys(firstNews)
          });
        }

        // Use relatedNewsIddata array from API response if available (8 items for "આ પણ વાંચો" sections)
        if (newsArray.length > 0 && newsArray[0].relatedNewsIddata && Array.isArray(newsArray[0].relatedNewsIddata) && newsArray[0].relatedNewsIddata.length > 0) {
          const relatedNewsFromAPI = newsArray[0].relatedNewsIddata;
          console.log(`📰 ✅ Found relatedNewsIddata in API response: ${relatedNewsFromAPI.length} items`);
          console.log('📋 Related news from relatedNewsIddata:', relatedNewsFromAPI.map((item: any) => ({ id: item.id, title: item.title?.substring(0, 50) })));
          setRelatedNews(relatedNewsFromAPI);
        } else if (newsArray.length > 0 && newsArray[0].relatednews && Array.isArray(newsArray[0].relatednews) && newsArray[0].relatednews.length > 0) {
          // Fallback to relatednews array from first news item
          const relatedNewsFromAPI = newsArray[0].relatednews;
          console.log(`📰 ✅ Fallback: Found relatednews in first news item: ${relatedNewsFromAPI.length} items`);
          console.log('📋 Related news from relatednews:', relatedNewsFromAPI.map((item: any) => ({ id: item.id, title: item.title?.substring(0, 50) })));
          setRelatedNews(relatedNewsFromAPI);
        } else if (data.relatednews && Array.isArray(data.relatednews) && data.relatednews.length > 0) {
          // Fallback to relatednews array from data root
          console.log(`📰 ✅ Fallback: Found relatednews in API response root: ${data.relatednews.length} items`);
          console.log('📋 Related news from API root:', data.relatednews.map((item: any) => ({ id: item.id, title: item.title?.substring(0, 50) })));
          setRelatedNews(data.relatednews);
        } else {
          console.log('⚠️ No relatedNewsIddata or relatednews found in API response, will fetch separately');
          console.log('🔍 Available data keys:', Object.keys(data));
          if (newsArray.length > 0) {
            console.log('🔍 Available first news keys:', Object.keys(newsArray[0]));
          }
        }

        // Single news article loaded successfully
        console.log('✅ Single news article loaded successfully');
      } else {
        console.error('❌ No news data received from API');
        setError('કોઈ સમાચાર મળ્યા નથી');
      }
    } catch (error) {
      console.error('❌ Error loading initial news:', error);
      setError('સમાચાર લોડ કરવામાં ભૂલ આવી');
    } finally {
      setLoading(false);
    }
  };

  // Load more news for infinite scroll (as per requirements)
  const loadMoreNews = async () => {
    if (loadingMore) {
      console.log(`🚫 Already loading more news`);
      return;
    }

    // Additional throttling: prevent multiple calls within 1 second
    const now = Date.now();
    if (now - lastScrollTime < 1000) {
      console.log(`🚫 Throttling: Last call was ${now - lastScrollTime}ms ago, waiting...`);
      return;
    }
    setLastScrollTime(now);

    try {
      setLoadingMore(true);
      console.log(`📄 [Infinite Scroll] Loading more news using accumulated loadedSlugs approach`);

      // Get category IDs from URL structure
      const requestCategoryIds = getCategoryIds(categorySlug, subcategorySlug);
      console.log(`📋 Using categoryIds: "${requestCategoryIds}" for category: ${categorySlug}${subcategorySlug ? `/${subcategorySlug}` : ''}`);

      // Use accumulated loadedSlugs (never reset, only grows)
      // IMPORTANT: Send ALL loaded slugs to prevent duplicates
      // The backend API needs the complete list to exclude already-loaded articles
      const currentLoadedSlugsString = loadedSlugs.join(',');
      console.log(`📝 Accumulated loadedSlugs (${loadedSlugs.length} total)`);
      console.log(`📊 LoadedSlugs string length: ${currentLoadedSlugsString.length} characters`);

      // Check if we're hitting potential limits
      if (loadedSlugs.length >= 40) {
        console.warn(`⚠️ WARNING: ${loadedSlugs.length} slugs loaded - this might be hitting backend API limits`);
        console.warn(`⚠️ If infinite scroll stops here, the backend API likely has a 40-record limit`);
      }

      // Call API with empty slug and accumulated loadedSlugs for infinite scroll
      const requestBody = {
        slug: '', // Empty slug for infinite scroll
        user_id: DEFAULT_API_PARAMS.user_id,
        device_id: DEFAULT_API_PARAMS.device_id,
        loadedSlugs: currentLoadedSlugsString,
        categoryIds: requestCategoryIds
      };

      console.log('📤 Infinite Scroll Request Body:', {
        slug: requestBody.slug,
        user_id: requestBody.user_id,
        device_id: requestBody.device_id,
        loadedSlugsCount: loadedSlugs.length,
        loadedSlugsLength: currentLoadedSlugsString.length,
        categoryIds: requestBody.categoryIds
      });
      console.log(`📊 Total news items loaded so far: ${newsItems.length}`);

      const response = await fetch('/api/newsnextcontent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log(`🔍 [DEBUG] Raw API response for infinite scroll:`, data);
      console.log(`🔍 [DEBUG] API response has newsDetail:`, !!data?.newsDetail);
      console.log(`🔍 [DEBUG] Current total items before adding:`, newsItems.length);

      if (data && data.newsDetail) {
        const newNewsArray = [data.newsDetail]; // Wrap single newsDetail in array
        console.log(`📰 Loaded ${newNewsArray.length} more news items:`, newNewsArray.map((item: any) => ({
          id: item.id,
          title: item.title?.substring(0, 50) + '...',
          slug: item.slug
        })));

        // Filter out duplicates before appending new news items
        setNewsItems(prevItems => {
          // Create set of existing news IDs to avoid duplicates
          const existingIds = new Set(prevItems.map(item => item.id));

          // Filter out duplicates from new items
          const uniqueNewItems = newNewsArray.filter((item: any) => !existingIds.has(item.id));
          const duplicateItems = newNewsArray.filter((item: any) => existingIds.has(item.id));

          console.log(`🔍 Duplicate filtering: ${newNewsArray.length} new items, ${uniqueNewItems.length} unique items, ${duplicateItems.length} duplicates`);

          if (duplicateItems.length > 0) {
            console.log(`🚫 Filtered out duplicates:`, duplicateItems.map((item: any) => ({
              id: item.id,
              title: item.title?.substring(0, 50) + '...',
              slug: item.slug
            })));
          }

          if (uniqueNewItems.length === 0) {
            console.log(`⚠️ All new items were duplicates, not adding any`);

            // Track consecutive duplicate attempts
            setConsecutiveDuplicateAttempts(prev => {
              const newCount = prev + 1;
              console.log(`🔄 Consecutive duplicate attempts: ${newCount}/${MAX_DUPLICATE_ATTEMPTS}`);

              if (newCount >= MAX_DUPLICATE_ATTEMPTS) {
                console.log(`🛑 Max duplicate attempts reached, stopping infinite scroll`);
                setHasMoreData(false);
                return newCount;
              }

              // If all items are duplicates, try loading next page automatically (but with longer delay)
              if (newNewsArray.length > 0 && newCount < MAX_DUPLICATE_ATTEMPTS) { // Only if API returned data and under limit
                setTimeout(() => {
                  console.log(`🔄 Auto-trying next page due to duplicates (attempt ${newCount})...`);
                  loadMoreNews();
                }, 1500); // Increased delay from 500ms to 1500ms to prevent rapid API calls
              }

              return newCount;
            });

            return prevItems; // No new unique items
          } else {
            // Reset duplicate attempts counter when we get unique items
            setConsecutiveDuplicateAttempts(0);

            // Add new slugs to accumulated loadedSlugs (as per requirements) - with deduplication
            const newSlugs = uniqueNewItems.map((item: any) => item.slug).filter(Boolean);
            setLoadedSlugs(prevSlugs => {
              // Deduplicate: only add slugs that aren't already in the array
              const uniqueNewSlugs = newSlugs.filter(slug => !prevSlugs.includes(slug));
              const updatedSlugs = [...prevSlugs, ...uniqueNewSlugs];
              console.log(`📝 Updated loadedSlugs: ${updatedSlugs.length} total slugs (added ${uniqueNewSlugs.length} unique, filtered ${newSlugs.length - uniqueNewSlugs.length} duplicates)`);
              console.log(`📝 Current loadedSlugs: [${updatedSlugs.join(', ')}]`);
              return updatedSlugs;
            });
          }

          const updatedItems = [...prevItems, ...uniqueNewItems];
          console.log(`📊 Total news items after append: ${updatedItems.length} (was ${prevItems.length}, added ${uniqueNewItems.length} unique)`);

          // Don&apos;t accumulate related news from multiple articles - each article should use its own relatedNewsIddata
          console.log(`📰 Not merging related news from new articles - each article uses its own relatedNewsIddata`);

          // Log what related news each new article has
          uniqueNewItems.forEach((item: any, index: number) => {
            console.log(`� New article ${index + 1} (ID: ${item.id}) related news:`, {
              hasRelatedNewsIddata: !!item.relatedNewsIddata,
              relatedNewsIddataCount: item.relatedNewsIddata ? item.relatedNewsIddata.length : 0,
              hasRelatednews: !!item.relatednews,
              relatednewsCount: item.relatednews ? item.relatednews.length : 0
            });
          });

          // Log the unique items being added
          console.log(`✅ Adding unique items:`, uniqueNewItems.map((item: any) => ({
            id: item.id,
            title: item.title?.substring(0, 50) + '...',
            slug: item.slug,
            relatedNewsIddata: item.relatedNewsIddata ? item.relatedNewsIddata.length : 0,
            relatednews: item.relatednews ? item.relatednews.length : 0
          })));

          return updatedItems;
        });

        // Check if we have more data based on unique items
        const hasUniqueItems = newNewsArray.some((item: any) => !newsItems.some(existing => existing.id === item.id));

        if (!hasUniqueItems && newNewsArray.length > 0) {
          console.log(`⚠️ All items were duplicates, but API returned data. Will try again later...`);
          // If all items were duplicates but API returned data, we still have more data
          setHasMoreData(true);
        } else {
          setHasMoreData(newNewsArray.length > 0 && hasUniqueItems);
        }

        console.log(`📄 Infinite scroll completed, has more data: ${hasUniqueItems && newNewsArray.length > 0}`);
      } else {
        console.log(`⚠️ No more news items found:`, {
          hasData: !!data,
          hasNewsDetail: !!(data && data.newsDetail),
          isArray: !!(data && data.newsDetail && Array.isArray(data.newsDetail)),
          length: data && data.newsDetail && Array.isArray(data.newsDetail) ? data.newsDetail.length : 'N/A',
          currentTotalItems: newsItems.length,
          loadedSlugsCount: loadedSlugs.length,
          rawData: data
        });
        console.error(`🛑 STOPPING INFINITE SCROLL: API returned no newsDetail after ${newsItems.length} items`);
        console.error(`🛑 This might indicate:`);
        console.error(`   1. Backend API has reached end of available news`);
        console.error(`   2. Backend API has a limit (possibly 40 records)`);
        console.error(`   3. loadedSlugs parameter is too long for backend to handle`);
        console.error(`   4. categoryIds filter is too restrictive`);
        setHasMoreData(false);
      }
    } catch (error) {
      console.error('❌ Error loading more news:', error);
      // Don&apos;t stop infinite scroll on error, just log it
    } finally {
      setLoadingMore(false);
    }
  };

  // GSTV-style infinite scroll implementation
  const newsSlugsSet = useRef(new Set<string>());
  const currentPage = useRef(1);
  const isLoadingRef = useRef(false);

  // Function similar to GSTV's newsnextContent function
  const newsnextContent = useCallback(async (categoryId: string, currentSlug: string) => {
    if (isLoadingRef.current) {
      console.log(`🚫 [GSTV Style] Already loading, skipping...`);
      return;
    }

    console.log(`🔄 [GSTV Style] Loading next content for category: ${categoryId}, current: ${currentSlug}`);
    isLoadingRef.current = true;

    try {
      // Convert Set to comma-separated string like GSTV
      const loadedSlugsString = Array.from(newsSlugsSet.current).join(',');

      const response = await fetch('/api/newsnextcontent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: '', // Empty slug for infinite scroll like GSTV
          user_id: '',
          device_id: '',
          loadedSlugs: loadedSlugsString,
          categoryIds: categoryId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.newsDetail && !newsSlugsSet.current.has(data.newsDetail.slug)) {
        // Add new slug to Set to prevent duplicates
        newsSlugsSet.current.add(data.newsDetail.slug);

        // Add new news item to the list
        setNewsItems(prevItems => [...prevItems, data.newsDetail]);

        console.log(`✅ [GSTV Style] Added new article: ${data.newsDetail.slug}`);
        console.log(`📝 [GSTV Style] Total loaded slugs: ${newsSlugsSet.current.size}`);

        currentPage.current++;
      } else {
        console.log(`⚠️ [GSTV Style] No more content or duplicate found`);
      }
    } catch (error) {
      console.error('❌ [GSTV Style] Error loading next content:', error);
    } finally {
      isLoadingRef.current = false;
    }
  }, []);

  // GSTV-style scroll handler with error handling
  const handleScroll = useCallback(() => {
    try {
      if (isLoadingRef.current || !newsItems.length) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Safety check for valid scroll values
      if (scrollTop < 0 || windowHeight <= 0 || documentHeight <= 0) return;

      // Load more when user scrolls near bottom (exactly like GSTV)
      if (scrollTop + windowHeight >= documentHeight - 100) {
        const categoryId = newsItems[0]?.catID?.split(',')[0] || ''; // Default to India category
        const currentSlug = newsItems[newsItems.length - 1]?.slug || '';

        if (categoryId && currentSlug) {
          newsnextContent(categoryId, currentSlug);
        }
      }

      // URL updates are handled by the separate IntersectionObserver in useEffect
    } catch (error) {
      console.warn('Error in scroll handler:', error);
    }
  }, [newsItems, newsnextContent]);

  // GSTV-style URL updates are now handled by the main urlUpdateObserver below
  // to prevent multiple IntersectionObserver conflicts

 

  // Set categoryIds immediately on mount (before API call)
  useEffect(() => {
    const immediateCategoryIds = getCategoryIds(categorySlug, subcategorySlug);
    if (immediateCategoryIds && immediateCategoryIds !== categoryIds) {
      console.log(`🏷️ Setting immediate categoryIds: "${immediateCategoryIds}" for ${categorySlug}${subcategorySlug ? `/${subcategorySlug}` : ''}`);
      setCategoryIds(immediateCategoryIds);
    }
  }, [categorySlug, subcategorySlug]);

  // Load initial data
  useEffect(() => {
    loadInitialNews();
  }, [currentSlug]);

  // Initialize GSTV-style IntersectionObserver for URL updates (removed to prevent conflicts)
  // URL updates are now handled by the main urlUpdateObserver below



  // Monitor categoryIds state changes
  useEffect(() => {
    // CategoryIds state monitoring (removed console.log for production)
  }, [categoryIds]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.newsSlug) {
        const { newsSlug } = event.state;

        // Find the news item in current items
        const newsItem = newsItems.find(item => item.slug === newsSlug);
        if (newsItem) {
          // Update current slug without triggering URL update
          setCurrentSlug(newsSlug);

          // Scroll to the news item
          const newsElement = document.querySelector(`[data-news-slug="${newsSlug}"]`);
          if (newsElement) {
            newsElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }

          // Update SEO metadata without URL change
          updateSEOMetadata(newsItem);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [newsItems, updateSEOMetadata]);

  // Update SEO metadata when first news item loads (optimized for smooth initial load)
  useEffect(() => {
    if (newsItems.length > 0 && newsItems[0]) {
      const firstNews = newsItems[0];

      // Use requestAnimationFrame to ensure smooth initial load
      requestAnimationFrame(() => {
        // Delay SEO update slightly to prevent blocking initial render
        setTimeout(() => {
          updateSEOMetadata(firstNews);
        }, 100);
      });
    }
  }, [newsItems.length > 0 ? newsItems[0]?.id : null, updateSEOMetadata]);

  // Handle browser back/forward navigation (optimized for smooth transitions)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Prevent any default behavior that might cause refresh
      event.preventDefault?.();

      if (event.state && event.state.newsSlug) {
        const newsSlug = event.state.newsSlug;
        const newsItem = newsItems.find(item => item.slug === newsSlug);

        if (newsItem) {
          // Batch state updates for smooth transition
          requestAnimationFrame(() => {
            setCurrentSlug(newsSlug);

            // Update SEO metadata asynchronously
            updateSEOMetadata(newsItem);

            // Smooth scroll to the news item with optimized settings
            const newsElement = document.querySelector(`[data-news-slug="${newsSlug}"]`);
            if (newsElement) {
              // Use smooth scrolling with better performance
              newsElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
              });
            }

            console.log(`🔙 Browser navigation to: ${newsItem.title.substring(0, 50)}...`);
          });
        }
      }
    };

    // Note: Removed beforeunload event listener to prevent unwanted navigation confirmation popups
    // Users can now navigate freely without browser confirmation dialogs

    window.addEventListener('popstate', handlePopState, { passive: false });

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [newsItems, updateSEOMetadata]);

  // Disabled auto-trigger - using intersection observer instead
  // useEffect(() => {
  //   if (categoryIds && newsItems.length > 0 && hasMoreData && !loadingMore) {
  //     console.log(`🎯 Category IDs now available: "${categoryIds}", checking if we need to load more content`);

  //     // Small delay to ensure DOM is updated, then check scroll position
  //     setTimeout(() => {
  //       handleScroll();
  //     }, 500);
  //   }
  // }, [categoryIds, newsItems.length, hasMoreData, loadingMore, handleScroll]);

  // Enable infinite scroll
  useEffect(() => {
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Auto-trigger load more after initial load (improved for faster response)
  useEffect(() => {
    if (newsItems.length > 0 && !isLoadingRef.current && hasMoreData) {
      console.log(`🎯 Auto-trigger check: newsItems=${newsItems.length}, isLoading=${isLoadingRef.current}, hasMoreData=${hasMoreData}`);

      // Increased delay to prevent conflicts with scroll triggers
      setTimeout(() => {
        if (newsItems.length === 1) { // Only auto-trigger once after initial load
          console.log(`🚀 Auto-triggering GSTV-style load after initial load`);
          const categoryId = newsItems[0]?.catID?.split(',')[0] || '47';
          const currentSlug = newsItems[0]?.slug || '';
          if (categoryId && currentSlug) {
            newsnextContent(categoryId, currentSlug);
          }
        } else {
          console.log(`⏭️ Skipping auto-trigger: newsItems.length = ${newsItems.length} (expected 1)`);
        }
      }, 2000); // Increased from 800ms to 2000ms to prevent conflicts
    } else {
      console.log(`⏸️ Auto-trigger conditions not met: newsItems=${newsItems.length}, isLoading=${isLoadingRef.current}, hasMoreData=${hasMoreData}`);
    }
  }, [newsItems.length, hasMoreData, newsnextContent]);

  // URL update observer - detects which news article is currently in view (like GSTV live site)
  useEffect(() => {
    if (newsItems.length === 0) return;

    let urlUpdateObserver: IntersectionObserver | null = null;

    try {
      urlUpdateObserver = new IntersectionObserver(
        (entries) => {
          try {
            // Safety check: ensure we're still mounted
            if (!newsItems.length) return;

            // Find the most visible article (like GSTV live site)
            let mostVisibleEntry: IntersectionObserverEntry | null = null;
            let maxRatio = 0;

            entries.forEach((entry) => {
              try {
                if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
                  maxRatio = entry.intersectionRatio;
                  mostVisibleEntry = entry;
                }
              } catch (e) {
                console.warn('Error processing intersection entry:', e);
              }
            });

            // Only update URL for the most visible article with sufficient visibility
            if (mostVisibleEntry && maxRatio > 0.3) {
              const newsElement = (mostVisibleEntry as IntersectionObserverEntry).target as HTMLElement;
              const newsSlug = newsElement?.getAttribute('data-news-slug');
              const newsId = newsElement?.getAttribute('data-news-id');

              console.log(`🔍 [URL Observer] Most visible article: slug=${newsSlug}, ratio=${maxRatio.toFixed(2)}, currentSlug=${currentSlug}`);

              if (newsSlug && newsSlug !== currentSlug && newsElement) {
                const newsItem = newsItems.find(item => item.slug === newsSlug || item.id?.toString() === newsId);
                if (newsItem) {
                console.log(`🔄 [URL Observer] Updating URL to: ${newsSlug}`);

                // Debounce URL updates for smoother experience
                if (urlUpdateTimeout) {
                  clearTimeout(urlUpdateTimeout);
                }

                const newTimeout = setTimeout(() => {
                  try {
                    // Use requestAnimationFrame for smooth updates (like GSTV)
                    requestAnimationFrame(() => {
                      try {
                        // Update SEO metadata (includes URL update)
                        updateSEOMetadata(newsItem);
                        console.log(`✅ [URL Observer] URL updated to: /${categorySlug}/${newsSlug}`);

                        // Add visual indicator for current article
                        document.querySelectorAll('.news-item-container').forEach(el => {
                          el.classList.remove('active');
                        });
                        newsElement.classList.add('active');

                        // Subtle visual feedback (less intrusive than before)
                        if (process.env.NODE_ENV === 'development') {
                          try {
                            const urlIndicator = document.createElement('div');
                            urlIndicator.innerHTML = `📍 ${newsItem.title?.substring(0, 25) || 'News'}...`;
                            urlIndicator.style.cssText = `
                              position: fixed;
                              bottom: 20px;
                              right: 20px;
                              background: rgba(220, 53, 69, 0.9);
                              color: white;
                              padding: 6px 10px;
                              border-radius: 4px;
                              font-size: 11px;
                              z-index: 10000;
                              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                              animation: slideIn 0.2s ease-out;
                              backdrop-filter: blur(10px);
                            `;

                            document.body.appendChild(urlIndicator);

                            // Remove indicator after 1.5 seconds
                            setTimeout(() => {
                              try {
                                if (urlIndicator.parentNode) {
                                  urlIndicator.style.opacity = '0';
                                  urlIndicator.style.transform = 'translateY(10px)';
                                  setTimeout(() => {
                                    try {
                                      if (urlIndicator.parentNode) {
                                        urlIndicator.remove();
                                      }
                                    } catch (e) {
                                      console.warn('Error removing URL indicator:', e);
                                    }
                                  }, 200);
                                }
                              } catch (e) {
                                console.warn('Error hiding URL indicator:', e);
                              }
                            }, 1500);
                          } catch (e) {
                            console.warn('Error creating URL indicator:', e);
                          }
                        }
                      } catch (e) {
                        console.error('Error in requestAnimationFrame callback:', e);
                      }
                    });
                  } catch (e) {
                    console.error('Error in setTimeout callback:', e);
                  }
                }, 100); // 100ms debounce for faster, more responsive URL updates

                setUrlUpdateTimeout(newTimeout);
              }
            }
          }
        } catch (error) {
          console.error('Error in intersection observer callback:', error);
        }
      },
      {
        threshold: [0.1, 0.25, 0.5, 0.75, 0.9], // More thresholds for finer detection
        rootMargin: '-10% 0px -10% 0px' // Trigger when article is in the middle 80% of viewport (more sensitive)
      }
    );

      // Observe all news articles with a small delay to ensure DOM is ready
      setTimeout(() => {
        try {
          const newsElements = document.querySelectorAll('[data-news-slug]');

          newsElements.forEach((element) => {
            if (urlUpdateObserver) {
              urlUpdateObserver.observe(element);
            }
          });
        } catch (e) {
          console.warn('Error setting up intersection observer:', e);
        }
      }, 100);

    } catch (error) {
      console.error('Error creating intersection observer:', error);
    }

    return () => {
      try {
        if (urlUpdateObserver) {
          urlUpdateObserver.disconnect();
        }

        // Clean up any pending URL update timeout
        if (urlUpdateTimeout) {
          clearTimeout(urlUpdateTimeout);
        }
      } catch (e) {
        console.warn('Error cleaning up intersection observer:', e);
      }
    };
  }, [newsItems.length, currentSlug, updateSEOMetadata, categorySlug]); // Added categorySlug dependency

  // Removed fallback scroll handler - using intersection observer only

  // Auto-trigger removed - single news article only

  // Load external scripts for social media embeds and setup URL handling
  useEffect(() => {
    // Override Next.js router to prevent URL interception
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    // Store original methods for restoration
    (window as any).__originalPushState = originalPushState;
    (window as any).__originalReplaceState = originalReplaceState;

    // Override history methods to prevent Next.js interception
    window.history.pushState = function(state: any, title: string, url?: string | URL | null) {
      return originalPushState.call(this, state, title, url);
    };

    window.history.replaceState = function(state: any, title: string, url?: string | URL | null) {
      return originalReplaceState.call(this, state, title, url);
    };

    // Load Twitter widgets script
    if (typeof window !== 'undefined' && !(window as any).twttr) {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      document.head.appendChild(script);
    }

    // Load Facebook SDK
    if (typeof window !== 'undefined' && !(window as any).FB) {
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0';
      script.async = true;
      document.head.appendChild(script);
    }

    return () => {
      // Restore original history methods
      if ((window as any).__originalPushState) {
        window.history.pushState = (window as any).__originalPushState;
      }
      if ((window as any).__originalReplaceState) {
        window.history.replaceState = (window as any).__originalReplaceState;
      }
    };
  }, []);

  // Reload Twitter widgets when content changes
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).twttr && (window as any).twttr.widgets) {
      (window as any).twttr.widgets.load();
    }
  }, [newsItems.length]);

  // Clear loadedSlugs when navigating away from the page entirely (as per requirements)
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log(`🧹 Page unload detected, clearing loadedSlugs`);
      setLoadedSlugs([]);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log(`👁️ Page hidden, preserving loadedSlugs for potential return`);
        // Don't clear on visibility change - only on actual navigation away
      }
    };

    // Only clear on actual page unload (navigation away)
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Disabled URL update observer to prevent continuous API calls
  // URL updates will be handled manually when needed

  // Removed duplicate scroll trigger observer - using single optimized observer above

  if (loading) {
    return (
      <div className={styles.newsDetailLoading}>
        <div className={styles.loadingSpinner}></div>
        <p>સમાચાર લોડ થઈ રહ્યા છે...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.newsDetailError}>
        <h2>ભૂલ આવી</h2>
        <p>{error}</p>
        <button onClick={loadInitialNews} className={styles.retryButton}>
          ફરી પ્રયાસ કરો
        </button>
      </div>
    );
  }

  return (
    <div className={styles.newsDetailContainer}>
     

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/">હોમ</Link>
        <span> / </span>
        <Link href={`/category/${categorySlug}`}>{categorySlug}</Link>
        <span> : </span>
        <span>{newsItems[0]?.title}</span>
      </div>

      {/* All News Items - Show all loaded articles for infinite scroll */}
      {newsItems.map((newsItem, index) => (
        <React.Fragment key={`news-fragment-${newsItem.id}-${index}`}>
        <article
          key={`${newsItem.id}-${index}`}
          className={`${styles.newsItemContainer} nextstorydiv news-item-container`}
          data-news-id={newsItem.id}
          data-news-slug={newsItem.slug}
          data-slug={newsItem.slug}
          data-title={newsItem.title}
          data-category={categorySlug}
        >
          {/* News Title */}
          <h1 className={styles.newsTitle}>{newsItem.title}</h1>

          {/* News Meta */}
          <div className={styles.newsMeta}>
            <div className={styles.newsDate}>
              <img src="/assets/icons/clock.webp" alt="Time" />
              <span>છેલ્લું અપડેટ : {formatDate(newsItem.created_at)}</span>
            </div>

            <div className={styles.newsActions}>
              <Link href="/livetv" className={styles.liveTvLink}>
                <img src="/assets/images/live-ico.svg" alt="Live TV" />
              </Link>
              <Link href="https://news.google.com/publications/CAAqIAgKIhpDQklTRFFnTWFna0tCMmR6ZEhZdWFXNG9BQVAB?hl=gu-IN&gl=IN&ceid=IN%3Agu" className={styles.googleNewsLink}>
                <img src="/assets/images/Google_News_icon.svg" alt="Google News" />
              </Link>
              
              {/* Share buttons */}
              <div  className={`${styles.shareButtons} shareBtn`}>
                <span>Share With: </span>
                <button
                  className={`${styles.shareBtn} facebook`}
                  onClick={() => handleShare('facebook', newsItem)}
                  title="Share on Facebook"
                >
                  <i className="fab fa-facebook-f"></i>
                </button>
                <button
                  className={`${styles.shareBtn} twitter`}
                  onClick={() => handleShare('twitter', newsItem)}
                  title="Share on Twitter"
                >
                  <i className="fab fa-twitter"></i>
                </button>
                <button
                  className={`${styles.shareBtn} whatsapp`}
                  onClick={() => handleShare('whatsapp', newsItem)}
                  title="Share on WhatsApp"
                >
                  <i className="fab fa-whatsapp"></i>
                </button>
                <button
                  className={`${styles.shareBtn} telegram`}
                  onClick={() => handleShare('telegram', newsItem)}
                  title="Share on Telegram"
                >
                  <i className="fab fa-telegram"></i>
                </button>
                <button
                  className={styles.bookmarkBtn}
                  onClick={() => handleBookmark(newsItem)}
                  title="બુકમાર્ક કરો"
                >
                  <img
                    src={getBookmarkIcon(newsItem.id)}
                    alt="Bookmark"
                    className={`bookmark-icon-${newsItem.id}`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {newsItem.featureImage && (
            <div className={styles.newsImageContainer}>
              <img
                src={newsItem.featureImage}
                alt={newsItem.title}
                className={styles.newsFeaturedImage}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/images/gstv-logo-bg.png';
                }}
              />
            </div>
          )}

          {/* Source - Only show if img_credit_txt has value */}
          {newsItem.img_credit_txt && (
            <div className={styles.newsSource}>
              <strong>Source :</strong> {newsItem.img_credit_txt}
            </div>
          )}

          {/* News Content with Also Read sections */}
          <div className={styles.newsContentWrapper}>
            {renderContentWithAlsoRead(processContent(newsItem.description), index)}
          </div>

          {/* Tags */}
          {newsItem.tags && (
            <div className={styles.newsTags}>
              <strong>TOPICS:</strong>
              {newsItem.tags.split(',').map((tag, tagIndex) => (
                <Link
                  key={tagIndex}
                  href={`/tags/${tag.trim().toLowerCase().replace(/\s+/g, '-')}`}
                  className={styles.tagLink}
                >
                  {tag.trim()}
                </Link>
              ))}
            </div>
          )}








          {/* Separator between news items (except for the last one) */}
          {index < newsItems.length - 1 && (
            <div style={{
              borderTop: '2px solid #dc3545',
              margin: '40px 0',
              position: 'relative'
            }}>
             
            </div>
          )}
        </article>
        </React.Fragment>
      ))}

      {/* Related News Section at the bottom - Show remaining news from CURRENT ARTICLE's relatedNewsIddata */}
      {(() => {
        // Get current article (first one being displayed)
        const currentArticle = newsItems[0];
        if (!currentArticle?.description || !currentArticle?.relatedNewsIddata || currentArticle.relatedNewsIddata.length === 0) {
          console.log(`📊 Bottom section: No related news for current article`, {
            hasDescription: !!currentArticle?.description,
            hasRelatedNewsIddata: !!currentArticle?.relatedNewsIddata,
            relatedNewsIddataLength: currentArticle?.relatedNewsIddata?.length || 0
          });
          return null;
        }

        const currentArticleRelatedNews = currentArticle.relatedNewsIddata;

        // Calculate how many news items were already shown in "આ પણ વાંચો" sections
        const totalParagraphs = currentArticle.description
          .split(/\n\s*\n|\r\n\s*\r\n|<\/p>\s*<p>|<br\s*\/?>\s*<br\s*\/?>/)
          .filter(p => p.trim()).length;
        const alsoReadSections = Math.floor((totalParagraphs - 1) / 2); // Number of "આ પણ વાંચો" sections
        const itemsShownInAlsoRead = alsoReadSections * 2; // 2 items per section

        // Get remaining news items that weren't shown in "આ પણ વાંચો" sections from CURRENT ARTICLE only
        const remainingNews = currentArticleRelatedNews.slice(itemsShownInAlsoRead);

        console.log(`📊 Bottom section calculation for article ${currentArticle.id}:`, {
          articleTitle: currentArticle.title?.substring(0, 50),
          totalParagraphs,
          alsoReadSections,
          itemsShownInAlsoRead,
          currentArticleRelatedNewsTotal: currentArticleRelatedNews.length,
          remainingNewsCount: remainingNews.length
        });

     
      })()}

      {/* Loading indicator for infinite scroll */}
      {loadingMore && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          borderTop: '1px solid #eee',
          marginTop: '20px'
        }}>
          <div style={{
            display: 'inline-block',
            width: '20px',
            height: '20px',
            border: '2px solid #f3f3f3',
            borderTop: '2px solid #8B0000',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{
            marginTop: '10px',
            color: '#666',
            fontSize: '14px'
          }}>વધુ સમાચાર લોડ કરી રહ્યા છીએ...</p>
        </div>
      )}

     

      {/* No more data indicator */}
      {!hasMoreData && newsItems.length > 1 && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          borderTop: '1px solid #eee',
          marginTop: '20px',
          color: '#666',
          fontSize: '14px'
        }}>
          બધા સમાચાર લોડ થઈ ગયા છે
        </div>
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '6px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          <div>Items: {newsItems.length}</div>
          <div>LoadedSlugs: {loadedSlugs.length}</div>
          <div>HasMore: {hasMoreData ? 'Yes' : 'No'}</div>
          <div>Loading: {loadingMore ? 'Yes' : 'No'}</div>
          <div>CategoryIds: {categoryIds || 'None'}</div>
          <div>Duplicates: {consecutiveDuplicateAttempts}/{MAX_DUPLICATE_ATTEMPTS}</div>
          <div>GlobalRelated: {relatedNews.length}</div>
          <div>CurrentRelated: {newsItems[0]?.relatedNewsIddata?.length || 0}</div>
          <div>CurrentSlug: {currentSlug?.substring(0, 20)}...</div>
        </div>
      )}

      {/* Infinite scroll enabled */}
    </div>
  );
};

export default NewsDetailWithInfiniteScroll;
