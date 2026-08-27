'use client';
import { useEffect } from 'react';

/**
 * Converts raw URLs in news description into rich embeds
 * (Twitter/X, Facebook, Instagram, YouTube, and PDF).
 * Matches the Laravel implementation for consistent embed rendering.
 */
export function embedSocialMediaLinks(content: string, uniqueId?: string): string {
  if (!content) return '';

  let processed = content;

  // 🐦 Twitter/X - Handle both twitter.com and x.com URLs
  // Pattern 1: Twitter URLs inside <p> tags
  processed = processed.replace(
    /<p>\s*(https?:\/\/(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)\/status\/([0-9]+))\s*<\/p>/g,
    (match, url) => `
      <!--SOCIAL_EMBED_START-->
      <div class="social-media-embed twitter-embed">
        <blockquote class="twitter-tweet">
          <a href="${url}"></a>
        </blockquote>
      </div>
      <!--SOCIAL_EMBED_END-->
    `
  );

  // Pattern 2: X.com URLs inside <p> tags
  processed = processed.replace(
    /<p>\s*(https?:\/\/(?:www\.)?x\.com\/([a-zA-Z0-9_]+)\/status\/([0-9]+))\s*<\/p>/g,
    (match, url) => `
      <!--SOCIAL_EMBED_START-->
      <div class="social-media-embed twitter-embed">
        <blockquote class="twitter-tweet">
          <a href="${url}"></a>
        </blockquote>
      </div>
      <!--SOCIAL_EMBED_END-->
    `
  );

  // Pattern 3: Plain Twitter URLs (not in <p> tags)
  processed = processed.replace(
    /(?<!<p>)\s*(https?:\/\/(?:www\.)?twitter\.com\/[a-zA-Z0-9_]+\/status\/[0-9]+)(?!\s*<\/p>)/g,
    (match, url) => `
      <!--SOCIAL_EMBED_START-->
      <div class="social-media-embed twitter-embed">
        <blockquote class="twitter-tweet">
          <a href="${url}"></a>
        </blockquote>
      </div>
      <!--SOCIAL_EMBED_END-->
    `
  );

  // Pattern 4: Plain X.com URLs (not in <p> tags)
  processed = processed.replace(
    /(?<!<p>)\s*(https?:\/\/(?:www\.)?x\.com\/[a-zA-Z0-9_]+\/status\/[0-9]+)(?!\s*<\/p>)/g,
    (match, url) => `
      <!--SOCIAL_EMBED_START-->
      <div class="social-media-embed twitter-embed">
        <blockquote class="twitter-tweet">
          <a href="${url}"></a>
        </blockquote>
      </div>
      <!--SOCIAL_EMBED_END-->
    `
  );

  // 📸 Instagram - Handle Post URLs inside <p> tags
  processed = processed.replace(
    /<p>\s*(https?:\/\/(?:www\.)?instagram\.com\/p\/([a-zA-Z0-9_-]+)\/?)\s*<\/p>/g,
    (match, url) => `
      <!--SOCIAL_EMBED_START-->
      <div class="social-media-embed instagram-embed">
        <blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="13"></blockquote>
      </div>
      <!--SOCIAL_EMBED_END-->
    `
  );

  // Instagram - Handle Reel URLs inside <p> tags
  processed = processed.replace(
    /<p>\s*(https?:\/\/(?:www\.)?instagram\.com\/reel\/([a-zA-Z0-9_-]+)\/?)\s*<\/p>/g,
    (match, url, shortcode) => `
      <!--SOCIAL_EMBED_START-->
      <div class="social-media-embed instagram-embed">
        <iframe src="${url}embed" width="400" height="500" frameborder="0" scrolling="no" allowtransparency="true"></iframe>
      </div>
      <!--SOCIAL_EMBED_END-->
    `
  );

  // Instagram - Plain Post URLs (not in tags)
  processed = processed.replace(
    /(?<!<p>)\s*(https?:\/\/(?:www\.)?instagram\.com\/p\/[a-zA-Z0-9_-]+\/?)(?!\s*<\/p>)/g,
    (match, url) => `
      <!--SOCIAL_EMBED_START-->
      <div class="social-media-embed instagram-embed">
        <blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="13"></blockquote>
      </div>
      <!--SOCIAL_EMBED_END-->
    `
  );

  // Instagram - Plain Reel URLs (not in tags)
  processed = processed.replace(
    /(?<!<p>)\s*(https?:\/\/(?:www\.)?instagram\.com\/reel\/[a-zA-Z0-9_-]+\/?)(?!\s*<\/p>)/g,
    (match, url) => `
      <!--SOCIAL_EMBED_START-->
      <div class="social-media-embed instagram-embed">
        <iframe src="${url}embed" width="400" height="500" frameborder="0" scrolling="no" allowtransparency="true"></iframe>
      </div>
      <!--SOCIAL_EMBED_END-->
    `
  );

  // 👍 Facebook Watch - Handle fb.watch URLs inside <p> tags
  processed = processed.replace(
    /<p>\s*(https?:\/\/fb\.watch\/([a-zA-Z0-9_-]+))\s*<\/p>/g,
    (match, url) => `
      <!--SOCIAL_EMBED_START-->
      <div class="social-media-embed facebook-embed">
        <iframe style="width: 100%; height: 500px; border: none; overflow: hidden;" src="https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}" frameborder="0" scrolling="no"></iframe>
      </div>
      <!--SOCIAL_EMBED_END-->
    `
  );

  // Facebook Watch - Plain URLs (not in tags)
  processed = processed.replace(
    /(?<!<p>)\s*(https?:\/\/fb\.watch\/[a-zA-Z0-9_-]+)(?!\s*<\/p>)/g,
    (match, url) => `
      <!--SOCIAL_EMBED_START-->
      <div class="social-media-embed facebook-embed">
        <iframe style="width: 100%; height: 500px; border: none; overflow: hidden;" src="https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}" frameborder="0" scrolling="no"></iframe>
      </div>
      <!--SOCIAL_EMBED_END-->
    `
  );

  // Facebook - Regular post URLs inside <p> tags
  processed = processed.replace(
    /<p>\s*(https?:\/\/(?:www\.)?facebook\.com\/[^\/\s]+\/posts\/[^\/\s]+)\s*<\/p>/g,
    (match, url) => `
      <!--SOCIAL_EMBED_START-->
      <div class="social-media-embed facebook-embed">
        <div class="fb-post" data-href="${url}" data-width="500"></div>
      </div>
      <!--SOCIAL_EMBED_END-->
    `
  );

  // Facebook - Regular post URLs (not in tags)
  processed = processed.replace(
    /(?<!<p>)\s*(https?:\/\/(?:www\.)?facebook\.com\/[^\/\s]+\/posts\/[^\/\s]+)(?!\s*<\/p>)/g,
    (match, url) => `
      <!--SOCIAL_EMBED_START-->
      <div class="social-media-embed facebook-embed">
        <div class="fb-post" data-href="${url}" data-width="500"></div>
      </div>
      <!--SOCIAL_EMBED_END-->
    `
  );

  // ▶️ YouTube - Handle URLs inside <p> tags
  processed = processed.replace(
    /<p>\s*(https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+))\s*<\/p>/g,
    (match, url, videoId) => `
      <!--SOCIAL_EMBED_START-->
      <div class="social-media-embed youtube-embed" style="text-align:center;">
        <iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
      </div>
      <!--SOCIAL_EMBED_END-->
    `
  );

  // YouTube - Plain URLs (not in tags)
  processed = processed.replace(
    /(?<!<p>)\s*(https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+))(?!\s*<\/p>)/g,
    (match, url, videoId) => `
      <!--SOCIAL_EMBED_START-->
      <div class="social-media-embed youtube-embed" style="text-align:center;">
        <iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
      </div>
      <!--SOCIAL_EMBED_END-->
    `
  );

  // YouTube Short URLs (youtu.be) - inside <p> tags
  processed = processed.replace(
    /<p>\s*(https?:\/\/youtu\.be\/([a-zA-Z0-9_-]+))\s*<\/p>/g,
    (match, url, videoId) => `
      <!--SOCIAL_EMBED_START-->
      <div class="social-media-embed youtube-embed" style="text-align:center;">
        <iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
      </div>
      <!--SOCIAL_EMBED_END-->
    `
  );

  // YouTube Short URLs (youtu.be) - Plain URLs
  processed = processed.replace(
    /(?<!<p>)\s*(https?:\/\/youtu\.be\/([a-zA-Z0-9_-]+))(?!\s*<\/p>)/g,
    (match, url, videoId) => `
      <!--SOCIAL_EMBED_START-->
      <div class="social-media-embed youtube-embed" style="text-align:center;">
        <iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
      </div>
      <!--SOCIAL_EMBED_END-->
    `
  );

  // 📄 PDF - Handle PDF URLs inside <p> tags
  processed = processed.replace(
    /<p>\s*(https?:\/\/[^\s\n]+\.pdf)\s*<\/p>/g,
    (match, url) => {
      const encodedPdfUrl = encodeURIComponent(url);
      return `
      <!--SOCIAL_EMBED_START-->
      <div class="social-media-embed pdf-embed" style="position:relative; width:100%; height:500px;">
        <iframe src="https://docs.google.com/gview?url=${encodedPdfUrl}&embedded=true" style="width:100%; height:100%; border:none;" allowfullscreen></iframe>
        <noscript>
          <a href="${url}">Download PDF</a>
        </noscript>
      </div>
      <!--SOCIAL_EMBED_END-->
    `;
    }
  );

  // PDF - Plain URLs (not in tags)
  processed = processed.replace(
    /(?<!<p>)\s*(https?:\/\/[^\s\n]+\.pdf)(?!\s*<\/p>)/g,
    (match, url) => {
      const encodedPdfUrl = encodeURIComponent(url);
      return `
      <!--SOCIAL_EMBED_START-->
      <div class="social-media-embed pdf-embed" style="position:relative; width:100%; height:500px;">
        <iframe src="https://docs.google.com/gview?url=${encodedPdfUrl}&embedded=true" style="width:100%; height:100%; border:none;" allowfullscreen></iframe>
        <noscript>
          <a href="${url}">Download PDF</a>
        </noscript>
      </div>
      <!--SOCIAL_EMBED_END-->
    `;
    }
  );

  return processed;
}
