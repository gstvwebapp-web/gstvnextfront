'use client';

import { useEffect, useState } from 'react';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import "./globals.css";

import Header from './Header';
import Footer from './Footer';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>

        {/* External JS */}
        <Script src="https://cdn.izooto.com/scripts/xyz.js" strategy="afterInteractive" />
        <Script src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" strategy="afterInteractive" />

        <div className="contents-main-div">
          <Header />

          <div className="row left-nav">
            <LeftSidebar />

            <main className="col-md-7 col-lg-7 offset-md-2">
              {children}
            </main>

            {!isMobile && <RightSidebar />}
          </div>

          <Footer />
        </div>

      </body>
    </html>
  );
}
