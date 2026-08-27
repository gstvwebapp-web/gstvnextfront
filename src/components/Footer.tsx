'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const path = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isActive = (route: string) => {
    if (!mounted) return false;
    return path === route || (route === '/' && path === '');
  };

  const liveActive = isActive('/livetv');

  return (
    <div className="custom-footer">
      <div className="row footer-menu">

        {/* Home */}
        <div className="col-2 footer-item">
          <Link href="/" className={isActive('/') ? 'active' : ''}>
            <div className="footer-image">
              <Image src="/assets/icons/footer-home1.svg" alt="Home" width={26} height={26} unoptimized />
            </div>
            <p className="footer-link custom-gujrati-font">હોમ</p>
          </Link>
        </div>

        {/* Journalist */}
        <div className="col-2 footer-item">
          <Link href="/journalist" className={isActive('/journalist') ? 'active' : ''}>
            <div className="footer-image">
              <Image src="/assets/icons/footer-imjournalist.svg" alt="Journalist" width={26} height={26} unoptimized />
            </div>
            <p className="footer-link custom-gujrati-font">જર્નાલિસ્ટ</p>
          </Link>
        </div>

        {/* Live TV — centre elevated red circle */}
        <div className="col-4 footer-item footer-live-wrap">
          <Link href="/livetv" className={`footer-live-btn${liveActive ? ' active' : ''}`}>
            {/* Broadcast / radio wave icon */}
             <div className="footer-image">
              <Image src="/assets/icons/footer-livetv.svg" alt="Journalist" width={70} height={70} unoptimized />
            </div>
          </Link>
        </div>

        {/* E-Paper */}
        <div className="col-2 footer-item">
          <Link href="/epaper" className={isActive('/epaper') ? 'active' : ''}>
            <div className="footer-image">
              <Image src="/assets/icons/footer-epaper.svg" alt="E-Paper" width={26} height={26} unoptimized />
            </div>
            <p className="footer-link custom-gujrati-font">ઈ-પેપર</p>
          </Link>
        </div>

        {/* Stories */}
        <div className="col-2 footer-item">
          <Link href="/web-stories" className={isActive('/web-stories') ? 'active' : ''}>
            <div className="footer-image">
              <Image src="/assets/icons/footer-webstory.svg" alt="Stories" width={26} height={26} unoptimized />
            </div>
            <p className="footer-link custom-gujrati-font">સ્ટોરીઝ</p>
          </Link>
        </div>

      </div>

      <style jsx>{`
        .footer-item {
          width: 20%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .footer-item a {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          text-decoration: none !important;
        }

        /* Centre live wrap — pushes button up */
        .footer-live-wrap {
          margin-top: -24px;
        }

        /* Red circle button */
        .footer-live-btn {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          width: 62px;
          height: 62px;
          border-radius: 50%;
          background: #850E00;
          box-shadow: 0 4px 18px rgba(133,14,0,0.40);
          border: 3px solid #fff;
          gap: 2px !important;
          padding: 6px 4px 4px !important;
          text-decoration: none !important;
          transition: background 0.2s, transform 0.15s;
        }

        .footer-live-btn.active,
        .footer-live-btn:hover {
          background: #6d0900;
          transform: scale(1.05);
        }

        /* LIVE text inside circle */
        .footer-live-text {
          font-size: 10px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 0.5px;
          border: 1.5px solid #fff;
          border-radius: 3px;
          padding: 0px 4px;
          line-height: 14px;
          display: block;
        }
      `}</style>
    </div>
  );
}
