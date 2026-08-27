'use client';

import React, { useState, useEffect } from 'react';
import { 
  getCacheInfo, 
  clearCache, 
  clearAllCaches, 
  CACHE_KEYS,
  invalidateServerCache 
} from '@/utils/cacheUtils';
import { useCategorySettings } from '@/hooks/useCategorySettings';
import { API_ENDPOINTS } from '@/constants/api';

interface CacheInfo {
  key: string;
  exists: boolean;
  expired: boolean;
  age: number;
  ageFormatted: string;
}

const CacheManager: React.FC = () => {
  const [cacheInfos, setCacheInfos] = useState<CacheInfo[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const { invalidateCache, clearCache: clearCategoryCache, isCached } = useCategorySettings();

  const formatAge = (ageMs: number): string => {
    const seconds = Math.floor(ageMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const refreshCacheInfo = () => {
    const infos: CacheInfo[] = Object.entries(CACHE_KEYS).map(([name, key]) => {
      const info = getCacheInfo(key);
      return {
        key: name,
        exists: info?.exists || false,
        expired: info?.expired || false,
        age: info?.age || 0,
        ageFormatted: info ? formatAge(info.age) : '0s'
      };
    });
    setCacheInfos(infos);
  };

  useEffect(() => {
    refreshCacheInfo();
    const interval = setInterval(refreshCacheInfo, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleClearCache = (key: string) => {
    const cacheKey = CACHE_KEYS[key as keyof typeof CACHE_KEYS];
    clearCache(cacheKey);
    refreshCacheInfo();
  };

  const handleClearAllCaches = () => {
    clearAllCaches();
    refreshCacheInfo();
  };

  const handleInvalidateServerCache = async () => {
    try {
      const success = await invalidateServerCache(API_ENDPOINTS.CATEGORY_SETTING);
      if (success) {
        alert('Server cache invalidated successfully');
      } else {
        alert('Failed to invalidate server cache');
      }
    } catch (error) {
      alert('Error invalidating server cache');
    }
  };

  const handleInvalidateCategoryCache = async () => {
    try {
      const success = await invalidateCache();
      if (success) {
        alert('Category cache invalidated successfully');
        refreshCacheInfo();
      } else {
        alert('Failed to invalidate category cache');
      }
    } catch (error) {
      alert('Error invalidating category cache');
    }
  };

  // Only show in development mode
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      zIndex: 9999,
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      {/* <div 
        style={{ 
          padding: '8px 12px', 
          backgroundColor: '#f5f5f5', 
          borderBottom: '1px solid #ccc',
          cursor: 'pointer',
          borderRadius: '8px 8px 0 0'
        }}
        onClick={() => setIsVisible(!isVisible)}
      >
        🗄️ Cache Manager {isVisible ? '▼' : '▶'}
      </div> */}
      
      {isVisible && (
        <div style={{ padding: '12px', minWidth: '300px' }}>
          <div style={{ marginBottom: '12px' }}>
            <strong>Cache Status:</strong>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
              Category Settings: {isCached ? '📦 Cached' : '🌐 Fresh'}
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong>Client Caches:</strong>
            {cacheInfos.map((info) => (
              <div key={info.key} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '4px 0',
                borderBottom: '1px solid #eee'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{info.key}</div>
                  <div style={{ fontSize: '10px', color: '#666' }}>
                    {info.exists ? (
                      <>
                        Age: {info.ageFormatted} 
                        {info.expired && <span style={{ color: 'red' }}> (EXPIRED)</span>}
                      </>
                    ) : (
                      'Not cached'
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleClearCache(info.key)}
                  disabled={!info.exists}
                  style={{
                    padding: '2px 6px',
                    fontSize: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: info.exists ? '#ff6b6b' : '#f5f5f5',
                    color: info.exists ? 'white' : '#999',
                    cursor: info.exists ? 'pointer' : 'not-allowed'
                  }}
                >
                  Clear
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={handleClearAllCaches}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                border: '1px solid #ff6b6b',
                borderRadius: '4px',
                backgroundColor: '#ff6b6b',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Clear All Client Caches
            </button>
            
            <button
              onClick={handleInvalidateServerCache}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                border: '1px solid #4ecdc4',
                borderRadius: '4px',
                backgroundColor: '#4ecdc4',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Invalidate Server Cache
            </button>
            
            <button
              onClick={handleInvalidateCategoryCache}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                border: '1px solid #45b7d1',
                borderRadius: '4px',
                backgroundColor: '#45b7d1',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Invalidate Category Cache (Full)
            </button>
          </div>

          <div style={{ 
            marginTop: '12px', 
            padding: '8px', 
            backgroundColor: '#f9f9f9', 
            borderRadius: '4px',
            fontSize: '10px',
            color: '#666'
          }}>
            <strong>Legend:</strong><br/>
            📦 = Using cached data<br/>
            🌐 = Fresh from API<br/>
            This panel only appears in development mode.
          </div>
        </div>
      )}
    </div>
  );
};

export default CacheManager;
