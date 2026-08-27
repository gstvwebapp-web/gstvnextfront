/**
 * SEO Utilities for dynamic meta tags
 */
import { MEDIA_BASE_URL, BASE_URLS } from '@/constants/api';

export interface SEOData {
  title: string;
  description: string;
  keywords: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  ogSiteName?: string;
  ogLocale?: string;
  twitterCard?: string;
  twitterSite?: string;
  twitterCreator?: string;
  canonicalUrl?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  videoURL?: string; // Added for video SEO
  hreflangTags?: {
    gu?: string;
    'gu-IN'?: string;
    en?: string;
    'en-IN'?: string;
    'x-default'?: string;
  };
}

/**
 * Generate SEO data for news detail page
 */
export const generateNewsDetailSEO = (newsData: any, categorySlug: string): SEOData => {
  const baseUrl = BASE_URLS.PRODUCTION;//typeof window !== 'undefined' ? window.location.origin : BASE_URLS.PRODUCTION;
  const newsUrl = `${baseUrl}/news/${categorySlug}/${newsData.slug}`;

  // Clean and truncate description
  const cleanDescription = stripHtmlAndTruncate(newsData.description || newsData.content || '', 160);

  // Generate keywords from title and tags
  const titleKeywords = newsData.title ? extractKeywords(newsData.title) : [];
  const tagKeywords = newsData.tags ? newsData.tags.split(',').map((tag: string) => tag.trim()) : [];
  const keywords = [...titleKeywords, ...tagKeywords, 'GSTV', 'Gujarat News', 'Gujarati News'].join(', ');

  // ✅ Browser title — English first for SEO & browser tab readability
  // Priority: englishTitle > metatitle > Gujarati title (last resort fallback)
  const seoTitle = newsData.englishTitle || newsData.metatitle || newsData.title;
  const finalTitle = seoTitle.includes('GSTV') ? seoTitle : `${seoTitle} | GSTV Gujarat News`;

  // SEO description priority: metadesc > englishTitle > Gujarati description
  const seoDescription = newsData.metadesc || newsData.englishTitle || cleanDescription;

  return {
    title: finalTitle,
    description: seoDescription,
    keywords: keywords,
    // og:title uses Gujarati title for social sharing (correct language for target audience)
    ogTitle: newsData.title || newsData.englishTitle,
    ogDescription: newsData.metadesc || newsData.englishTitle || cleanDescription,
    ogImage: getNewsImage(newsData),
    ogUrl: newsUrl,
    ogType: 'article',
    ogSiteName: 'GSTV Gujarat News',
    ogLocale: 'gu_IN',
    // Twitter Card properties
    twitterCard: 'summary_large_image',
    twitterSite: '@GSTV_News',
    twitterCreator: '@GSTV_News',
    // Additional properties
    canonicalUrl: newsUrl,
    publishedTime: newsData.created_at || new Date().toISOString(),
    modifiedTime: newsData.updated_at || new Date().toISOString(),
    author: 'GSTV Gujarat News',
    section: categorySlug,
    // hreflang tags for language targeting
    hreflangTags: {
      gu: newsUrl,
      'gu-IN': newsUrl,
      en: `${newsUrl}?lang=en`,
      'en-IN': `${newsUrl}?lang=en`,
      'x-default': newsUrl
    }
  };
};

/**
 * Generate SEO data for category page
 */
export const generateCategorySEO = (categorySlug: string, subcategorySlug?: string): SEOData => {
  const baseUrl = BASE_URLS.PRODUCTION;//typeof window !== 'undefined' ? window.location.origin : BASE_URLS.PRODUCTION;
  
  let title: string;
  let description: string;
  let url: string;
  
  if (subcategorySlug) {
    // Subcategory page
    const categoryName = formatCategoryName(categorySlug);
    const subcategoryName = formatCategoryName(subcategorySlug);
    title = `${subcategoryName} News - ${categoryName} | GSTV Gujarat News`;
    description = `Latest ${subcategoryName} news from ${categoryName}. Stay updated with breaking news, current affairs and latest updates from GSTV Gujarat.`;
    url = `${baseUrl}/category/${categorySlug}/${subcategorySlug}`;
  } else {
    // Main category page
    const categoryName = formatCategoryName(categorySlug);
    title = `${categoryName} News | GSTV Gujarat News`;
    description = `Latest ${categoryName} news and updates. Breaking news, current affairs and comprehensive coverage from GSTV Gujarat.`;
    url = `${baseUrl}/category/${categorySlug}`;
  }

  const keywords = `${formatCategoryName(categorySlug)}, Gujarat News, Gujarati News, GSTV, Breaking News, Current Affairs`;

  return {
    title,
    description,
    keywords,
    ogTitle: title,
    ogDescription: description,
    ogImage: `${baseUrl}/images/gstv-og-image.jpg`,
    ogUrl: url,
    canonicalUrl: url,
    // hreflang tags for language targeting
    hreflangTags: {
      gu: url,
      'gu-IN': url,
      en: `${url}?lang=en`,
      'en-IN': `${url}?lang=en`,
      'x-default': url
    }
  };
};

