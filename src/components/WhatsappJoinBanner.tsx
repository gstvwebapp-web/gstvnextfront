'use client';

import { useStockmarketSiteSetting } from '@/hooks/useStockmarketSiteSetting';

export default function WhatsappJoinBanner() {
  const { whatsappChannelLink } = useStockmarketSiteSetting();

  if (!whatsappChannelLink) return null;

  return (
    <a
      href={whatsappChannelLink}
      target="_blank"
      rel="noopener noreferrer"
      className="wab-wrap"
    >
      <div className="wab-content">
        {/* Text Section */}
        <div className="wab-text-section">
          <div className="wab-text custom-gujrati-font">
            <strong>GSTV</strong>ની  <a href={whatsappChannelLink} target="_blank" rel="noopener noreferrer"
    ><strong>Whatsapp</strong></a> ચેનલમાં જોડાવા માટે આ લિંક પર ક્લિક કરો
          {/* <span className="wab-link">{whatsappChannelLink}</span> */}
          </div>
        </div>

        {/* WhatsApp Icon */}
        <span className="wab-icon">
          <svg viewBox="0 0 32 32" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="17" r="12" fill="#25D366"/>
            <path
              fill="#fff"
              d="M16.002 7.2c-4.854 0-8.8 3.946-8.8 8.8 0 1.55.404 3.004 1.11 4.264L7.2 24.8l4.648-1.094A8.758 8.758 0 0016.002 24.8c4.854 0 8.8-3.946 8.8-8.8s-3.946-8.8-8.8-8.8zm0 16.08a7.256 7.256 0 01-3.692-1.012l-.264-.156-2.756.648.694-2.68-.17-.276A7.24 7.24 0 018.722 16c0-4.02 3.26-7.28 7.28-7.28 4.02 0 7.28 3.26 7.28 7.28 0 4.022-3.26 7.28-7.28 7.28zm3.992-5.458c-.22-.11-1.298-.64-1.5-.712-.202-.074-.348-.11-.496.11-.148.22-.572.712-.702.858-.128.148-.258.166-.478.056-.22-.11-.928-.342-1.768-1.09-.654-.582-1.096-1.302-1.224-1.522-.128-.22-.014-.338.096-.448.098-.098.22-.256.33-.384.11-.128.146-.22.22-.366.074-.148.036-.276-.018-.386-.056-.11-.496-1.196-.68-1.636-.178-.43-.36-.372-.496-.378l-.422-.008c-.148 0-.386.056-.588.276-.202.22-.77.752-.77 1.832 0 1.08.788 2.124.898 2.272.11.148 1.55 2.366 3.756 3.318.524.226.934.362 1.254.462.526.168 1.006.144 1.384.088.422-.062 1.298-.53 1.482-1.042.182-.512.182-.952.128-1.042-.054-.09-.2-.144-.42-.254z"
            />
          </svg>
        </span>
      </div>

      <style>{`
        .wab-wrap {
          display: block;
          background: linear-gradient(135deg, #fff8f0 0%, #fdf0e8 100%);
          border: 1px solid #e8ddd0;
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 14px;
          text-decoration: none !important;
          transition: all 0.3s ease;
          overflow: hidden;
          position: relative;
        }

        .wab-wrap::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(37, 211, 102, 0.05) 0%, rgba(37, 211, 102, 0) 100%);
          pointer-events: none;
        }

        .wab-wrap:hover {
          box-shadow: 0 4px 16px rgba(37, 211, 102, 0.15);
          transform: translateY(-2px);
          background: linear-gradient(135deg, #fffbf7 0%, #fdf4f0 100%);
        }

        .wab-content {
          display: flex;
          align-items: center;
          gap: 14px;
          position: relative;
          z-index: 1;
        }

        .wab-text-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .wab-text {
          font-size: 15px;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.5;
          letter-spacing: 0.3px;
        }

        .wab-text strong {
          color: #850e00;
          font-weight: 700;
        }

        .wab-link {
          display: inline-block;
          font-weight: 500;
          color: #d41a1a;
          text-decoration: underline;
          word-break: break-all;
          transition: opacity 0.2s;
        }

        .wab-wrap:hover .wab-link {
          opacity: 1;
        }

        .wab-icon {
          flex-shrink: 0;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #fff, #f9f9f9);
          border-radius: 12px;
          padding: 8px;
          box-shadow: 0 2px 8px rgba(37, 211, 102, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .wab-wrap:hover .wab-icon {
          box-shadow: 0 4px 12px rgba(37, 211, 102, 0.25);
          transform: scale(1.05);
        }

        /* Responsive Design */
        @media (max-width: 480px) {
          .wab-wrap {
            padding: 12px;
            border-radius: 12px;
          }

          .wab-content {
            flex-wrap: wrap;
            gap: 12px;
          }

          .wab-text {
            font-size: 14px;
            width: 100%;
          }

          .wab-text-section {
            width: 100%;
          }

          .wab-link {
            font-size: 10px;
            width: 100%;
          }

          .wab-icon {
            width: 52px;
            height: 52px;
            margin-left: auto;
            margin-right: 0;
          }
        }

        @media (max-width: 768px) {
          .wab-text {
            font-size: 14px;
          }

          .wab-icon {
            width: 56px;
            height: 56px;
          }
        }
      `}</style>
    </a>
  );
}
