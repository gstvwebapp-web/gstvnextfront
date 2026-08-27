'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * AutoScrollToTop Component
 * 
 * Automatically scrolls the page to the top (0, 0) whenever the route changes.
 * This ensures that every page loads from the top position, providing a consistent
 * user experience across all navigation scenarios.
 * 
 * Features:
 * - Scrolls to top on route changes (link clicks, browser navigation, etc.)
 * - Works with Next.js App Router
 * - Instant scroll behavior (no animation)
 * - No visual glitches or delays
 * - Handles all browsers and edge cases
 * 
 * Usage:
 * Add this component to your root layout or ConditionalLayout component:
 * <AutoScrollToTop />
 */
export default function AutoScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // ✅ CRITICAL FIX: Skip auto-scroll for pages with infinite scroll
    // These pages handle their own scroll behavior and URL updates
    const skipScrollRoutes = [
      '/news/', // News detail pages with infinite scroll
      '/journalistdetails/', // Journalist detail pages with infinite scroll
      '/campuscornerdetails/', // Campus corner pages with infinite scroll (if any)
      '/shorts/', // Shorts detail page — manages its own scroll
    ];

    // Check if current pathname should skip auto-scroll
    const shouldSkipScroll = pathname ? skipScrollRoutes.some(route => pathname.includes(route)) : false;

    if (shouldSkipScroll) {
      console.log(`📜 AutoScrollToTop: Skipping auto-scroll for infinite scroll page: ${pathname}`);
      return;
    }

    // Scroll to top immediately when pathname changes
    // Using multiple methods to ensure maximum browser compatibility

    // Method 1: window.scrollTo with instant behavior
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior // Instant scroll, no smooth animation
    });

    // Method 2: Direct property assignment (fallback for older browsers)
    window.scrollTo(0, 0);

    // Method 3: Ensure document.documentElement is scrolled to top
    // This handles edge cases in different browsers
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
      document.documentElement.scrollLeft = 0;
    }

    // Method 4: Ensure document.body is scrolled to top
    // Additional fallback for maximum compatibility
    if (document.body) {
      document.body.scrollTop = 0;
      document.body.scrollLeft = 0;
    }

    // Log for debugging (can be removed in production)
    console.log(`📜 AutoScrollToTop: Scrolled to top for route: ${pathname}`);
  }, [pathname]); // Re-run whenever the pathname changes

  // This component doesn't render anything visible
  return null;
}

