'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, Suspense } from 'react';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

function GoogleAnalyticsTrackerContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const lastTracked = useRef<string>('');

  useEffect(() => {
    if (!window.gtag) return;

    const url =
      pathname + (searchParams?.toString() ? `?${searchParams}` : '');

    // ✅ Prevent duplicate (STRICT MODE + hydration)
    if (lastTracked.current === url) return;

    lastTracked.current = url;

    // ✅ Use EVENT instead of CONFIG (important fix)
    window.gtag('event', 'page_view', {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
    });

  }, [pathname, searchParams]);

  return null;
}

export default function GoogleAnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsTrackerContent />
    </Suspense>
  );
}