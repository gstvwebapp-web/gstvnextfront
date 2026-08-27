'use client';

import React from 'react';
import { useBookmark } from '@/hooks/useBookmark';

interface BookmarkButtonProps {
  newsId: string | number;
  bookmarkType?: 'news' | 'webstory' | 'epaper';
  className?: string;
  iconOnly?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'icon' | 'button' | 'text';
  onBookmarkChange?: (bookmarked: boolean) => void;
}

/**
 * Reusable bookmark button component
 * Handles bookmark functionality with API integration
 */
export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  newsId,
  bookmarkType = 'news',
  className = '',
  iconOnly = false,
  size = 'medium',
  variant = 'button',
  onBookmarkChange
}) => {
  const { isBookmarked, isLoading, toggleBookmark } = useBookmark({
    newsId,
    bookmarkType,
    onSuccess: onBookmarkChange,
    onError: (error) => console.error('Bookmark error:', error)
  });

  // Size classes
  const sizeClasses = {
    small: 'text-sm p-1',
    medium: 'text-base p-2',
    large: 'text-lg p-3'
  };

  // Icon size classes
  const iconSizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleBookmark();
  };

  // Icon variant
  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`
          bookmark-icon-btn
          ${isBookmarked ? 'bookmarked' : ''}
          ${isLoading ? 'loading' : ''}
          ${className}
        `}
        title={isBookmarked ? 'બુકમાર્ક દૂર કરો' : 'બુકમાર્ક કરો'}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        {isLoading ? (
          <i className="fas fa-spinner fa-spin"></i>
        ) : (
          <i className={`fas ${isBookmarked ? 'fa-bookmark' : 'fa-bookmark-o'}`}></i>
        )}
      </button>
    );
  }

  // Button variant
  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`
          bookmark-btn
          ${sizeClasses[size]}
          ${isBookmarked ? 'bookmarked' : ''}
          ${isLoading ? 'loading' : ''}
          ${className}
        `}
        title={isBookmarked ? 'બુકમાર્ક દૂર કરો' : 'બુકમાર્ક કરો'}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        {isLoading ? (
          <i className="fas fa-spinner fa-spin"></i>
        ) : (
          <i className={`fas ${isBookmarked ? 'fa-bookmark' : 'fa-bookmark-o'}`}></i>
        )}
        {!iconOnly && (
          <span className="ml-1">
            {isBookmarked ? 'સેવ કર્યું' : 'સેવ કરો'}
          </span>
        )}
      </button>
    );
  }

  // Text variant
  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        bookmark-text-btn
        ${isBookmarked ? 'bookmarked' : ''}
        ${isLoading ? 'loading' : ''}
        ${className}
      `}
      title={isBookmarked ? 'બુકમાર્ક દૂર કરો' : 'બુકમાર્ક કરો'}
    >
      {isLoading ? (
        <>
          <i className="fas fa-spinner fa-spin mr-1"></i>
          લોડ થઈ રહ્યું...
        </>
      ) : (
        <>
          <i className={`fas ${isBookmarked ? 'fa-bookmark' : 'fa-bookmark-o'} mr-1`}></i>
          {isBookmarked ? 'બુકમાર્ક કર્યું' : 'બુકમાર્ક કરો'}
        </>
      )}
    </button>
  );
};

/**
 * Legacy bookmark button that matches existing GSTV design
 * Uses image icons with opacity-based switching
 * When opacity is 1, shows solid bookmark icon
 * When opacity is 0.5, shows line bookmark icon
 */
export const LegacyBookmarkButton: React.FC<BookmarkButtonProps> = ({
  newsId,
  bookmarkType = 'news',
  className = '',
  onBookmarkChange
}) => {
  const {
    isBookmarked,
    isLoading,
    toggleBookmark,
    getBookmarkIcon,
    getBookmarkOpacity
  } = useBookmark({
    newsId,
    bookmarkType,
    onSuccess: onBookmarkChange,
    onError: (error) => console.error('Bookmark error:', error)
  });

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleBookmark();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        legacy-bookmark-btn
        ${isBookmarked ? 'bookmarked' : ''}
        ${isLoading ? 'loading' : ''}
        ${className}
      `}
      title={isBookmarked ? 'બુકમાર્ક દૂર કરો' : 'બુકમાર્ક કરો'}
      style={{
        background: 'none',
        border: 'none',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        padding: '4px'
       
      }}
    >
      {isLoading ? (
        <i className="fas fa-spinner fa-spin" style={{ width: '20px', height: '20px' }}></i>
      ) : (
        <img
          src={getBookmarkIcon()}
          alt="Bookmark"
          className={`ico_bookmark${newsId}`}
          style={{
            width: '20px',
            height: '20px',
            opacity: getBookmarkOpacity(), // Key: opacity determines icon type (1 = solid, 0.5 = line)
            transition: 'opacity 0.3s ease',
            filter: isBookmarked
              ? 'brightness(0) saturate(100%) invert(85%) sepia(95%) saturate(1352%) hue-rotate(2deg) brightness(119%) contrast(107%)'
              : 'none'
          }}
        />
      )}
    </button>
  );
};

export default BookmarkButton;