/**
 * Generate SEO data for tag page
 */
export const generateTagSEO = (tagSlug: string): SEOData => {
  const baseUrl =  BASE_URLS.PRODUCTION;// typeof window !== 'undefined' ? window.location.origin : BASE_URLS.PRODUCTION;

  const tagName = formatCategoryName(tagSlug);
  const title = `${tagName} News | GSTV Gujarat News`;
  const description = `Latest news and updates related to ${tagName}. Stay updated with comprehensive coverage from GSTV Gujarat.`;
  const url = `${baseUrl}/tags/${tagSlug}`;

  const keywords = `${tagName}, Gujarat News, Gujarati News, GSTV, Breaking News, Current Affairs`;

  return {
    title,
    description,
    keywords,
    ogTitle: title,
    ogDescription: description,
    ogImage: `${baseUrl}/images/gstv-og-image.jpg`,
    ogUrl: url,
    canonicalUrl: url,
    // hreflang tags for language targeting
    hreflangTags: {
      gu: url,
      'gu-IN': url,
      en: `${url}?lang=en`,
      'en-IN': `${url}?lang=en`,
      'x-default': url
    }
  };
};

/**
 * Generate SEO data for home page
 */
export const generateHomeSEO = (): SEOData => {
  const baseUrl = BASE_URLS.PRODUCTION;//typeof window !== 'undefined' ? window.location.origin : BASE_URLS.PRODUCTION;

  return {
    title: 'GSTV - Gujarat Samachar | Latest Gujarati News, Breaking News',
    description: 'GSTV Gujarat Samachar - Your trusted source for latest Gujarati news, breaking news, politics, sports, entertainment, business news from Gujarat and India.',
    keywords: 'GSTV, Gujarat News, Gujarati News, Breaking News, Gujarat Samachar, Politics, Sports, Entertainment, Business News',
    ogTitle: 'GSTV - Gujarat Samachar',
    ogDescription: 'Your trusted source for latest Gujarati news and breaking news from Gujarat.',
    ogImage: `${baseUrl}/images/gstv-og-image.jpg`,
    ogUrl: baseUrl,
    canonicalUrl: baseUrl,
    // hreflang tags for language targeting
    hreflangTags: {
      gu: baseUrl,
      'gu-IN': baseUrl,
      en: `${baseUrl}?lang=en`,
      'en-IN': `${baseUrl}?lang=en`,
      'x-default': baseUrl
    }
  };
};

/**
 * Generate dynamic SEO data for any page with fallback logic
 * Priority: metatitle/metadesc > englishTitle > title/description
 */
