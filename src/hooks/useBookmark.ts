'use client';

import { useState, useCallback } from 'react';
import { getUserId, isUserLoggedIn } from '@/hooks/useUserSession';
import { API_V5_BASE_URL } from '@/constants/api';

interface BookmarkOptions {
  newsId: string | number;
  bookmarkType?: 'news' | 'webstory' | 'epaper' | 'videos';
  onSuccess?: (bookmarked: boolean) => void;
  onError?: (error: string) => void;
}

interface UseBookmarkReturn {
  isBookmarked: boolean;
  isLoading: boolean;
  toggleBookmark: () => Promise<void>;
  setIsBookmarked: (bookmarked: boolean) => void;
  getBookmarkIcon: () => string;
  getBookmarkOpacity: () => number;
}

/**
 * Custom hook for bookmark functionality
 * Handles API calls and local state management
 */
export const useBookmark = (options: BookmarkOptions): UseBookmarkReturn => {
  const { newsId, bookmarkType = 'news', onSuccess, onError } = options;
  
  const [isBookmarked, setIsBookmarked] = useState<boolean>(() => {
    // Initialize bookmark status from localStorage
    if (typeof window === 'undefined') return false;
    
    try {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      return bookmarks.some((bookmark: any) => bookmark.id === newsId.toString());
    } catch {
      return false;
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const toggleBookmark = useCallback(async () => {
    // Check if user is logged in
    if (!isUserLoggedIn()) {
      //const shouldRedirect = confirm('બુકમાર્ક કરવા માટે લોગિન કરવું જરૂરી છે. લોગિન પેજ પર જવું છે?');
      //if (shouldRedirect) {
        window.location.href = '/login';
     // }
      return;
    }

    // Get user ID
    const userId = getUserId();
    if (!userId) {
      const error = 'યુઝર ID મળી નથી. કૃપા કરીને ફરીથી લોગિન કરો.';
      onError?.(error);
     // alert(error);
      return;
    }

    setIsLoading(true);

    try {
     // alert(isBookmarked)
      // Determine new status (toggle current status)
      const newStatus = isBookmarked ? 0 : 1;



      // Call bookmark API
      const response = await fetch(`${API_V5_BASE_URL}/newsbookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          news_id: newsId.toString(),
          user_id: userId,
          status: newStatus,
          bookmark_type: bookmarkType
        }),
      });

      const data = await response.json();
      console.log('🔖 Bookmark API Response:', data);

      if (data.success) {
        // Update local state
        const newBookmarkStatus = newStatus === 1;
        setIsBookmarked(newBookmarkStatus);

        // Update localStorage
        const existingBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        
        if (newStatus === 1) {
          // Add bookmark
          const newBookmark = {
            id: newsId.toString(),
            timestamp: new Date().toISOString(),
            type: bookmarkType
          };
          existingBookmarks.push(newBookmark);
        } else {
          // Remove bookmark
          const updatedBookmarks = existingBookmarks.filter((item: any) => item.id !== newsId.toString());
          existingBookmarks.length = 0;
          existingBookmarks.push(...updatedBookmarks);
        }
        localStorage.setItem('bookmarks', JSON.stringify(existingBookmarks));

        // Call success callback
        onSuccess?.(newBookmarkStatus);

        // Update any bookmark icons on the page with opacity
        const bookmarkIcons = document.querySelectorAll(`.ico_bookmark${newsId} img`) as NodeListOf<HTMLImageElement>;
        const iconPath = newStatus === 1 ? '/images/ico_bookmark_solid.svg' : '/images/ico_bookmark_line.svg';
        const opacity = newStatus === 1 ? 1 : 0.5;

        bookmarkIcons.forEach(icon => {
          icon.src = iconPath;
          icon.style.opacity = opacity.toString();
          console.log(`🔖 Updated bookmark icon: ${iconPath} (opacity: ${opacity})`);
        });

        // Show success message
        const message = data.message || (newStatus === 1 ? 'બુકમાર્ક ઉમેરવામાં આવ્યું!' : 'બુકમાર્ક દૂર કરવામાં આવ્યું!');

        // Use toast notification if available, otherwise use alert
        if (typeof window !== 'undefined' && (window as any).showToast) {
          (window as any).showToast(message, 'success');
        } else {
          alert(message);
        }
      } else {
        const error = data.error || 'બુકમાર્ક કરવામાં ભૂલ થઈ!';
        onError?.(error);
        alert(error);
      }
    } catch (error) {
      console.error('🔖 Error toggling bookmark:', error);
      const errorMessage = 'બુકમાર્ક કરવામાં ભૂલ થઈ!';
      onError?.(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [newsId, isBookmarked, bookmarkType, onSuccess, onError]);

  // Get bookmark icon based on bookmark status
  const getBookmarkIcon = useCallback((): string => {
    return isBookmarked ? '/images/ico_bookmark_solid.svg' : '/images/ico_bookmark_line.svg';
  }, [isBookmarked]);

  // Get bookmark opacity (1 for bookmarked, 0.5 for not bookmarked)
  const getBookmarkOpacity = useCallback((): number => {
    return isBookmarked ? 1 : 0.5;
  }, [isBookmarked]);

  return {
    isBookmarked,
    isLoading,
    toggleBookmark,
    setIsBookmarked,
    getBookmarkIcon,
    getBookmarkOpacity,
  };
};

/**
 * Utility function to check if an item is bookmarked
 * @param itemId - Item ID
 * @param itemType - Item type
 * @returns boolean
 */
export const checkIsBookmarked = (itemId: string | number, itemType?: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    return bookmarks.some((bookmark: any) => 
      bookmark.id === itemId.toString() && 
      (!itemType || bookmark.type === itemType)
    );
  } catch {
    return false;
  }
};

/**
 * Utility function to get all bookmarks
 * @returns Array of bookmarks
 */
export const getAllBookmarks = (): any[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    return JSON.parse(localStorage.getItem('bookmarks') || '[]');
  } catch {
    return [];
  }
};

/**
 * Utility function to clear all bookmarks
 */
export const clearAllBookmarks = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('bookmarks');
  }
};

/**
 * Utility function to get bookmark icon based on opacity
 * When opacity is 1, it means bookmarked (solid icon)
 * When opacity is less than 1, it means not bookmarked (line icon)
 * @param opacity - Current opacity value
 * @returns string - Icon path
 */
export const getBookmarkIconByOpacity = (opacity: number): string => {
  return opacity === 1 ? '/images/ico_bookmark_solid.svg' : '/images/ico_bookmark_line.svg';
};

/**
 * Utility function to get bookmark icon based on bookmark status
 * @param isBookmarked - Boolean bookmark status
 * @returns string - Icon path
 */
export const getBookmarkIcon = (isBookmarked: boolean): string => {
  return isBookmarked ? '/images/ico_bookmark_solid.svg' : '/images/ico_bookmark_line.svg';
};

/**
 * Utility function to update bookmark icon in DOM based on opacity
 * @param newsId - News item ID
 * @param opacity - Current opacity value
 */
export const updateBookmarkIconByOpacity = (newsId: string | number, opacity: number): void => {
  const bookmarkIcons = document.querySelectorAll(`.ico_bookmark${newsId} img`) as NodeListOf<HTMLImageElement>;
  const iconPath = getBookmarkIconByOpacity(opacity);

  bookmarkIcons.forEach(icon => {
    icon.src = iconPath;
    icon.style.opacity = opacity.toString();
    console.log(`🔖 Updated bookmark icon for news ${newsId}: ${iconPath} (opacity: ${opacity})`);
  });
};

/**
 * Utility function to update all bookmark icons on page based on localStorage
 */
export const updateAllBookmarkIcons = (): void => {
  if (typeof window === 'undefined') return;

  try {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const bookmarkIds = new Set(bookmarks.map((bookmark: any) => bookmark.id));

    // Find all bookmark icons on the page
    const allBookmarkIcons = document.querySelectorAll('[class*="ico_bookmark"] img') as NodeListOf<HTMLImageElement>;

    allBookmarkIcons.forEach(icon => {
      // Extract news ID from parent class
      const parentElement = icon.closest('[class*="ico_bookmark"]');
      if (parentElement) {
        const classNames = parentElement.className;
        const match = classNames.match(/ico_bookmark(\d+)/);
        if (match) {
          const newsId = match[1];
          const isBookmarked = bookmarkIds.has(newsId);
          const iconPath = getBookmarkIcon(isBookmarked);
          const opacity = isBookmarked ? 1 : 0.5;

          icon.src = iconPath;
          icon.style.opacity = opacity.toString();
        }
      }
    });

    console.log('🔖 Updated all bookmark icons on page');
  } catch (error) {
    console.error('❌ Error updating bookmark icons:', error);
  }
};
