'use client';

import React, { useState } from 'react';
import { FaFacebookF, FaWhatsapp, FaLink } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { formatDate } from '@/utils/shareUtils';

interface ShareButtonsProps {
  url: string;
  title: string;
  imageUrl: string;
  description?: string;
  className?: string;
  variant?: 'icons' | 'fontawesome' | 'react-icons';
  date?: string;
  showDate?: boolean;
  copySuccessMessage?: string;
}

export default function ShareButtons({
  url,
  title,
  imageUrl,
  description = "",
  className = '',
  variant = 'react-icons',
  date,
  showDate = false,
  copySuccessMessage = 'લિંક કોપી થઈ ગઈ!'
}: ShareButtonsProps) {

  const [showCopyToast, setShowCopyToast] = useState(false);

  // Detect mobile
  const isMobile = () => {
    if (typeof navigator === "undefined") return false;
    return /Android|iPhone|iPod/i.test(navigator.userAgent);
  };

  // Convert image URL → file for mobile sharing
  const urlToFile = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new File([blob], "image.jpg", { type: blob.type });
    } catch (err) {
      console.error("Image fetch failed:", err);
      return null;
    }
  };

  // ⭐ FIXED MOBILE SHARE — NOW SHOWS TITLE + DESCRIPTION + URL CORRECTLY
  const handleMobileShare = async () => {
  if (!navigator.share) {
    copyLink();
    return;
  }

  try {
    await navigator.share({
      title,
      text: description || '',
      url
    });
  } catch (err) {
    console.error('Mobile share failed:', err);
  }
};

  // Popup share
  const openSharePopup = (shareUrl: string) => {
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    window.open(
      shareUrl,
      'sharePopup',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  // Copy link
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  // Share URLs
  const facebookShareUrl =
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  const twitterShareUrl =
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;

  //const whatsappShareUrl =`https://wa.me/?text=${encodeURIComponent(`${title}\n${description}\n${url}`)}`;
  const whatsappShareUrl =
  `https://wa.me/?text=${encodeURIComponent(`${description}\n${url}`)}`;  


  // RENDER VARIANTS
  const renderShareButtons = () => {

    // ---------------- ICON VARIANT ----------------
    if (variant === 'icons') {
      return (
        <div className={`blog-featured-functions ${className}`}>
          <div className="reading-time-blog">

            {showDate && date && (
              <span className="last-update-blog for-sm">{formatDate(date)}</span>
            )}

            {isMobile() ? (
              <span onClick={handleMobileShare} style={{ cursor: "pointer" }}>
                <i className="fa fa-share-alt" style={{ fontSize: "20px", color: "#850e00" }} />
              </span>
            ) : (
              <>
                <span className="share-with-label">Share With:</span>

                <span className="share-icon" onClick={() => openSharePopup(facebookShareUrl)}>
                  <img src="/assets/images/facebook.svg" width="20" height="20" />
                </span>

                <span className="share-icon" onClick={() => openSharePopup(twitterShareUrl)}>
                  <img src="/assets/images/twitter.svg" width="20" height="20" />
                </span>

                <span className="share-icon" onClick={() => openSharePopup(whatsappShareUrl)}>
                  <img src="/assets/images/whatsapp.svg" width="20" height="20" />
                </span>

                <span className="share-icon" onClick={copyLink}>
                  <img src="/assets/images/copy.svg" width="20" height="20" />
                </span>
              </>
            )}
          </div>
        </div>
      );
    }

    // ---------------- FONTAWESOME VARIANT ----------------
    if (variant === 'fontawesome') {
      return (
        <div className={`blog-featured-functions ${className} customshare`}>
          {isMobile() ? (
            <span onClick={handleMobileShare} style={{ cursor: "pointer" }} className='bookmark-btn-news'>
              <i className="fa fa-share-alt" style={{ fontSize: "16px", color: "#fff" }} />
            </span>
          ) : (
            <div className="blog-like-share-save customshare">
  <a onClick={() => openSharePopup(facebookShareUrl)} className="sharingiconcls">
   
   <i className="fab fa-facebook-f socialiconcls fb-circle"></i>
  </a>

  <a onClick={() => openSharePopup(twitterShareUrl)} className="sharingiconcls">
    <i className="fab fa-x-twitter socialiconcls x-circle"></i>
  </a>

  <a onClick={() => openSharePopup(whatsappShareUrl)} className="sharingiconcls">
    <i className="fab fa-whatsapp socialiconcls wa-circle"></i>
  </a>

  <a onClick={copyLink} className="sharingiconcls">
   <i className="fa fa-link socialiconcls link-circle"></i>
  </a>
</div>

          )}
        </div>
      );
    }

    // ---------------- REACT ICONS DEFAULT VARIANT ----------------
    return (
      <div className={`blog-like-share-save ${className}`}>
        {showDate && date && (
          <span className="last-update-blog for-sm">{formatDate(date)}</span>
        )}

        {isMobile() ? (
          <span onClick={handleMobileShare} style={{ cursor: "pointer" }}>
            <i className="fa fa-share-alt" style={{ fontSize: "20px", color: "#850e00" }} />
          </span>
        ) : (
          <>
            <span className="custom-link-text">Share With:</span>

            <a onClick={() => openSharePopup(facebookShareUrl)}>
              <FaFacebookF />
            </a>

            <a onClick={() => openSharePopup(twitterShareUrl)}>
              <FaXTwitter />
            </a>

            <a href={whatsappShareUrl} target="_blank">
              <FaWhatsapp />
            </a>

            <a onClick={copyLink}>
              <FaLink />
            </a>
          </>
        )}
      </div>
    );
  };


  return (
    <>
      {renderShareButtons()}

      {showCopyToast && (
        <div className="copy-link-toast">
          <div className="toast-content">
            <i className="fa fa-check-circle"></i>
            <span>Link copied to clipboard!</span>
          </div>
        </div>
      )}

      <style jsx>{`
        .copy-link-toast {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background: #28a745;
          color: white;
          padding: 15px 25px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 9999;
        }
      
        .blog-like-share-save.customshare {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 10px !important;
}

.blog-like-share-save.customshare a.sharingiconcls {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 40px !important;
  height: 40px !important;
}

.blog-like-share-save.customshare a.sharingiconcls .fa-stack {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 40px !important;
  height: 40px !important;
  line-height: 1 !important;
}

.blog-like-share-save.customshare .fa-stack-2x {
  font-size: 40px !important;
}

.blog-like-share-save.customshare .fa-stack-1x {
  font-size: 18px !important;
}


      `}</style>
    </>
  );
}
