// Common utility functions
import { MEDIA_BASE_URL } from '@/constants/api';

/**
 * Formats date to Gujarati relative time
 * @param dateString - ISO date string
 * @returns Formatted Gujarati time string
 */
export const formatDate = (dateString: string): string => {
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

/**
 * Truncates text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Safely removes HTML tags from string
 * @param html - HTML string to clean
 * @returns Plain text without HTML tags
 */
export const stripHtml = (html: string): string => {
  if (!html) return '';
  
  if (typeof window !== 'undefined') {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
  
  // Fallback for server-side rendering
  return html.replace(/<[^>]*>/g, '');
};

/**
 * Formats number with Gujarati text
 * @param num - Number to format
 * @returns Formatted number string in Gujarati
 */
export const formatViews = (num: number): string => {
  if (num < 1000) {
    return `${num} વ્યૂઝ`;
  } else if (num < 100000) {
    return `${(num / 1000).toFixed(1)}K વ્યૂઝ`;
  } else if (num < 10000000) {
    return `${(num / 100000).toFixed(1)}L વ્યૂઝ`;
  } else {
    return `${(num / 10000000).toFixed(1)}Cr વ્યૂઝ`;
  }
};

/**
 * Extracts first category from category slugs string
 * @param categorySlug - Comma-separated category slugs
 * @returns First category name
 */
export const getFirstCategory = (categorySlug: string): string => {
  if (!categorySlug) return '';
  return categorySlug.split(',')[0].trim();
};

/**
 * Generates image URL with fallback
 * @param featureImage - Primary image URL
 * @param imageURL - Secondary image URL
 * @param fallback - Fallback image path
 * @returns Valid image URL
 */
export const getImageUrl = (
  featureImage: string | null, 
  imageURL: string, 
  fallback: string = '/images/news-default.png'
): string => {
  return featureImage || imageURL || fallback;
};

/**
 * Handles image error by setting fallback source
 * @param event - Image error event
 * @param fallbackSrc - Fallback image source
 */
export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement>, 
  fallbackSrc: string = '/images/news-default.png'
): void => {
  const target = event.target as HTMLImageElement;
  target.src = fallbackSrc;
};

/**
 * Opens URL in new tab/window
 * @param url - URL to open
 */
export const openInNewTab = (url: string): void => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Generates news article URL
 * @param slug - News article slug
 * @param baseUrl - Base URL (default: MEDIA_BASE_URL)
 * @returns Complete news article URL
 */
export const generateNewsUrl = (slug: string, baseUrl: string = MEDIA_BASE_URL): string => {
  return `${baseUrl}/${slug}`;
};

/**
 * Debounce function for performance optimization
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Checks if string is valid URL
 * @param string - String to validate
 * @returns Boolean indicating if string is valid URL
 */
export const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Capitalizes first letter of each word
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export const capitalizeWords = (str: string): string => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Detects if text contains Gujarati characters
 * @param text - Text to analyze
 * @returns True if text contains Gujarati characters
 */
export const isGujaratiText = (text: string): boolean => {
  if (!text) return false;
  // Gujarati Unicode range: U+0A80-U+0AFF
  const gujaratiRegex = /[\u0A80-\u0AFF]/;
  return gujaratiRegex.test(text);
};

/**
 * Returns appropriate CSS class based on text language
 * @param text - Text to analyze
 * @returns CSS class name for font family
 */
export const getLanguageFontClass = (text: string): string => {
  return isGujaratiText(text) ? 'custom-gujrati-font' : 'english-font';
};

/**
 * Returns appropriate font family based on text language
 * @param text - Text to analyze
 * @returns Font family string
 */
export const getLanguageFontFamily = (text: string): string => {
  return isGujaratiText(text) ? '"Hind Vadodara", sans-serif' : '"Poppins", sans-serif';
};
