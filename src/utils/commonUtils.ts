/**
 * Common Utility Functions
 * Shared functions for news, web stories, and epaper components
 */

import { MEDIA_BASE_URL, API_V5_BASE_URL } from '@/constants/api';

// Common interfaces
export interface BaseItem {
  id: number;
  title: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface ShareData {
  title: string;
  url: string;
  description?: string;
}

export interface BookmarkData {
  id: number;
  title: string;
  slug: string;
  type: 'news' | 'webstory' | 'epaper';
}

/**
 * Format date to readable format
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes <= 1 ? 'હમણાં જ' : `${diffInMinutes} મિનિટ પહેલાં`;
    } else if (diffInHours < 24) {
      return `${diffInHours} કલાક પહેલાં`;
    } else if (diffInHours < 48) {
      return 'ગઈકાલે';
    } else {
      return date.toLocaleDateString('gu-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Calculate reading time based on content length
 * @param content - Content string (HTML or plain text)
 * @returns Reading time in minutes
 */
export const calculateReadingTime = (content: string): number => {
  if (!content) return 1;
  
  // Remove HTML tags and count words
  const plainText = content.replace(/<[^>]*>/g, '');
  const wordCount = plainText.trim().split(/\s+/).length;
  
  // Average reading speed: 200 words per minute
  const readingTime = Math.ceil(wordCount / 200);
  return Math.max(1, readingTime);
};

/**
 * Truncate description to specified length
 * @param description - Description text
 * @param maxLength - Maximum length (default: 150)
 * @returns Truncated description
 */
export const truncateDescription = (description: string, maxLength: number = 150): string => {
  if (!description) return '';
  
  // Remove HTML tags
  const plainText = description.replace(/<[^>]*>/g, '');
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  return plainText.substring(0, maxLength).trim() + '...';
};

/**
 * Get image URL with fallback
 * @param imagePath - Image path or URL
 * @param type - Type of content ('news', 'webstory', 'epaper')
 * @returns Full image URL
 */
export const getImageUrl = (imagePath: string | null, type: 'news' | 'webstory' | 'epaper' = 'news'): string => {
  if (!imagePath) {
    return getDefaultImageUrl(type);
  }
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Construct full URL based on type
  switch (type) {
    case 'news':
      return `${MEDIA_BASE_URL}/backend/public/uploads/news/${imagePath}`;
    case 'webstory':
      return `${MEDIA_BASE_URL}/backend/public/uploads/webstory/${imagePath}`;
    case 'epaper':
      return `${MEDIA_BASE_URL}/backend/public/uploads/epaper/${imagePath}`;
    default:
      return `${MEDIA_BASE_URL}/backend/public/uploads/${imagePath}`;
  }
};

/**
 * Get default image URL based on content type
 * @param type - Type of content
 * @returns Default image URL
 */
export const getDefaultImageUrl = (type: 'news' | 'webstory' | 'epaper' = 'news'): string => {
  switch (type) {
    case 'webstory':
      return '/images/default-webstory.png';
    case 'epaper':
      return '/images/default-epaper.png';
    default:
      return '/images/default-news.png';
  }
};

/**
 * Handle bookmark functionality with API integration and icon updates
 * @param item - Item to bookmark
 * @returns Promise<boolean> - Success status
 */
export const handleBookmark = async (item: BookmarkData): Promise<boolean> => {
  try {
    // Check if user is logged in
    const userSession = localStorage.getItem('userSession');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (!isLoggedIn || !userSession) {
     // if (confirm('બુકમાર્ક કરવા માટે લોગિન કરવું જરૂરી છે. લોગિન પેજ પર જવું છે?')) {
        window.location.href = '/login';
      //}
      return false;
    }

    // Get user_id from session
    const session = JSON.parse(userSession);
    const userId = session.userData?.user_id || session.userData?.id || session.user_id || session.mobile;

    if (!userId) {
     // alert('યુઝર ID મળી નથી. કૃપા કરીને ફરીથી લોગિન કરો.');
      return false;
    }

    // Get existing bookmarks from localStorage
    const existingBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');

    // Check if already bookmarked
    const isCurrentlyBookmarked = existingBookmarks.some((bookmark: BookmarkData) =>
      bookmark.id === item.id && bookmark.type === item.type
    );

    // Determine new status (toggle current status)
    const newStatus = isCurrentlyBookmarked ? 0 : 1;

    

    // Show loading state on bookmark icon
    const bookmarkIcon = document.querySelector(`.ico_bookmark${item.id} img`) as HTMLImageElement;
    if (bookmarkIcon) {
      bookmarkIcon.style.opacity = '0.5';
    }

    // Call bookmark API
    const requestBody = new URLSearchParams({
      news_id: item.id.toString(),
      user_id: userId.toString(),
      status: newStatus.toString(),
      bookmark_type: item.type
    });

    const response = await fetch(`${API_V5_BASE_URL}/newsbookmark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'GSTV-NextJS-App/1.0',
      },
      body: requestBody,
    });

    const data = await response.json();
    

    if (response.ok && (data.success || data.status === 'success' || data.status === 1 || data.status === '1' || data.status === 0 || data.status === '0')) {
      // Update localStorage
      if (newStatus === 1) {
        // Add bookmark
        const newBookmark = {
          ...item,
          bookmarkedAt: new Date().toISOString()
        };
        existingBookmarks.push(newBookmark);
        
      } else {
        // Remove bookmark
        const updatedBookmarks = existingBookmarks.filter((bookmark: BookmarkData) =>
          !(bookmark.id === item.id && bookmark.type === item.type)
        );
        existingBookmarks.length = 0;
        existingBookmarks.push(...updatedBookmarks);
        
      }
      localStorage.setItem('bookmarks', JSON.stringify(existingBookmarks));
     

      // Update bookmark icon with correct GSTV icons and opacity
      if (bookmarkIcon) {
        if (newStatus === 1) {
          // When bookmarked (status = 1), use solid icon with opacity 1
          bookmarkIcon.src = '/images/ico_bookmark_solid.svg';
          bookmarkIcon.style.opacity = '1';
        
        } else {
          // When not bookmarked (status = 0), use line icon with opacity 0.5
          bookmarkIcon.src = '/images/ico_bookmark_line.svg';
          bookmarkIcon.style.opacity = '0.5';
        
        }
      }

    
      // Return true if we just bookmarked (newStatus === 1), false if we just unbookmarked (newStatus === 0)
      const isNowBookmarked = newStatus === 1;
      
      return isNowBookmarked;
    } else {
      

      // Reset icon opacity on error
      if (bookmarkIcon) {
        bookmarkIcon.style.opacity = '1';
      }
      //alert(data.error || data.message || 'બુકમાર્ક કરવામાં ભૂલ થઈ!');
      return isCurrentlyBookmarked;
    }
  } catch (error) {
   

    // Reset icon opacity on error
    const bookmarkIcon = document.querySelector(`.ico_bookmark${item.id} img`) as HTMLImageElement;
    if (bookmarkIcon) {
      bookmarkIcon.style.opacity = '1';
    }

   // alert('બુકમાર્ક કરવામાં ભૂલ થઈ!'); // Error bookmarking!
    return false;
  }
};

/**
 * Check if item is bookmarked
 * @param id - Item ID
 * @param type - Item type
 * @returns boolean - Is bookmarked
 */
export const isBookmarked = (id: number, type: 'news' | 'webstory' | 'epaper'): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    return bookmarks.some((bookmark: BookmarkData) =>
      bookmark.id === id && bookmark.type === type
    );
  } catch (error) {
   
    return false;
  }
};

/**
 * Update bookmark icon on the page
 * @param itemId - Item ID
 * @param isBookmarked - Bookmark status
 */
export const updateBookmarkIcon = (itemId: number | string, isBookmarked: boolean): void => {
  try {
    // Find bookmark icon by class name pattern
    const bookmarkIcon = document.querySelector(`.ico_bookmark${itemId} img`) as HTMLImageElement;

    if (bookmarkIcon) {
      if (isBookmarked) {
        // Show solid icon when bookmarked
        bookmarkIcon.src = '/images/ico_bookmark_solid.svg';
      } else {
        // Show line icon when not bookmarked
        bookmarkIcon.src = '/images/ico_bookmark_line.svg';
      }
      
    } else {
      console.log(`🔖 Bookmark icon not found for item ${itemId}`);
    }
  } catch (error) {
    console.error('Error updating bookmark icon:', error);
  }
};

/**
 * Update all bookmark icons on the page based on localStorage
 */
export const updateAllBookmarkIcons = (): void => {
  try {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const bookmarkedIds = bookmarks.map((bookmark: BookmarkData) => bookmark.id.toString());

    // Find all bookmark icons on the page
    const bookmarkIcons = document.querySelectorAll('[class*="ico_bookmark"] img') as NodeListOf<HTMLImageElement>;

    bookmarkIcons.forEach((icon) => {
      // Extract item ID from parent class name
      const parentElement = icon.closest('[class*="ico_bookmark"]');
      if (parentElement) {
        const className = parentElement.className;
        const match = className.match(/ico_bookmark(\d+)/);
        if (match) {
          const itemId = match[1];
          const isBookmarked = bookmarkedIds.includes(itemId);

          if (isBookmarked) {
            icon.src = '/images/ico_bookmark_solid.svg';
          } else {
            icon.src = '/images/ico_bookmark_line.svg';
          }
        }
      }
    });

    
  } catch (error) {
    console.error('Error updating all bookmark icons:', error);
  }
};

/**
 * Handle share functionality
 * @param shareData - Data to share
 * @returns Promise<boolean> - Success status
 */
export const handleShare = async (shareData: ShareData): Promise<boolean> => {
  try {
    // Use native share API if available
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({
        title: shareData.title,
        text: shareData.description || shareData.title,
        url: shareData.url
      });
      return true;
    }
    
    // Fallback: copy to clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareData.url);
      alert('લિંક કોપી થઈ ગઈ છે!'); // Link copied!
      return true;
    }
    
    // Final fallback: open in new window
    if (typeof window !== 'undefined') {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.title)}&url=${encodeURIComponent(shareData.url)}`;
      window.open(twitterUrl, '_blank');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error sharing:', error);
    
    // Fallback: copy to clipboard manually
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        alert('લિંક કોપી થઈ ગઈ છે!'); // Link copied!
        return true;
      }
    } catch (clipboardError) {
      console.error('Clipboard fallback failed:', clipboardError);
      alert('શેર કરવામાં ભૂલ થઈ!'); // Error sharing!
    }
    
    return false;
  }
};

