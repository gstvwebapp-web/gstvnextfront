'use client';

import { useEffect, useState, memo, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { UPLOAD_PATHS } from '@/constants/api';
import { useSiteSetting } from '@/hooks/useSiteSetting';
import { useStockmarketSiteSetting } from '@/hooks/useStockmarketSiteSetting';
// import StockMarket from '@/components/StockMarket';


/* -------------------------------------------------------
   Lazy loaded sidebar components (KEEP AS IS)
-------------------------------------------------------- */
const PollSection = dynamic(() => import('./PollSection'), { ssr: false });
const EpaperRightSidebar = dynamic(() => import('./EpaperRightSidebar'), { ssr: false });
const GstvMagazineBox = dynamic(() => import('./GstvMagazineBox'), { ssr: false });
const GSTVSatrangBox = dynamic(() => import('./GSTVSatrangBox'), { ssr: false });
const GstvFastTrack = dynamic(() => import('./GstvFastTrack'), { ssr: false });
const WhatsappJoinBanner = dynamic(() => import('./WhatsappJoinBanner'), { ssr: false });
const LiveTvSection = dynamic(() => import('./LiveTvSection'), { ssr: false });
const WebStoriesSidebar = dynamic(() => import('./WebStoriesSidebar'), { ssr: false });
const LiveMatchScore = dynamic(() => import('./LiveMatchScore'), { ssr: false });
const StockMarket = dynamic(() => import('./StockMarket'), { ssr: false });

const RightSidebar = () => {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const isVideoPage = pathname === '/category/videos';
  const isPollPage = pathname === '/poll';
  const { liveScoreEnabled } = useSiteSetting();
  const { StockMarketEnabled } = useStockmarketSiteSetting();
  
  /* -------------------------------------------------------
     Load heavy sidebar sections on scroll (Intersection Observer)
  -------------------------------------------------------- */
  const [showHeavySections, setShowHeavySections] = useState(false);

  useEffect(() => {
    // If already loaded once → don't delay again
    const cached = sessionStorage.getItem('gstv_sidebar_loaded');

    if (cached === '1') {
      setShowHeavySections(true);
      return;
    }

    // Create IntersectionObserver to detect when sidebar becomes visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When sidebar is 30% visible, start loading
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            setShowHeavySections(true);
            sessionStorage.setItem('gstv_sidebar_loaded', '1');
            observer.disconnect();
          }
        });
      },
      { threshold: [0.3] }
    );

    if (sidebarRef.current) {
      observer.observe(sidebarRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sidebarRef}>
      {/* ----------------- FAST / IMPORTANT SECTIONS ----------------- */}
      <div className='for-lg'>
        {StockMarketEnabled && <StockMarket />}
      </div>
      
      {!isPollPage && <PollSection />}
      {/* ✅ LIVE MATCH SCORE CONDITION */}
      <div className='for-lg'>
        {liveScoreEnabled && <LiveMatchScore />}
      </div>
      
      <EpaperRightSidebar />

      {/* ----------------- HEAVY SECTIONS (LOAD ON SCROLL) ----------------- */}
      {showHeavySections && (
        <>
          <WhatsappJoinBanner />
          <GstvFastTrack className="mb-4" />
          <GstvMagazineBox className="mb-4" />
          <GSTVSatrangBox />
          {isVideoPage && <WebStoriesSidebar />}
          <LiveTvSection />
        </>
      )}

      {/* --------- PLACEHOLDER FOR HEAVY SECTIONS (WHILE LOADING) --------- */}
      {!showHeavySections && (
        <div style={{ minHeight: '500px' }}>
          {/* Empty space to maintain layout while components load */}
        </div>
      )}

      {/* ----------------- DOWNLOAD APP ----------------- */}
      <div className="download-app" style={{ textAlign: 'center' }}>
        <h6
          style={{
            fontSize: '20px',
            fontFamily: '"Hind Vadodara", sans-serif',
            color: '#000',
            marginBottom: '10px'
          }}
        >
          GSTVની એપ્લિકેશન ડાઉનલોડ કરો
        </h6>

        <div className="download-btn clearfix" style={{ display: 'inline-flex', gap: '10px' }}>
          <Link
            href="https://play.google.com/store/apps/details?id=com.tops.gstvapps"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={`${UPLOAD_PATHS.PUBLIC_ASSETS}/images/play-store.png`}
              alt="Play Store"
              loading="lazy"
            />
          </Link>

          <Link
            href="https://apps.apple.com/in/app/gstv-gujarat-samachar/id1609602449"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={`${UPLOAD_PATHS.PUBLIC_ASSETS}/images/appstore.png`}
              alt="App Store"
              loading="lazy"
            />
          </Link>
        </div>
      </div>

      {/* ----------------- FOOTER LINKS ----------------- */}
      <div className="address">
        <h6>
          <ul className="custom-address-list">
            <li><Link href="/career">Career</Link></li><span>|</span>
            <li><Link href="/contact-us">Contact us</Link></li><span>|</span>
            <li><Link href="/cookie-policy">Cookie policy</Link></li><span>|</span>
            <li><Link href="/privacy-policy">Privacy policy</Link></li><span>|</span>
            <li><Link href="/refund-policy">Refund policy</Link></li><span>|</span>
            <li><Link href="/terms-condition">Terms & condition</Link></li>
          </ul>
        </h6>

        <h6 className="custom-text">
          <div>
            Design & developed by <span className="highlight-text">GSTV</span>
          </div>
          <br />
          © Copyright {new Date().getFullYear()} | GSTV. All rights reserved.
        </h6>
      </div>
    </div>
  );
};

/* -------------------------------------------------------
   Prevent unnecessary re-renders
-------------------------------------------------------- */
export default memo(RightSidebar);
