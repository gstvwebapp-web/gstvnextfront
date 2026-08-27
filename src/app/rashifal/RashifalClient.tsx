'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { commonApiGet } from '@/constants/api';

interface RashiData {
  id: number;
  title: string;
  engtitle: string;
  rashiword: string;
  rashiicon: string;
  rashifaldata: any;
}

export default function RashifalPage() {
  const [rashiData, setRashiData] = useState<RashiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRashifalData();
  }, []);

  const fetchRashifalData = async () => {
    try {
      const response = await commonApiGet('rashifal');

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      let rashifalData = [];

      if (Array.isArray(data.rashi)) {
        rashifalData = data.rashi;
      } else if (data?.status === 'success' && Array.isArray(data.data?.rashifaldata)) {
        rashifalData = data.data.rashifaldata;
      } else if (data?.status === 'success' && Array.isArray(data.data)) {
        rashifalData = data.data;
      } else if (Array.isArray(data.rashifaldata)) {
        rashifalData = data.rashifaldata;
      } else if (Array.isArray(data)) {
        rashifalData = data;
      } else {
        setError('Unknown response format');
        return;
      }

      setRashiData(rashifalData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="blogs-main-section inner rashifal-page">
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', fontSize: '18px' }}>
      રશિફલ લોડ થઈ રહ્યું છે ...
    </div>
  </div>;

  if (error) return (
    <div className="blogs-main-section inner rashifal-page">
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '50vh', flexDirection: 'column'
      }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px', backgroundColor: '#dc3545',
            color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="blogs-main-section inner rashifal-page">
      <div className="blogs-head-bar inner custom-blog-details undefined">
        <span className="blog-category detail-page-heading">
          <Link href="/">હોમ </Link> : <i>રાશિફળ</i>
        </span>
      </div>

      <div className="detail-page-heading-h1">
        <h1 className="content-page-title">રાશિફળ</h1>
      </div>

      <div className="row blog-content">
        <div className="col-lg-12">
          <div className="blog-read-content">
            <div className="detail-page">

              <div className="rashilist">
                <ul>
                  {rashiData.map((rashi, index) => (
                    <li key={rashi.id || index}>
                      <Link href={`/rashifal/rashi/${rashi.id || index}/today`}>
                        <i>
                          <img
                            src={rashi.rashiicon}
                            alt={rashi.title || 'Rashi'}
                            onError={(e) => (e.currentTarget.src = '/images/default-rashi-icon.png')}
                          />
                        </i>
                        <h5>{rashi.title || 'Unknown Rashi'}</h5>
                        <h6>({rashi.rashiword || 'Unknown'})</h6>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
