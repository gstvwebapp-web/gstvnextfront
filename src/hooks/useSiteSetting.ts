import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/constants/api';

export const useSiteSetting = () => {
  const [liveScoreEnabled, setLiveScoreEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSetting = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.CATEGORY_SETTING, {
          cache: 'no-store',
        });

        const json = await res.json();

        if (json?.setting?.length > 0) {
          setLiveScoreEnabled(json.setting[0].livescore === 1);
        }
      } catch (error) {
        console.error('Setting API error', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSetting();
  }, []);

  return { liveScoreEnabled, loading };
};
