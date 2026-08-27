/**
 * Utility functions for social sharing and date formatting
 */

/**
 * Format date like Laravel Carbon (DD MMM YYYY)
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "15 Oct 2025")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

/**
 * Share content on social media platforms
 * @param platform - Social media platform (facebook, twitter, whatsapp)
 * @param url - URL to share
 * @param title - Title/text to share
 */
export const shareOnSocial = (platform: string, url: string, title: string): void => {
  let shareUrl = '';
  
  switch (platform) {
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      break;
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
      break;
    case 'whatsapp':
      shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`;
      break;
    default:
      console.warn(`Unknown platform: ${platform}`);
      return;
  }

  if (shareUrl) {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }
};

/**
 * Copy link to clipboard
 * @param url - URL to copy
 * @param successMessage - Optional success message (default: 'લિંક કોપી થઈ ગઈ!')
 */
export const copyLinkToClipboard = (url: string, successMessage: string = 'લિંક કોપી થઈ ગઈ!'): void => {
  navigator.clipboard.writeText(url)
    .then(() => {
      alert(successMessage);
    })
    .catch((err) => {
      console.error('Failed to copy link:', err);
      alert('લિંક કોપી કરવામાં નિષ્ફળ!');
    });
};