export const generateDynamicSEO = (data: any, pageType: string, slug?: string): SEOData => {
  const baseUrl: string = BASE_URLS.PRODUCTION;

  // Determine URL based on page type
  let pageUrl: string = baseUrl;
  if (slug) {
    switch (pageType) {
      case 'category':
        pageUrl = `${baseUrl}/category/${slug}`;
        break;
      case 'tag':
        pageUrl = `${baseUrl}/tags/${slug}`;
        break;
      case 'news':
        pageUrl = `${baseUrl}/news/${slug}`;
        break;
      default:
        pageUrl = `${baseUrl}/${slug}`;
    }
  }

  // SEO title priority: metatitle > englishTitle > title
  let seoTitle = '';
  if (data.metatitle) {
    seoTitle = data.metatitle;
  } else if (data.englishTitle) {
    seoTitle = data.englishTitle;
  } else if (data.title) {
    seoTitle = data.title;
  } else {
    seoTitle = `${formatCategoryName(slug || pageType)} - GSTV`;
  }

  // Ensure GSTV branding if not already present
  const finalTitle = seoTitle.includes('GSTV') ? seoTitle : `${seoTitle} | GSTV Gujarat News`;

  // SEO description priority: metadesc > englishTitle > cleaned description
  let seoDescription = '';
  if (data.metadesc) {
    seoDescription = data.metadesc;
  } else if (data.englishTitle) {
    seoDescription = data.englishTitle;
  } else if (data.description) {
    seoDescription = stripHtmlAndTruncate(data.description, 160);
  } else {
    seoDescription = `Latest news and updates about ${formatCategoryName(slug || pageType)} from GSTV Gujarat.`;
  }

  // Generate keywords
  const keywords = generateKeywords(data, pageType, slug);

  return {
    title: finalTitle,
    description: seoDescription,
    keywords: keywords,
    ogTitle: data.metatitle || data.englishTitle || data.title || seoTitle,
    ogDescription: data.metadesc || data.englishTitle || stripHtmlAndTruncate(data.description || '', 160) || seoDescription,
    ogImage: getNewsImage(data),
    ogUrl: pageUrl,
    canonicalUrl: pageUrl
  };
};

/**
 * Generate SEO data for video detail page
 */
export const generateVideoDetailSEO = (videoData: any, categorySlug: string): SEOData => {
  const baseUrl = BASE_URLS.PRODUCTION;//typeof window !== 'undefined' ? window.location.origin : BASE_URLS.PRODUCTION;
  const videoUrl = `${baseUrl}/videos/${videoData.slug}`;

  // Clean description for SEO
  const cleanDescription = stripHtmlAndTruncate(videoData.description || '', 160);

  // Generate keywords
  const titleKeywords = videoData.title ? extractKeywords(videoData.title) : [];
  const tagKeywords = videoData.tags ? videoData.tags.split(',').map((tag: string) => tag.trim()) : [];
  const keywords = [...titleKeywords, ...tagKeywords, 'GSTV', 'Gujarat Videos', 'Gujarati Videos', 'Video News'].join(', ');

  // SEO title priority: metatitle > englishTitle > title
  const seoTitle = videoData.metatitle || videoData.englishTitle || videoData.title;
  const finalTitle = seoTitle.includes('GSTV') ? seoTitle : `${seoTitle} | GSTV Gujarat Videos`;

  // SEO description priority: metadesc > englishTitle > cleanDescription
  const seoDescription = videoData.metadesc || videoData.englishTitle || cleanDescription;

  return {
    title: finalTitle,
    description: seoDescription,
    keywords: keywords,
    // Open Graph properties for videos
    ogTitle: videoData.metatitle || videoData.englishTitle || videoData.title,
    ogDescription: videoData.metadesc || videoData.englishTitle || cleanDescription,
    ogImage: getNewsImage(videoData),
    ogUrl: videoUrl,
    ogType: 'video.other',
    ogSiteName: 'GSTV Gujarat News',
    ogLocale: 'gu_IN',
    // Twitter Card properties
    twitterCard: 'summary_large_image',
    twitterSite: '@GSTV_News',
    twitterCreator: '@GSTV_News',
    // Additional properties
    canonicalUrl: videoUrl,
    publishedTime: videoData.created_at || new Date().toISOString(),
    modifiedTime: videoData.updated_at || new Date().toISOString(),
    author: 'GSTV Gujarat News',
    section: 'Videos',
    videoURL: videoData.videoURL,
    // hreflang tags for language targeting
    hreflangTags: {
      gu: videoUrl,
      'gu-IN': videoUrl,
      en: `${videoUrl}?lang=en`,
      'en-IN': `${videoUrl}?lang=en`,
      'x-default': videoUrl
    }
  };
};

/**
 * Generate keywords based on data and page type
 */
