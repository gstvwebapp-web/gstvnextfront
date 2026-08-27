/**
 * Common Grid Components for News Layout
 */

import React, { useState, useEffect, memo, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  getNewsImage,
  getVideoThumbnail,
  calculateReadingTime,
  formatDate,
  handleShare,
  getNewsDetailUrl
} from '@/utils/newsUtils';
import ShareButtons from '../ShareButtons';

/* ===================== Utils (UNCHANGED) ===================== */
export function stripHtmlAndDecode(html: string): string {
  if (!html) return '';

  if (typeof window === 'undefined') {
    return html
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }

  const temp = document.createElement('div');
  temp.innerHTML = html;
  return (temp.textContent || temp.innerText || '').trim();
}

/* ===================== GridContainer ===================== */
export const GridContainer = memo(({ children, className = '' }: any) => (
  <div className={`row blog-content ${className}`}>
    {children}
  </div>
));
GridContainer.displayName = 'GridContainer';

/* ===================== NewsCard ===================== */
export const NewsCard = memo((props: any) => {
  const {
    news,
    showImage = true,
    showDescription = true,
    showReadingTime = true,
    showBookmark = true,
    showShare = true,
    descriptionLength = 120,
    className = '',
    currentCategory = '',
    currentSubcategory = ''
  } = props;

  const newsUrl = useMemo(
    () => getNewsDetailUrl(news, currentCategory, currentSubcategory),
    [news, currentCategory, currentSubcategory]
  );

  const imageUrl = useMemo(() => getNewsImage(news), [news]);

  const description = useMemo(
    () => stripHtmlAndDecode(news.description || '').slice(0, descriptionLength),
    [news.description, descriptionLength]
  );

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const checkBookmarkStatus = useCallback(() => {
    if (typeof window === 'undefined') return false;
    try {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      return bookmarks.some((b: any) => b.id === news.id);
    } catch {
      return false;
    }
  }, [news.id]);

  useEffect(() => {
    setIsMounted(true);
    setIsBookmarked(checkBookmarkStatus());
  }, [checkBookmarkStatus]);

  const handleBookmarkClick = useCallback(async () => {
    const { handleBookmark } = await import('@/utils/commonUtils');
    const result = await handleBookmark({
      id: news.id,
      title: news.title,
      slug: news.slug,
      type: 'news'
    });
    setIsBookmarked(result);
  }, [news]);

  return (
    <div className={`news-card ${className}`}>
      {showImage && (
        <div className="news-image" style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
          <a href={newsUrl}>
            <img
              src={`${imageUrl}?v=${Date.now()}`}
              alt={news.title}
              width={400}
              height={225}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => {
                (e.target as HTMLImageElement).src = '/images/gstv-logo-bg.png';
              }}
            />
          </a>
        </div>
      )}

      <div className="news-content">
        <h3 className="news-title">
          <a href={newsUrl}>{news.title}</a>
        </h3>

        {showDescription && news.description && (
          <p className="news-description">{description}...</p>
        )}

        <div className="news-meta">
          <span className="news-date">
            છેલ્લું અપડેટ: {isMounted ? formatDate(news.created_at, true) : ''}
          </span>

          {showReadingTime && (
            <span className="reading-time">
              {calculateReadingTime(news.description, true)} મિનિટ વાંચન સમય
            </span>
          )}
        </div>

        {(showBookmark || showShare) && (
          <div className="news-actions">
            <ShareButtons
              url={newsUrl}
              title={news.title}
              variant="fontawesome"
              showDate
              date={news.created_at}
              imageUrl={news.video_img || imageUrl}
            />

            {showShare && (
              <button
                className="action-btn share-btn"
                onClick={() =>
                  handleShare(
                    news.id.toString(),
                    news.title,
                    typeof window !== 'undefined'
                      ? `${window.location.origin}${newsUrl}`
                      : newsUrl
                  )
                }
              >
                <i className="fas fa-share-alt" />
                <span>શેર</span>
              </button>
            )}

            {showBookmark && (
              <button className="action-btn bookmark-btn" onClick={handleBookmarkClick}>
                <img
                  src={
                    isBookmarked
                      ? '/images/ico_bookmark_solid.svg'
                      : '/images/ico_bookmark_line.svg'
                  }
                  alt="Bookmark"
                />
                <span>સેવ</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
NewsCard.displayName = 'NewsCard';

/* ===================== BlogGridItem ===================== */
export const BlogGridItem = memo((props: any) => {
  // ✅ isLCP: first card on page — load eagerly with high fetch priority for LCP
  const { news, className = '', currentCategory = '', currentSubcategory = '', isLCP = false } = props;

  const newsUrl = useMemo(
    () => getNewsDetailUrl(news, currentCategory, currentSubcategory),
    [news, currentCategory, currentSubcategory]
  );

  const imageUrl = useMemo(() => getNewsImage(news), [news]);
  const videoThumb = useMemo(() => getVideoThumbnail(news), [news]);

  const catIDs = useMemo(
    () => (news.catID ? news.catID.split(',').map(Number) : []),
    [news.catID]
  );

  const hideLastUpdate = catIDs.includes(120);
  const isVideoItem =
    (catIDs.includes(9) || news.is_vertical_video == 9) &&
    currentCategory === 'videos';

  const description = useMemo(
    () => stripHtmlAndDecode(news.description || '').slice(0, 120),
    [news.description]
  );

  const [isMounted, setIsMounted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkUpdate, setBookmarkUpdate] = useState(0);

  const checkBookmarkStatus = useCallback(() => {
    if (typeof window === 'undefined') return false;
    try {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      return bookmarks.some((b: any) => b.id === news.id);
    } catch {
      return false;
    }
  }, [news.id]);

  useEffect(() => {
    setIsMounted(true);
    setIsBookmarked(checkBookmarkStatus());
  }, [bookmarkUpdate, checkBookmarkStatus]);

  useEffect(() => {
    const handler = () => setIsBookmarked(checkBookmarkStatus());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [checkBookmarkStatus]);

  const handleBookmarkClick = useCallback(async () => {
    const { handleBookmark } = await import('@/utils/commonUtils');
    const result = await handleBookmark({
      id: news.id,
      title: news.title,
      slug: news.slug,
      type: 'news'
    });
    setIsBookmarked(result);
    setBookmarkUpdate(v => v + 1);
  }, [news]);

  /* ---------- VIDEO CARD (UNCHANGED JSX) ---------- */
  if (isVideoItem) {
    return (
      <div className={`col-lg-3 col-6 custom-video-section ${className}`} id="news-container">
        <a href={newsUrl} className="popupbtn">
          <div className="blog-read-content">
            <div className="card">
              <div className="img-wrappers">
                <div className="videonewscls">
                  <div className="lazyload-wrapper">
                    {/* <img
                      src={videoThumb}
                      className="lazyload gridimg custom-image"
                      alt={news.title}
                      loading="lazy"
                      onError={e => {
                        const img = e.currentTarget as HTMLImageElement;
                        img.onerror = null;
                        img.src = img.src.replace('_video.webp', '_video.gif');
                      }}
                    /> */}
                    <img
                      src={videoThumb}
                      className="lazyload gridimg custom-image"
                      alt={news.title}
                      loading="lazy"
                      onError={e => {
                        const img = e.currentTarget as HTMLImageElement;

                        // Prevent infinite loop
                        img.onerror = null;

                        // If jpg/webp fails → load gif
                        if (
                          img.src.includes('_video.jpg') ||
                          img.src.includes('_video.webp')
                        ) {
                          img.src = img.src
                            .replace('_video.jpg', '_video.gif')
                            .replace('_video.webp', '_video.gif');
                        } else {
                          // If gif also fails → default image
                          img.src = '/images/gstv-logo-bg.png';
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="play-icon">
                  <i className="fa fa-play-circle" />
                </div>
                <h4 className="video-title">{news.title}</h4>
              </div>
            </div>
          </div>
        </a>
      </div>
    );
  }

  /* ---------- NORMAL CARD (UNCHANGED JSX) ---------- */
  return (
    <div className={`col-lg-4 ${className}`}>
      <div className="blog-read-content custom-top-news hometopnews">
        <a href={newsUrl} className="flexAlink">
          <h4 className="custom-blog-title">{news.title}</h4>

          <div className={`hover-image detail-video-news ${news.videoURL ? 'bgvideonews' : ''}`}>
            {/* ✅ aspect-ratio wrapper prevents CLS — browser reserves space before image loads */}
            <div className="lazyload-wrapper" style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
              <img
                src={`${imageUrl}?v=${Date.now()}`}
                className="gridimg custom-image"
                alt={news.title}
                width={400}
                height={225}
                // ✅ First above-fold image: eager + high priority = LCP fix
                // ✅ Remaining: lazy load as before
                loading={isLCP ? 'eager' : 'lazy'}
                // @ts-ignore fetchpriority is a valid HTML attribute
                fetchpriority={isLCP ? 'high' : 'low'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => {
                  (e.target as HTMLImageElement).src = '/images/gstv-logo-bg.png';
                }}
              />
            </div>

            {news.videoURL && (
              <div className="play-icon">
                <i className="fa fa-play-circle" style={{ paddingTop: '7px' }} />
              </div>
            )}
          </div>

          <p className="blog-excerpt">{description}...</p>
        </a>

        <span className="last-update-blog for-lg">
          {!hideLastUpdate
            ? isMounted
              ? `છેલ્લું અપડેટ : ${formatDate(news.created_at)}`
              : '\u00A0'
            : '\u00A0'}
        </span>

        <div className="blog-featured-functions">
          <div className="reading-time-blog" style={{ float: 'left' }}>
            <span className="last-update-blog for-sm">
              {isMounted ? formatDate(news.created_at) : ''}
            </span>
            <div className="custom-reading-time">
              <div className="reading-icon">
                <img src="/images/clock.webp" alt="gstv news" />
              </div>
              {calculateReadingTime(news.description || news.title || '')} મિનિટ વાંચન સમય
            </div>
          </div>

          <div className={`ico_bookmark${news.id} bookmarkicon`}>
            <div className="bookmark-share-actions">
              <ShareButtons
                url={`${typeof window !== 'undefined'
                  ? `${window.location.origin}${newsUrl}`
                  : newsUrl}`}
                title={news.title}
                variant="fontawesome"
                showDate
                date={news.created_at}
                imageUrl={news.video_img || imageUrl}
              />

              <button onClick={handleBookmarkClick} className="action-btn bookmark-btn">
                <img
                  src={
                    isBookmarked
                      ? '/images/ico_bookmark_solid.svg'
                      : '/images/ico_bookmark_line.svg'
                  }
                  alt="Bookmark"
                />
              </button>
            </div>
          </div>

          <div className="Toastify"></div>
        </div>
      </div>
    </div>
  );
});
BlogGridItem.displayName = 'BlogGridItem';
