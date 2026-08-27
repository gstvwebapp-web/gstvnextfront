'use client';

import { useEffect, useRef } from 'react';

/**
 * Wrapper component that scrolls to top on initial mount and when scrollKey changes
 * Preserves infinite scroll functionality by not scrolling on every re-render
 */
export default function ScrollToTopWrapper({ 
  children,
  scrollKey 
}: { 
  children: React.ReactNode;
  scrollKey?: number | string;
}) {
  const lastScrollKey = useRef(scrollKey);
  const hasInitialScrolled = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Scroll on initial mount OR when scrollKey changes
    const shouldScroll = !hasInitialScrolled.current || scrollKey !== lastScrollKey.current;

    if (shouldScroll) {
      hasInitialScrolled.current = true;
      lastScrollKey.current = scrollKey;
      
      console.log('🔝 [ScrollToTopWrapper] Scrolling to top, scrollKey:', scrollKey, 'initial:', !hasInitialScrolled.current);
      
      // Scroll to top immediately and forcefully
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Delayed scroll to ensure DOM is ready
      const timer1 = setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 50);

      // Another delayed scroll for slower devices
      const timer2 = setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 100);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [scrollKey]); // Trigger when scrollKey changes

  return <>{children}</>;
}