function generateKeywords(data: any, pageType: string, slug?: string): string {
  const baseKeywords = ['GSTV', 'Gujarat News', 'Gujarati News', 'Breaking News'];

  // Add keywords from data
  if (data.tags) {
    const tagKeywords = data.tags.split(',').map((tag: string) => tag.trim());
    baseKeywords.push(...tagKeywords);
  }

  // Add title-based keywords
  if (data.title) {
    const titleKeywords = extractKeywords(data.title);
    baseKeywords.push(...titleKeywords);
  }

  // Add page-specific keywords
  if (slug) {
    baseKeywords.push(formatCategoryName(slug));
  }

  // Add page type keywords
  switch (pageType) {
    case 'category':
      baseKeywords.push('Category News', 'Current Affairs');
      break;
    case 'tag':
      baseKeywords.push('Tag News', 'Related News');
      break;
    case 'news':
      baseKeywords.push('News Article', 'Latest Update');
      break;
    case 'videos':
      baseKeywords.push('Video News', 'Gujarat Videos', 'Gujarati Videos');
      break;
  }

  // Remove duplicates and return
  return [...new Set(baseKeywords)].join(', ');
}

/**
 * Strip HTML tags and truncate text
 */
function stripHtmlAndTruncate(html: string, maxLength: number): string {
  // Remove HTML tags
  const text = html.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  const decoded = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  
  // Truncate and add ellipsis if needed
  if (decoded.length <= maxLength) {
    return decoded.trim();
  }
  
  return decoded.substring(0, maxLength).trim() + '...';
}

/**
 * Extract keywords from title
 */
function extractKeywords(title: string): string[] {
  // Remove common words and extract meaningful keywords
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
  
  return title
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 5); // Take first 5 keywords
}

/**
 * Format category name for display
 */
function formatCategoryName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get optimized news image
 */
function getNewsImage(news: any): string {
  // 1️⃣ Video thumbnail has highest priority
  if (news.videoURL && news.videoURL.includes('.mp4') && (news.featureImage == '' || news.featureImage == null || news.featureImage == 'null')) {
    // return news.videoURL.replace(/\.mp4$/i, '_video_small.jpg');
    return (news.videoURL.replace(/\.mp4$/i, '_video_small.jpg') + `?v=${Date.now()}`);
  }

  // 2️⃣ Feature image (_medium version)
  if (news.featureImage && news.featureImage !== '') {
    const fileExtension = news.featureImage.split('.').pop()?.toLowerCase();
    const imageUrl = news.featureImage.replace(`.${fileExtension}`, `_medium.${fileExtension}`);

    // If it's a relative path, make it absolute
    if (imageUrl.startsWith('/')) {
      return `${MEDIA_BASE_URL}${imageUrl}`;
    }

    return imageUrl;
  }

  // 3️⃣ Default fallback image
  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : BASE_URLS.PRODUCTION;

  return `${baseUrl}/images/gstv-og-image.jpg`;
}

/**
 * Generate VideoObject Schema (Item 12)
 */
export const generateVideoObjectSchema = (videoData: any, pageUrl?: string) => {
  const baseUrl = BASE_URLS.PRODUCTION;
  const url = pageUrl || `${baseUrl}/videos/${videoData.slug || ''}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: videoData.title || videoData.englishTitle || 'GSTV Video',
    description: stripHtmlAndTruncate(videoData.description || videoData.title || '', 200),
    thumbnailUrl: getNewsImage(videoData),
    uploadDate: videoData.created_at || new Date().toISOString(),
    contentUrl: videoData.videoURL || url,
    embedUrl: url,
    publisher: {
      '@type': 'Organization',
      name: 'GSTV Gujarat News',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/assets/images/gstv-logo-bg.png`
      }
    }
  };
};

/**
 * Generate FAQPage Schema (Item 13)
 */
export const generateFAQPageSchema = (faqs: Array<{ question: string; answer: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
};

/**
 * Generate Person Schema for Journalists/Authors (Item 14)
 */
export const generatePersonSchema = (authorData: any) => {
  const baseUrl = BASE_URLS.PRODUCTION;
  const name = typeof authorData === 'string' ? authorData : (authorData?.name || 'GSTV Journalist');
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: name,
    jobTitle: 'Journalist / Reporter',
    worksFor: {
      '@type': 'NewsMediaOrganization',
      name: 'GSTV Gujarat News',
      url: baseUrl
    },
    url: typeof authorData === 'object' && authorData?.slug ? `${baseUrl}/journalist/${authorData.slug}` : baseUrl
  };
};

/**
 * Generate ImageObject Schema (Item 15)
 */
export const generateImageObjectSchema = (imageUrl: string, caption?: string) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: imageUrl,
    url: imageUrl,
    caption: caption || 'GSTV News Image',
    creditText: 'GSTV Gujarat News'
  };
};


