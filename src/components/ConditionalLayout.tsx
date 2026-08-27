'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import AutoScrollToTop from './AutoScrollToTop';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

const ConditionalLayout: React.FC<ConditionalLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if current page should hide header and footer (full-screen pages)
  const shouldHideHeaderFooter = pathname?.startsWith('/videos/') || pathname?.startsWith('/shorts/') || pathname === '/login';

  // During SSR and initial hydration, always render the default layout
  // This prevents hydration mismatch
  if (!mounted) {
    return (
      <>
        <AutoScrollToTop />
        <Header />
        {children}
        <Footer />
      </>
    );
  }

  if (shouldHideHeaderFooter) {
    // Full-screen layout without header and footer
    return (
      <>
        <AutoScrollToTop />
        {children}
      </>
    );
  }

  // Default layout with header and footer
  return (
    <>
      <AutoScrollToTop />
      <Header />
      {children}
      <Footer />
    </>
  );
};

export default ConditionalLayout;
