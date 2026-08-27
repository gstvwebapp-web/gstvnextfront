'use client';

import React, { useRef, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import NewsDetailWithInfiniteScroll from './NewsDetailInfiniteScroll';
import ScrollToTopWrapper from './ScrollToTopWrapper';

/**
 * Client-side wrapper for NewsDetailInfiniteScroll that prevents re-renders
 * when URL changes during infinite scroll.
 *
 * This component:
 * 1. Preserves the initial route parameters using refs
 * 2. Ignores subsequent URL changes caused by history.replaceState
 * 3. Only re-initializes when the actual route navigation occurs (hard navigation)
 *
 * Key behavior:
 * - When user scrolls and URL updates via history.replaceState: Component DOES NOT re-render
 * - When user clicks a link or navigates to a different article: Component re-initializes
 */
export default function NewsDetailClientWrapper({
  initialCategorySlug,
  initialNewsSlug,
  initialSubcategorySlug,
  initialNewsData
}: {
  initialCategorySlug: string;
  initialNewsSlug: string;
  initialSubcategorySlug?: string;
  initialNewsData?: any;
}) {
  // Use refs to preserve initial values and prevent prop changes from causing re-renders
  const categorySlugRef = useRef(initialCategorySlug);
  const newsSlugRef = useRef(initialNewsSlug);
  const subcategorySlugRef = useRef(initialSubcategorySlug);
  const newsDataRef = useRef(initialNewsData);
  const pathname = usePathname();
  const initialPathnameRef = useRef(pathname);

  // Track component mount count - only increment on real navigation
  const [mountKey, setMountKey] = useState(0);
  const isInitialMount = useRef(true);

  // On initial mount, always use the props passed from server
  useEffect(() => {
    if (isInitialMount.current) {
      console.log('🎬 [ClientWrapper] Initial mount with:', {
        categorySlug: initialCategorySlug,
        newsSlug: initialNewsSlug,
        subcategorySlug: initialSubcategorySlug,
        hasInitialNewsData: !!initialNewsData
      });
      categorySlugRef.current = initialCategorySlug;
      newsSlugRef.current = initialNewsSlug;
      subcategorySlugRef.current = initialSubcategorySlug;
      newsDataRef.current = initialNewsData;
      initialPathnameRef.current = pathname;
      isInitialMount.current = false;
    }
  }, []);

  useEffect(() => {
    if (!pathname || !initialPathnameRef.current) return; // Guard against null pathname

    console.log('📍 [ClientWrapper] Pathname changed:', pathname);
    console.log('📍 [ClientWrapper] Initial pathname:', initialPathnameRef.current);
    console.log('📍 [ClientWrapper] Initial props - newsSlug:', initialNewsSlug, 'newsSlugRef:', newsSlugRef.current);

    // Parse current and initial pathnames
    const currentSegments = pathname.split('/').filter(Boolean);
    const initialSegments = initialPathnameRef.current.split('/').filter(Boolean);

    // Check if this is a real navigation vs infinite scroll URL update
    const categoryChanged = currentSegments[1] !== initialSegments[1]; // news/[category]/...
    const newsSlugChanged = currentSegments[currentSegments.length - 1] !== initialSegments[initialSegments.length - 1];
    
    // Check if props changed (user clicked a different article)
    const propsChanged = initialNewsSlug !== newsSlugRef.current || initialNewsData !== newsDataRef.current;

    // Re-initialize if:
    // 1. Category changed (different category navigation)
    // 2. Props changed (user clicked a different article from home/list page)
    if (categoryChanged || propsChanged) {
      console.log('🔄 [ClientWrapper] Real navigation detected, re-initializing component');
      categorySlugRef.current = initialCategorySlug;
      newsSlugRef.current = initialNewsSlug;
      subcategorySlugRef.current = initialSubcategorySlug;
      newsDataRef.current = initialNewsData;
      initialPathnameRef.current = pathname;
      setMountKey(prev => prev + 1); // Force re-mount
    } else if (newsSlugChanged) {
      console.log('📍 [ClientWrapper] Infinite scroll URL update detected (same category, different article), ignoring');
    }
  }, [pathname, initialCategorySlug, initialNewsSlug, initialSubcategorySlug, initialNewsData]);

  // Render with stable props from refs - these won't change during infinite scroll
  return (
    <ScrollToTopWrapper scrollKey={mountKey}>
      <NewsDetailWithInfiniteScroll
        key={mountKey}
        categorySlug={categorySlugRef.current}
        newsSlug={newsSlugRef.current}
        subcategorySlug={subcategorySlugRef.current}
        initialNewsData={newsDataRef.current}
      />
    </ScrollToTopWrapper>
  );
}

