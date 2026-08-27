'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_ENDPOINTS } from '@/constants/api';

interface Magazine {
  id: number;
  title: string;
  cattype: string;
  featureImage: string;
  icon: string;
  icon_dark: string;
  slug: string;
  engtitle: string;
  url: string;
}

interface MagazineResponse {
  epapercat: Magazine[];
}

const MagazineSection = () => {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMagazines = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(API_ENDPOINTS.GETEPAPERCAT,{
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: MagazineResponse = await response.json();

        if (data && data.epapercat && Array.isArray(data.epapercat)) {
          setMagazines(data.epapercat);
        } else {
          console.warn('⚠️ Magazine data is incomplete:', data);
          setError('Magazine data not available');
        }
      } catch (err) {
        console.error('❌ Error fetching magazine data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load magazines');
      } finally {
        setLoading(false);
      }
    };

    fetchMagazines();
  }, []);

  // Don't render anything if loading
  if (loading) {
    return (
      <div className="magazine-wrapper">
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          <i className="fa-solid fa-spinner fa-spin"></i>
          <span style={{ marginLeft: '8px' }}>મેગેઝિન લોડ કરી રહ્યા છીએ...</span>
        </div>
      </div>
    );
  }

  // Don't render if error or no magazines
  if (error || magazines.length === 0) {
    return null;
  }

  return (
    <div className="magazine-wrapper">
      <div className="magazine-grid">
        {magazines.map((magazine) => (
          <div key={magazine.id} className="magazine-item">
            <Link itemID={magazine.url} href={magazine.url || "#"} target="_blank" rel="noopener noreferrer">
              <img 
                src={magazine.icon} 
                alt={magazine.title}
                loading="lazy"
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MagazineSection;

