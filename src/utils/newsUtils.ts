/**
 * Common utility functions for news components
 */

import { MEDIA_BASE_URL, API_V5_BASE_URL } from '../constants/api';

/**
 * Truncate description text to specified length
 * @param description - The text to truncate
 * @param length - Maximum length (default: 120)
 * @param removeHtml - Whether to remove HTML tags (default: false)
 * @returns Truncated text with ellipsis if needed
 */
export const truncateDescription = (description: string, length: number = 120, removeHtml: boolean = false): string => {
  if (!description) return '';

  let text = description;
  if (removeHtml) {
    text = text.replace(/<[^>]*>/g, '');
  }

  return text.length > length
    ? text.substring(0, length).trim() + '...'
    : text;
};

/**
 * Calculate reading time based on word count
 * @param description - The text to calculate reading time for
 * @param removeHtml - Whether to remove HTML tags before calculation (default: false)
 * @returns Reading time in minutes
 */
export const calculateReadingTime = (description: string, removeHtml: boolean = false): number => {
  if (!description) return 1;

  let text = description;
  if (removeHtml) {
    text = text.replace(/<[^>]*>/g, '');
  }

  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);

  return readingTime > 0 ? readingTime : 1;
};

/**
 * Format date string to readable format
 * @param dateString - ISO date string
 * @param showRelative - Whether to show relative time (e.g., "2 hours ago") for recent dates
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, showRelative: boolean = false): string => {
  try {
    const date = new Date(dateString);

    if (showRelative) {
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

      if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
      } else if (diffInHours < 48) {
        return 'Yesterday';
      }
    }

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

/**
 * Check if user is logged in
 * @returns boolean - Is user logged in
 */
export const isUserLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;

  // Check for user session in localStorage or sessionStorage
  const userSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  return !!(userSession || isLoggedIn);
};

/**
 * Redirect to login page
 * @param returnUrl - URL to return to after login
 */
export const redirectToLogin = (returnUrl?: string): void => {
  if (typeof window === 'undefined') return;

  const currentUrl = returnUrl || window.location.href;
  const loginUrl = `/login?returnUrl=${encodeURIComponent(currentUrl)}`;
  window.location.href = loginUrl;
};

/**
 * Handle bookmark functionality with API call and login check
 * @param newsId - ID of the news item
 * @param currentPath - Current page path
 * @param bookmark - Current bookmark status
 * @param bookmarkType - Type of bookmark ('news', 'webstory', etc.)
 */
