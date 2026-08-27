'use client';

import { useEffect, useState } from 'react';

const MobileAppPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || '';

      const isMobileDevice =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent.toLowerCase()
        );

      const isSmallScreen = window.innerWidth <= 768;

      return isMobileDevice || isSmallScreen;
    };

    if (checkMobile()) {
      setIsMobile(true);

      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleAppOpen = () => {
    const userAgent = navigator.userAgent || navigator.vendor || '';

    const newUrl = window.location.href.replace(/^https:/, 'gstvapp:');

    if (/android/i.test(userAgent)) {
      window.location.href = newUrl;

      setTimeout(() => {
        window.location.href = 'https://onelink.to/43bgxx';
      }, 500);
    } else if (/iPad|iPhone|iPod/.test(userAgent)) {
      window.location.href = newUrl;

      setTimeout(() => {
        window.location.href = 'https://onelink.to/43bgxx';
      }, 500);
    }

    setShowPrompt(false);
  };

  const handleContinueInBrowser = () => {
    setShowPrompt(false);
  };

  const handleBackdropClick = () => {
    setShowPrompt(false);
  };

  if (!isMobile) return null;

  return (
    <>
      <div
        className={`app-prompt-backdrop ${showPrompt ? 'show' : ''}`}
        onClick={handleBackdropClick}
      />

      <div className={`mobile-app-prompt ${showPrompt ? 'show' : ''}`}>
        <div className="app-prompt-content">
          <div className="app-prompt-header">
            <h3>Open In</h3>
          </div>

          <div className="app-options">
            <div className="app-option">
              <div className="app-info">
                <span className="app-name">GSTV News App</span>
              </div>
              <button className="app-button open-btn" onClick={handleAppOpen}>
                Open
              </button>
            </div>

            <div className="app-option">
              <div className="app-info">
                <span className="app-name">Chrome Browser</span>
              </div>
              <button
                className="app-button continue-btn"
                onClick={handleContinueInBrowser}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileAppPrompt;