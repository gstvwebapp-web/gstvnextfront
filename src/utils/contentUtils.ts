import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHtmlContent = (html: string): string => {
  if (!html) return '';
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(html, {
      ADD_TAGS: ['iframe', 'blockquote', 'script', 'style', 'svg', 'g', 'path'],
      ADD_ATTR: [
        'allow',
        'allowfullscreen',
        'frameborder',
        'scrolling',
        'target',
        'data-instgrm-permalink',
        'data-instgrm-version',
        'async',
        'charset',
        'src',
        'width',
        'height',
        'style',
        'class',
        'viewbox',
        'xmlns',
        'xmlns:xlink',
      ],
    });
  }
  // Server-side fallback basic sanitization (remove dangerous inline script tags)
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

/**
 * Sanitize user input query text (search inputs, text boxes)
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (!query) return '';
  return query
    .replace(/[<>'"/]/g, '')
    .trim()
    .slice(0, 200);
};

/**
 * Process content and embed social media
 * @param content The HTML content to process
 * @returns Processed HTML content with embedded media
 */
export const processContentWithEmbeds = (content: string): string => {
  let processedContent = content || '';

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
  const twitterRegex = /https?:\/\/twitter\.com\/[a-zA-Z0-9_]+\/status\/[0-9]+/g;
  processedContent = processedContent.replace(twitterRegex, (match) => {
    return `<div style="margin: 20px 0; text-align: center;">
      <blockquote class="twitter-tweet">
        <a href="${match}"></a>
      </blockquote>
    </div>`;
  });

  // Instagram embed
  const instagramRegex = /https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/g;
  processedContent = processedContent.replace(instagramRegex, (match, postId) => {
    return `<div style="margin: 20px 0; text-align: center;">
      <blockquote 
        class="instagram-media" 
        data-instgrm-permalink="${match}" 
        data-instgrm-version="14"
        style="
          background:#FFF; 
          border:0; 
          border-radius:3px; 
          box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); 
          margin: 1px; 
          max-width:540px; 
          min-width:326px; 
          padding:0; 
          width:99.375%; 
          width:-webkit-calc(100% - 2px); 
          width:calc(100% - 2px);"
      >
        <div style="padding:16px;">
          <a href="${match}" style="background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank">
            <div style="display: flex; flex-direction: row; align-items: center;">
              <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div>
              <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;">
                <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div>
                <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div>
              </div>
            </div>
            <div style="padding: 19% 0;"></div>
            <div style="padding-top: 8px;">
              <div style="color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">View this post on Instagram</div>
            </div>
          </a>
        </div>
      </blockquote>
    </div>`;
  });

  // Facebook embed
  const facebookRegex = /https?:\/\/(?:www\.)?facebook\.com\/[^\/]+\/(?:posts|videos)\/[0-9]+/g;
  processedContent = processedContent.replace(facebookRegex, (match) => {
    return `<div style="margin: 20px 0; text-align: center;">
      <iframe 
        src="https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(match)}&show_text=true" 
        width="100%" 
        height="500" 
        style="border:none;overflow:hidden;max-width:560px;border-radius:8px;" 
        scrolling="no" 
        frameborder="0" 
        allowTransparency="true" 
        allow="encrypted-media"
      ></iframe>
    </div>`;
  });

  return sanitizeHtmlContent(processedContent);
};

/**
 * Extract video ID from YouTube URL
 */
export const extractYouTubeVideoId = (url: string): string | null => {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

/**
 * Get YouTube thumbnail URL from video ID
 */
export const getYouTubeThumbnailUrl = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};
