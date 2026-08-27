'use client';

import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/constants/api';

interface HomePageSettings {
  /** Number of news items to show as large "grid-one-cls" cards (default: 2) */
  homePageVideoBig: number;
  loading: boolean;
}

let cachedValue: number | null = null; // module-level cache — avoids re-fetching on every render

export const useHomePageSettings = (): HomePageSettings => {
  const [homePageVideoBig, setHomePageVideoBig] = useState<number>(cachedValue ?? 2);
  const [loading, setLoading] = useState(cachedValue === null);

  useEffect(() => {
    // Already cached — no need to fetch again
    if (cachedValue !== null) {
      setHomePageVideoBig(cachedValue);
      setLoading(false);
      return;
    }

    const fetchSettings = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.CATEGORY_SETTING_WITH_PLAN, {
          method: 'POST',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: 0 }),
        });

        const data = await res.json();

        const raw = data?.setting?.home_page_video_big;
        const value = raw !== undefined && raw !== null ? Number(raw) : 2;

        cachedValue = isNaN(value) ? 2 : value;
        setHomePageVideoBig(cachedValue);
      } catch {
        // Keep default of 2 on error
        cachedValue = 2;
        setHomePageVideoBig(2);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { homePageVideoBig, loading };
};
