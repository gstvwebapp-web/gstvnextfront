'use client';

import { useState, useEffect } from 'react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="scroll-to-top-btn"
      aria-label="Scroll to top"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M7 14l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>

      <style jsx>{`
        .scroll-to-top-btn {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
          transition: all 0.3s ease;
          z-index: 1000;
          opacity: 0.9;
        }

        .scroll-to-top-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
          opacity: 1;
        }

        .scroll-to-top-btn:active {
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .scroll-to-top-btn {
            bottom: 20px;
            right: 20px;
            width: 45px;
            height: 45px;
          }
        }
      `}</style>
    </button>
  );
}