export const handleBookmark = async (
  newsId: string,
  currentPath: string,
  bookmark: string,
  bookmarkType: string = 'news'
): Promise<void> => {
  // Check if user is logged in
  if (!isUserLoggedIn()) {
    // Show login prompt and redirect
    //if (confirm('બુકમાર્ક કરવા માટે લોગિન કરવું જરૂરી છે. લોગિન પેજ પર જવું છે?')) {
      redirectToLogin();
   // }
    return;
  }

  try {
    // Get user_id from session
    const userSession = localStorage.getItem('userSession');
    if (!userSession) {
      //alert('લોગિન સેશન સમાપ્ત થયું છે. કૃપા કરીને ફરીથી લોગિન કરો.');
      redirectToLogin();
      return;
    }

    const session = JSON.parse(userSession);
    const userId = session.userData?.user_id || session.userData?.id || session.user_id || session.mobile;

    if (!userId) {
     // alert('યુઝર ID મળી નથી. કૃપા કરીને ફરીથી લોગિન કરો.');
      redirectToLogin();
      return;
    }

    // Get existing bookmarks from localStorage to check current status
    const existingBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const isCurrentlyBookmarked = existingBookmarks.some((item: any) => item.id === newsId);

    // Determine new status (toggle current status)
    const newStatus = isCurrentlyBookmarked ? 0 : 1;

   

    // Show loading state
    const bookmarkIcon = document.querySelector(`.bookmark${newsId}`) as HTMLImageElement;
    if (bookmarkIcon) {
      bookmarkIcon.style.opacity = '0.5';
    }

    // Call bookmark API
    const response = await fetch(`${API_V5_BASE_URL}/newsbookmark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        news_id: newsId,
        user_id: userId,
        status: newStatus,
        bookmark_type: bookmarkType
      }),
    });

    const data = await response.json();
   

    if (data.success) {
      // Update localStorage
      if (newStatus === 1) {
        // Add bookmark
        const newBookmark = {
          id: newsId,
          path: currentPath,
          timestamp: new Date().toISOString(),
          type: bookmarkType
        };
        existingBookmarks.push(newBookmark);
      } else {
        // Remove bookmark
        const updatedBookmarks = existingBookmarks.filter((item: any) => item.id !== newsId);
        existingBookmarks.length = 0;
        existingBookmarks.push(...updatedBookmarks);
      }
      localStorage.setItem('bookmarks', JSON.stringify(existingBookmarks));

      // Update bookmark icon - Use the correct GSTV icon paths
      if (bookmarkIcon) {
        bookmarkIcon.style.opacity = '1';
        if (newStatus === 1) {
          // When bookmarked (status = 1), use solid icon
          bookmarkIcon.src = '/images/ico_bookmark_solid.svg';
        } else {
          // When not bookmarked (status = 0), use line icon
          bookmarkIcon.src = '/images/icons_bookmark.svg';
        }
      }

      // Show success message
    //  alert(data.message || (newStatus === 1 ? 'બુકમાર્ક ઉમેરવામાં આવ્યું!' : 'બુકમાર્ક દૂર કરવામાં આવ્યું!'));
    } else {
      // Reset icon opacity on error
      if (bookmarkIcon) {
        bookmarkIcon.src = '/images/ico_bookmark_solid.svg';
      }
      
    }
  } catch (error) {
    console.error('🔖 Error handling bookmark:', error);

    // Reset icon opacity on error
    const bookmarkIcon = document.querySelector(`.bookmark${newsId}`) as HTMLImageElement;
    if (bookmarkIcon) {
      bookmarkIcon.src = '/images/ico_bookmark_solid.svg';
    }

  }
};

/**
 * Handle share functionality
 * @param titleOrNewsId - Title of the news item or newsId (for backward compatibility)
 * @param urlOrTitle - URL to share or title (for backward compatibility)
 * @param url - URL to share (optional, for backward compatibility)
 */
export const handleShare = (titleOrNewsId: string, urlOrTitle: string, url?: string): void => {
  let title: string;
  let shareUrl: string;

  // Handle both function signatures for backward compatibility
  if (url) {
    // Old signature: handleShare(newsId, title, url)
    title = urlOrTitle;
    shareUrl = url;
    
  } else {
    // New signature: handleShare(title, url)
    title = titleOrNewsId;
    shareUrl = urlOrTitle;
    
  }

  // If URL is relative, make it absolute
  const fullUrl = shareUrl.startsWith('http') ? shareUrl : `${window.location.origin}${shareUrl}`;

  // Show share modal with social media options
  showShareModal(title, fullUrl);
};

/**
 * Show share modal with social media options
 * @param title - Title to share
 * @param url - URL to share
 */
export const showShareModal = (title: string, url: string): void => {
  // Create modal HTML with improved design
  const modalHTML = `
    <div id="shareModal" class="share-modal-overlay">
      <div class="share-modal-content">
        <div class="share-modal-header">
          <h3>શેર કરો</h3>
          <button onclick="closeShareModal()" class="share-modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="share-modal-body">
          <div class="social-share-grid">
            <button onclick="shareToFacebook('${encodeURIComponent(url)}', '${encodeURIComponent(title)}')" class="social-btn facebook-btn">
              <div class="social-icon">
                <i class="fab fa-facebook-f"></i>
              </div>
              <span>Facebook</span>
            </button>

            <button onclick="shareToTwitter('${encodeURIComponent(url)}', '${encodeURIComponent(title)}')" class="social-btn twitter-btn">
              <div class="social-icon">
                <i class="fab fa-twitter"></i>
              </div>
              <span>Twitter</span>
            </button>

            <button onclick="shareToWhatsApp('${encodeURIComponent(url)}', '${encodeURIComponent(title)}')" class="social-btn whatsapp-btn">
              <div class="social-icon">
                <i class="fab fa-whatsapp"></i>
              </div>
              <span>WhatsApp</span>
            </button>

            <button onclick="shareToTelegram('${encodeURIComponent(url)}', '${encodeURIComponent(title)}')" class="social-btn telegram-btn">
              <div class="social-icon">
                <i class="fab fa-telegram-plane"></i>
              </div>
              <span>Telegram</span>
            </button>
          </div>

          <div class="copy-link-section">
            <div class="copy-input-group">
              <input type="text" value="${url}" readonly class="copy-input" id="shareUrlInput">
              <button onclick="copyShareLink('${url}')" class="copy-btn">
                <i class="fas fa-copy"></i>
                <span>કોપી</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if any
  const existingModal = document.getElementById('shareModal');
  if (existingModal) {
    existingModal.remove();
  }

  // Add modal to body
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Add global functions for sharing
  (window as any).shareToFacebook = (url: string, title: string) => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
    closeShareModal();
  };

  (window as any).shareToTwitter = (url: string, title: string) => {
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank', 'width=600,height=400');
    closeShareModal();
  };

  (window as any).shareToWhatsApp = (url: string, title: string) => {
    window.open(`https://wa.me/?text=${title}%20${url}`, '_blank');
    closeShareModal();
  };

  (window as any).shareToTelegram = (url: string, title: string) => {
    window.open(`https://t.me/share/url?url=${url}&text=${title}`, '_blank');
    closeShareModal();
  };

  (window as any).copyShareLink = (text: string) => {
    const copyBtn = document.querySelector('.copy-btn');
    const originalContent = copyBtn?.innerHTML;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        // Update button to show success
        if (copyBtn) {
          copyBtn.innerHTML = '<i class="fas fa-check"></i><span>કોપી થયું!</span>';
          copyBtn.classList.add('copied');

          setTimeout(() => {
            copyBtn.innerHTML = originalContent || '<i class="fas fa-copy"></i><span>કોપી</span>';
            copyBtn.classList.remove('copied');
          }, 2000);
        }
      }).catch(() => {
        fallbackCopyToClipboard(text);
      });
    } else {
      fallbackCopyToClipboard(text);
    }
  };

  (window as any).closeShareModal = () => {
    const modal = document.getElementById('shareModal');
    if (modal) {
      modal.style.opacity = '0';
      setTimeout(() => {
        modal.remove();
      }, 200);
    }
  };

  // Close modal when clicking outside
  document.getElementById('shareModal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      closeShareModal();
    }
  });
};

