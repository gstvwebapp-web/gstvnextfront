'use client';

import React, { useState, useEffect } from 'react';

interface VideoActionButtonsProps {
  videoId: number;
  videoSlug: string;
  videoTitle: string;
  videohorizontal: number | string;
  likeCount: number;
  likedByUser: number;
  bookmark: number;  
  onLike: (videoId: number) => void | Promise<void>;
  onBookmark: (videoId: number) => void | Promise<void>;
  onShare: (platform: string) => void;
  isBookmarking?: boolean;
}

const VideoActionButtons: React.FC<VideoActionButtonsProps> = ({
  videoId,
  videoSlug,
  videoTitle,
  videohorizontal,
  likeCount,
  likedByUser,
  bookmark,
  onLike,
  onBookmark,
  onShare,
  isBookmarking = false,
}) => {

  const [isMobile, setIsMobile] = useState(false);
  const [showAll, setShowAll] = useState(false);
console.log ('VideoActionButtons rendering...'+likedByUser + ' ' + videoId);
  /* ✅ Mobile Detection (Accurate) */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /* ✅ Reset Menu On Video Change */
  useEffect(() => {
    setShowAll(false);
  }, [videoId]);

  const handleToggle = () => setShowAll((prev) => !prev);
 
  return (
    <div
      className="shareVideo"
      style={{
        position: 'absolute',         // ✅ important fix
        right: isMobile ? '12px' : 'auto',
        left: isMobile
      ? 'auto'
      : Number(videohorizontal) === 1
        ? '77%'
        : '61.5%',
        top: isMobile ? '10px' : 'auto',
        bottom: isMobile ? 'auto' : '15.5%',
        backgroundColor: isMobile ? 'transparent' : '#ffffffe0',
        padding: isMobile ? '0' : '5px',
        borderRadius: '30px',
        zIndex: 1000,
        transition: 'all 0.3s ease',
      }}
    >
      <span className="shorts_article_share">
        <div
          className="shareIcons"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          }}
        >

          {/* ✅ MOBILE VIEW */}
          {isMobile ? (
            <>
              {/* 🔴 Main Share Button */}
              <button
                onClick={handleToggle}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#8B0000',
                  color: '#fff',
                  border: '2px solid #8B0000',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  boxShadow: '0 2px 2px rgba(0,0,0,0.25)',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <i className="fa fa-share-alt" style={{ color: '#fff' }}></i>
              </button>

              {/* ✅ Expandable Panel */}
              {showAll && (
                <div
                  style={{
                    position: 'absolute',
                    top: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: '#ffffffe0',
                    borderRadius: '12px',
                    padding: '5px',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.25)',
                    animation: 'fadeIn 0.25s ease',
                  }}
                >
                  {/* ❤️ Like */}
                
                  <a onClick={() => onLike(videoId)} style={{ cursor: 'pointer' }}>
  <i
    className={likedByUser === 1 ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}
    style={{
      fontSize: '15px',
      color: likedByUser === 1 ? '#870e00' : '#000',
      transition: 'all 0.25s ease'
    }}
  ></i>
</a>

                  <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{likeCount || 0}</span>

                  {/* 🔖 Bookmark */}
                  <a
                    onClick={() => !isBookmarking && onBookmark(videoId)}
                    style={{ opacity: isBookmarking ? 0.5 : 1 }}
                  >
                    <i
                      className={`fa-${bookmark ? 'solid' : 'regular'} fa-bookmark`}
                      style={{
                        color: bookmark ? '#870e00' : '#000',
                        fontSize: '16px',
                        marginTop: '4px'
                      }}
                    />
                  </a>

                  {/* 🌐 Social */}
                  <a onClick={() => onShare('facebook')}>
                    <i className="fab fa-facebook-f" />
                  </a>

                  <a onClick={() => onShare('twitter')}>
                    <i className="fa-brands fa-x-twitter" />
                  </a>

                  <a onClick={() => onShare('whatsapp')}>
                    <i className="fab fa-whatsapp" />
                  </a>

                  <a onClick={() => onShare('share')}>
                    <i className="fa fa-link" />
                  </a>

                  <a
                    href="https://youtube.com/@gstvnews"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fa-brands fa-youtube" />
                  </a>

                </div>
              )}
            </>
          ) : (
            /* ✅ Desktop View */
            <>
              <a onClick={() => onLike(videoId)} style={{ cursor: 'pointer' }}>
                <i
                  className={likedByUser === 1 ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}
                  style={{
                    fontSize: '15px',
                    color: likedByUser === 1 ? '#870e00' : '#000',
                    transition: 'all 0.25s ease'
                  }}
                ></i>
              </a>

              <span style={{ fontSize: '10px', fontWeight: 'bold' }}>
                {likeCount || 0}
              </span>

              <a onClick={() => onBookmark(videoId)} style={{ opacity: isBookmarking ? 0.5 : 1 }}>
                <i
                  className={`fa-${bookmark ? 'solid' : 'regular'} fa-bookmark`}
                  style={{ fontSize: '15px', color: bookmark ? '#870e00' : '#000' }}
                />
              </a>

              <a onClick={() => onShare('facebook')}><i className="fab fa-facebook-f" /></a>
              <a onClick={() => onShare('twitter')}><i className="fa-brands fa-x-twitter" /></a>
              <a onClick={() => onShare('whatsapp')}><i className="fab fa-whatsapp" /></a>
              <a onClick={() => onShare('share')}><i className="fa fa-link" /></a>

              {/* <a href="https://youtube.com/@gstvnews" target="_blank">
                <i className="fa-brands fa-youtube" />
              </a> */}
            </>
          )}

        </div>
      </span>

      {/* ✅ Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .shareIcons a {
          cursor: pointer;
        }

        .shareIcons i {
          font-size: 15px;
          color: #000;
        }

        .shareIcons i:hover {
          color: #870e00;
        }
      `}</style>

    </div>
  );
};

export default VideoActionButtons;
