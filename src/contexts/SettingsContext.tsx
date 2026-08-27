"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { API_ENDPOINTS, MEDIA_BASE_URL, commonApiGet } from "@/constants/api";

// Types for settings returned by the category setting API
export interface CategorySettings {
  logo?: string;
  metatitle?: string;
  metakeyword?: string;
  metadesc?: string;
  gujrat_agree_text?: string; // spelling follows API
  campus_agree_text?: string;
  // Allow any additional keys without breaking
  [key: string]: any;
}

interface SettingsContextValue {
  settings: CategorySettings | null;
  loading: boolean;
  error: string | null;
  // Derived helpers
  logoUrl: string;
  refresh: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const CACHE_KEY = "site_settings_cache_v1";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function resolveUrl(url?: string): string {
  if (!url || url.trim() === "") return "/images/logo.png";
  const val = url.trim();
  if (val.startsWith("http://") || val.startsWith("https://")) return val;
  if (val.startsWith("/")) return `${MEDIA_BASE_URL}${val}`;
  return `${MEDIA_BASE_URL}/${val}`;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<CategorySettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const parseSettingsPayload = (raw: any): CategorySettings | null => {
    if (!raw) return null;
    // API may return { settings: [...] } or { setting: [...] }
    const arr: any[] = Array.isArray(raw?.settings)
      ? raw.settings
      : Array.isArray(raw?.setting)
      ? raw.setting
      : [];
    if (arr.length === 0) return null;

    // If the API returns an array of key/value pairs, reduce; else assume first object contains keys
    const first = arr[0];
    if (Array.isArray(first)) {
      try {
        return (first as any[]).reduce((acc: Record<string, any>, item: any) => {
          if (item && item.key) acc[item.key] = item.value;
          return acc;
        }, {}) as CategorySettings;
      } catch {
        return null;
      }
    }
    return first as CategorySettings;
  };

  const loadFromCache = () => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts > CACHE_TTL_MS) return null;
      return data as CategorySettings;
    } catch {
      return null;
    }
  };

  const saveToCache = (data: CategorySettings) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    } catch {
      // ignore
    }
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await commonApiGet(API_ENDPOINTS.CATEGORY_SETTING);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const parsed = parseSettingsPayload(json);
      if (parsed) {
        setSettings(parsed);
        saveToCache(parsed);
      } else {
        throw new Error("Invalid settings payload");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load settings");
      // Fallback: try cache or defaults
      const cached = loadFromCache();
      if (cached) {
        setSettings(cached);
      } else {
        setSettings({
          logo: "/images/logo.png",
          metatitle: "GSTV",
          metakeyword: "GSTV, Gujarat, News, Samachar, TV, Gujarati News",
          metadesc: "GSTV News Website",
          gujrat_agree_text:
            "હું સંમત છું કે મારા દ્વારા અપલોડ કરવામાં આવતી સામગ્રી સંપૂર્ણપણે સત્ય અને વાસ્તવિક છે. જો કોઈ પણ પ્રકારની ખોટી માહિતી મળશે તો તેની સંપૂર્ણ જવાબદારી મારી રહેશે.",
          campus_agree_text:
            "હું સહમત છું કે મારા દ્વારા અપલોડ કરવામાં આવતી સામગ્રી કોઈપણ પ્રકારની વાંધાજનક, અશ્લીલ, હિંસક કે ગેરકાયદેસર નથી. જો આવી કોઈ સામગ્રી મળશે તો તેની સંપૂર્ણ જવાબદારી મારી રહેશે.",
        });
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    mounted.current = true;
    const cached = loadFromCache();
    if (cached) {
      setSettings(cached);
      setLoading(false);
      // Refresh in background if stale soon
      if (Date.now() - (JSON.parse(localStorage.getItem(CACHE_KEY) || "{}")?.ts || 0) > CACHE_TTL_MS / 2) {
        fetchSettings();
      }
    } else {
      fetchSettings();
    }
    return () => {
      mounted.current = false;
    };
  }, []);

  const value: SettingsContextValue = useMemo(() => ({
    settings,
    loading,
    error,
    logoUrl: resolveUrl(settings?.logo),
    refresh: fetchSettings,
  }), [settings, loading, error]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettingsContext() {
  const ctx = useContext(SettingsContext);
  if (!ctx) return undefined;
  return ctx;
}