/**
 * Close share modal
 */
const closeShareModal = (): void => {
  const modal = document.getElementById('shareModal');
  if (modal) {
    modal.remove();
  }
};

/**
 * Fallback copy to clipboard for older browsers
 * @param text - Text to copy
 */
const fallbackCopyToClipboard = (text: string): void => {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
    alert('લિંક કોપી થઈ ગઈ છે!'); // Link copied!
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
    alert('લિંક કોપી કરવામાં ભૂલ થઈ!'); // Error copying link!
  }

  document.body.removeChild(textArea);
};

/**
 * Generate news item URL
 * @param newsId - ID of the news item
 * @param slug - News slug
 * @returns Generated URL path
 */
export const generateNewsUrl = (newsId: string, slug?: string): string => {
  return slug ? `/news/${slug}` : `/news/${newsId}`;
};

/**
 * Format news category for display
 * @param category - Category object or string
 * @returns Formatted category name
 */
export const formatCategory = (category: any): string => {
  if (typeof category === 'string') return category;
  return category?.name || category?.title || 'News';
};

/**
 * Check if image URL is valid
 * @param imageUrl - Image URL to validate
 * @returns Boolean indicating if URL is valid
 */
export const isValidImageUrl = (imageUrl: string): boolean => {
  if (!imageUrl) return false;
  try {
    new URL(imageUrl);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get fallback image URL
 * @returns Default fallback image URL
 */
export const getFallbackImage = (): string => {
  return '/images/default-news.jpg'; // You can customize this path
};

/**
 * Extract plain text from HTML content
 * @param htmlContent - HTML string
 * @returns Plain text content
 */
export const extractPlainText = (htmlContent: string): string => {
  if (!htmlContent) return '';
  // Remove HTML tags and decode entities
  return htmlContent
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
};

/**
 * Get optimized news image URL
 * @param news - News item object
 * @returns Optimized image URL
 */
export const getNewsImage = (news: any): string => {
  // Check for feature image first
  if (news.featureImage && news.featureImage !== null && news.featureImage !== '') {
    const fileExtension = news.featureImage.split('.').pop()?.toLowerCase();
    let newFeatureImage;

    if (news.videoURL && news.videoURL !== '') {
      newFeatureImage = news.featureImage;
    } else {
      newFeatureImage = news.featureImage.replace(`.${fileExtension}`, `_small.${fileExtension}`);
    }

    // If it's a relative path, make it absolute
    if (newFeatureImage.startsWith('/')) {
      return `${MEDIA_BASE_URL}${newFeatureImage}`;
    }
    return newFeatureImage;
  }

  // Check for video URL as fallback
  if (news.videoURL && news.videoURL !== '') {
    const fileExtension = news.videoURL.split('.').pop()?.toLowerCase();
    

    let webpUrl = news.videoURL.replace(`.${fileExtension}`, '_video.webp');
    let gifUrl  = news.videoURL.replace(`.${fileExtension}`, '_video.gif');

    // If it's a relative path, make it absolute
    if (webpUrl.startsWith('/')) {
      webpUrl = `${MEDIA_BASE_URL}${webpUrl}`;
      gifUrl  = `${MEDIA_BASE_URL}${gifUrl}`;
    }

   
    return webpUrl;
  }

  // Check for imageURL (used in TopHomeCategory)
  if (news.imageURL && news.imageURL !== '') {
    return news.imageURL;
  }

  // Default fallback image
  return '/images/gstv-logo-bg.png';
};
/**
 * Get video thumbnail URL (specific for video items)
 * @param news - News item object
 * @returns Video thumbnail URL
 */
export const getVideoThumbnail = (news: any): string => {
  // Check if both videoURL and featureImage exist
  // if (news.videoURL && news.videoURL !== '' && news.featureImage && news.featureImage !== '') {
  //   // Use featureImage directly if both exist
  //   const featureImage = news.featureImage;

  //   // If it's a relative path, make it absolute
  //   if (featureImage.startsWith('/')) {
  //     return `${MEDIA_BASE_URL}${featureImage}`;
  //   }
  //   return featureImage;
  // }

  // If only videoURL exists, create GIF thumbnail
  //  if (news.videoURL && news.videoURL !== '') {
  //   const fileExtension = news.videoURL.split('.').pop()?.toLowerCase();

  //   let jpgUrl = news.videoURL.replace(
  //     `.${fileExtension}`,
  //     '_video.jpg'
  //   );

  //   if (jpgUrl.startsWith('/')) {
  //     jpgUrl = `${MEDIA_BASE_URL}${jpgUrl}`;
  //   }

  //   return jpgUrl;
  // }
 /*if (news.videoURL && news.videoURL !== '') {
  const fileExtension = news.videoURL.split('.').pop()?.toLowerCase();

  let webpUrl = news.videoURL.replace(`.${fileExtension}`, '_video.webp');
  let gifUrl  = news.videoURL.replace(`.${fileExtension}`, '_video.gif');

  // If it's a relative path, make it absolute
  if (webpUrl.startsWith('/')) {
    webpUrl = `${MEDIA_BASE_URL}${webpUrl}`;
    gifUrl  = `${MEDIA_BASE_URL}${gifUrl}`;
  }

  // try webp first, fallback handled by browser
  return webpUrl;
}*/
 if (news.videoURL && news.videoURL !== '') {
    const fileExtension = news.videoURL.split('.').pop()?.toLowerCase();

    let webpUrl = '';

    if (Number(news.is_video_horizontal) === 1) {
      webpUrl = news.videoURL.replace(
        `.${fileExtension}`,
        '_video.webp'
      );
    } else {
      webpUrl = news.videoURL.replace(
        `.${fileExtension}`,
        '_video.webp'
      );
    }

    // If it's a relative path, make it absolute
    if (webpUrl.startsWith('/')) {
      webpUrl = `${MEDIA_BASE_URL}${webpUrl}`;
    }

    return webpUrl;
  }


  // Fallback to default video image
  return '/images/video-default.png';
};


export const getMediaImage = (news: any): string => {

  const { featureImage, videoURL, imageURL } = news || {};

  // ✅ 1️⃣ Prefer featureImage if it exists
  if (featureImage && featureImage.trim() !== '') {
    const fileExtension = featureImage.split('.').pop()?.toLowerCase();
    let finalImage = featureImage;

    // If it's a non-video news, use `_small` version
    if (!videoURL || videoURL.trim() === '') {
      finalImage = featureImage.replace(`.${fileExtension}`, `_small.${fileExtension}`);
    }

    // If it's a relative path, prepend MEDIA_BASE_URL
    return finalImage.startsWith('/') ? `${MEDIA_BASE_URL}${finalImage}` : finalImage;
  }

  // ✅ 2️⃣ If no featureImage, but videoURL exists → make GIF thumbnail
  if (videoURL && videoURL.trim() !== '') {
    const fileExtension = videoURL.split('.').pop()?.toLowerCase();
    let gifUrl = videoURL.replace(`.${fileExtension}`, '_video.gif');
    return gifUrl.startsWith('/') ? `${MEDIA_BASE_URL}${gifUrl}` : gifUrl;
  }

  // ✅ 3️⃣ Fallback to imageURL (used in TopHomeCategory or similar)
  if (imageURL && imageURL.trim() !== '') {
    return imageURL.startsWith('/') ? `${MEDIA_BASE_URL}${imageURL}` : imageURL;
  }

  // ✅ 4️⃣ Default fallback image
  return '/images/gstv-logo-bg.png';
};


/**
 * Generate news detail URL with proper category/subcategory structure
 * @param news - News item object
 * @param currentCategory - Current category context (optional)
 * @param currentSubcategory - Current subcategory context (optional)
 * @returns News detail URL
 */
export const getNewsDetailUrl = (news: any, currentCategory?: string, currentSubcategory?: string): string => {
  const newsSlug = news.slug || news.id;

  // Check if this is a video item (category ID 9) AND we're on the videos category page
  const catIDs = news.catID ? news.catID.split(',').map((id: string) => parseInt(id)) : [];
  const isVideoItem = (catIDs.includes(9) || news.is_vertical_video == 9) && currentCategory === 'videos';

  // For video items on videos category page, use /videos/ URL structure
  if (isVideoItem) {
    if(currentSubcategory){
      return `/${currentCategory}/${currentSubcategory}/${newsSlug}`; 
    } else {
      return `/${currentCategory}/${newsSlug}`;
    }
  }

  // If we have current category and subcategory context, use them
  if (currentCategory && currentSubcategory) {
    return `/news/${currentCategory}/${currentSubcategory}/${newsSlug}`;
  }

  // If we have current category context, use it
  if (currentCategory) {
    return `/news/${currentCategory}/${newsSlug}`;
  }

  // Extract category information from news item
  let categorySlug = '';
  let subcategorySlug = '';

  // Try to get category from category_slugs (comma-separated)
  if (news.category_slugs) {
    const slugs = news.category_slugs.split(',').map((s: string) => s.trim());
    categorySlug = slugs[0] || 'news';
    subcategorySlug = slugs[1] || ''; // Second slug is subcategory if exists
  }
  // Fallback to other category fields
  else if (news.category_slug) {
    categorySlug = news.category_slug;
  }
  else if (news.catSlug) {
    categorySlug = news.catSlug;
  }
  else if (news.category?.slug) {
    categorySlug = news.category.slug;
  }
  else {
    categorySlug = 'news';
  }

  // Clean slug helper function
  const cleanSlug = (str: string) =>
    (str || '')
      .toLowerCase()
      .replace(/[^a-z0-9\-\u0A80-\u0AFF]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

  const safeNewsSlug = cleanSlug(newsSlug);
  const safeCategorySlug = cleanSlug(categorySlug) || 'news';
  const safeSubcategorySlug = cleanSlug(subcategorySlug);

  // Build URL based on available information
  if (safeSubcategorySlug) {
    return `/news/${safeCategorySlug}/${safeSubcategorySlug}/${safeNewsSlug}`;
  } else {
    return `/news/${safeCategorySlug}/${safeNewsSlug}`;
  }
};

/**
 * Generate category URL
 * @param categorySlug - Category slug
 * @param subcategorySlug - Subcategory slug (optional)
 * @returns Category URL
 */
export const getCategoryUrl = (categorySlug: string, subcategorySlug?: string): string => {
  const cleanSlug = (str: string) =>
    (str || '')
      .toLowerCase()
      .replace(/[^a-z0-9\-\u0A80-\u0AFF]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

  const safeCat = cleanSlug(categorySlug) || 'news';
  const safeSub = cleanSlug(subcategorySlug || '');

  if (safeSub) {
    return `/category/${safeCat}/${safeSub}`;
  }
  return `/category/${safeCat}`;
};


