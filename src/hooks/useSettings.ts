'use client';

import { useEffect, useState } from 'react';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { API_ENDPOINTS, MEDIA_BASE_URL, commonApiGet } from '@/constants/api';

export interface SettingsData {
  logo?: string;
  metatitle?: string;
  metakeyword?: string;
  metadesc?: string;
  gujrat_agree_text?: string;
  campus_agree_text?: string;
  [key: string]: any;
}

interface ApiResponseShape {
  settings?: any[];
  setting?: any[];
}

function resolveUrl(url?: string): string {
  if (!url || url.trim() === '') return '/images/logo.png';
  const val = url.trim();
  if (val.startsWith('http://') || val.startsWith('https://')) return val;
  if (val.startsWith('/')) return `${MEDIA_BASE_URL}${val}`;
  return `${MEDIA_BASE_URL}/${val}`;
}

// Hook that prefers SettingsContext if present, and falls back to a one-off fetch
export const useSettings = () => {
  const ctx = useSettingsContext();

  // Fallback: minimal client-side fetch (rarely used if provider is mounted)
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>('/images/logo.png');

  useEffect(() => {
    // If context is available, don't fetch
    if (ctx) return;

    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await commonApiGet(API_ENDPOINTS.CATEGORY_SETTING);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ApiResponseShape = await res.json();
        const arr = Array.isArray(json.settings)
          ? json.settings
          : Array.isArray(json.setting)
          ? json.setting
          : [];
        if (arr.length === 0) throw new Error('No settings data found');
        const first = arr[0] as SettingsData;
        setSettings(first);
        setLogoUrl(resolveUrl(first?.logo));
      } catch (e: any) {
        setError(e?.message || 'Failed to fetch settings');
        setSettings({
          logo: '/images/logo.png',
          metatitle: 'GSTV',
          metakeyword: 'GSTV, Gujarat, News, Samachar, TV, Gujarati News',
          metadesc: 'GSTV News Website',
        });
        setLogoUrl('/images/logo.png');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [ctx]);

  // If context is available, return it
  if (ctx) {
    return { ...ctx, settings: ctx.settings, logoUrl: ctx.logoUrl };
  }

  return { settings, loading, error, logoUrl };
};