/**
 * Generate SEO-friendly URL slug
 * @param title - Title to convert to slug
 * @returns URL slug
 */
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

/**
 * Parse and validate JSON data
 * @param jsonString - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed data or fallback
 */
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
};

/**
 * Debounce function for performance optimization
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Get current date in DD-MM-YYYY format
 * @returns Formatted date string
 */
export const getCurrentDateDDMMYYYY = (): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Test function to verify bookmark API response handling
 * This helps debug issues with status: "0" vs status: "1"
 */
export const testBookmarkApiResponse = (apiResponse: any, newStatus: number): boolean => {
  

  const isSuccessful = (
    apiResponse.success ||
    apiResponse.status === 'success' ||
    apiResponse.status === 1 ||
    apiResponse.status === '1' ||
    apiResponse.status === 0 ||
    apiResponse.status === '0'
  );

  const shouldBeBookmarked = newStatus === 1;

 

  return shouldBeBookmarked;
};

/**
 * Convert date from DD-MM-YYYY to YYYY-MM-DD format
 * @param dateString - Date in DD-MM-YYYY format
 * @returns Date in YYYY-MM-DD format
 */
export const convertDateFormat = (dateString: string): string => {
  const [day, month, year] = dateString.split('-');
  return `${year}-${month}-${day}`;
};
