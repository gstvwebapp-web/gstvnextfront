'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { API_ENDPOINTS, API_V5_BASE_URL } from '@/constants/api';
import LockScreen from '@/components/LockScreen';
import { useAuth } from '@/contexts/AuthContext';
import { useContentLock } from '@/hooks/useContentLock';

interface RashifalData {
  rashifal_id: string;
  authorname: string | null;
  authoricon: string;
  rashidescription: string;
  created_at: string;
  title: string;
  engtitle: string;
  rashiword: string;
  rashiicon: string;
}

interface RashiData {
  id: number;
  title: string;
  engtitle: string;
  rashiword: string;
  rashiicon: string;
  rashifaldata: any;
}

interface ApiResponse {
  rashifaldata: RashifalData;
}

export default function RashiDetailPage() {
  const params = useParams();
  const id = params?.id as string || '';
  const period = params?.period as string || '';

  const [rashifalData, setRashifalData] = useState<RashifalData | null>(null);
  const [allRashiData, setAllRashiData] = useState<RashiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRashiList, setShowRashiList] = useState(false);

 
  const { getUserId } = useAuth();
  const userId = Number(getUserId() || 0);
  const { isLocked: contentLocked, loading: lockLoading } = useContentLock(userId);
  const pageLocked = contentLocked;

  useEffect(() => {
    fetchRashiDetail();
    fetchAllRashiData();
  }, [id, period]);

  const fetchRashiDetail = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.RASHIFAL_DATA, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          rashi_id: id,
          period: period,
        }),
      });

      if (!response.ok) throw new Error(`API returned ${response.status}`);

      const data: ApiResponse = await response.json();

      if (data?.rashifaldata) {
        setRashifalData(data.rashifaldata);
      } else {
        setError('Invalid response format from API');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to load rashi detail: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRashiData = async () => {
    try {
      const response = await fetch(`${API_V5_BASE_URL}/rashifal`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.rashi)) {
          setAllRashiData(data.rashi);
        }
      }
    } catch (err) {
      console.error('Error fetching all rashi data:', err);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('gu-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (loading)
    return (
      <div className="blogs-main-section inner rashifal-page">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          રાશિની વિગતો લોડ થઈ રહી છે...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="blogs-main-section inner rashifal-page">
        <h3>રાશિફળ લોડ કરવામાં ભૂલ આવી.</h3>
        <p>{error}</p>
        <Link href="/rashifal">← રાશિફળ પર પાછા જાઓ.</Link>
      </div>
    );

  return (
    <div className="blogs-main-section inner rashifal-page">
      <div className="blogs-head-bar inner custom-blog-details undefined">
        <span className="blog-category detail-page-heading">
          <Link href="/">હોમ</Link> : <Link href="/rashifal"><i>રાશિફળ</i></Link>
        </span>
      </div>

      <div className="detail-page-heading-h1">
        <h1 className="content-page-title">
          આજનું {rashifalData?.title} રાશિફળ
        </h1>

        <span
          className="rashilistLink"
          onClick={() => setShowRashiList(!showRashiList)}
          style={{ cursor: 'pointer' }}
        >
          રાશિ પંસદ કરો
        </span>

        {showRashiList && (
          <div className="show_hideRashiList">
            <div className="rashilist">
              <ul>
                {allRashiData.map((rashi) => (
                  <li key={rashi.id}>
                    <Link href={`/rashifal/rashi/${rashi.id}/today`}>
                      <i>
                        <img src={rashi.rashiicon} alt={rashi.title} />
                      </i>
                      <h5>{rashi.title}</h5>
                      <h6>({rashi.rashiword})</h6>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="row blog-content">
        <div className="col-lg-12">
          <div className="blog-read-content">
            <div className="detail-page">
              <div className="rashi_name">
                <i>
                  <img
                    src={rashifalData?.rashiicon}
                    alt={rashifalData?.title}
                  />
                </i>
                <h2>
                  {rashifalData?.title} | {rashifalData?.engtitle}
                </h2>
                <h3>(જેનું નામ {rashifalData?.rashiword} થી શરૂ થાય છે)</h3>
                <h4>{formatDate(rashifalData?.created_at || '')}</h4>
              </div>
              {pageLocked ? (
              <LockScreen userId={userId} />
        ) : (
          <>
              {/* Author Info */}
              <div className="text-center">
                <div className="rshi_auther">
                  <div className="author_thumb">
                    <img
                      src={rashifalData?.authoricon}
                      alt={rashifalData?.authorname || 'Author'}
                    />
                  </div>
                  <div className="author_name">
                    {rashifalData?.authorname}
                  </div>
                </div>
              </div>

              <div
                className="contantRashi"
                dangerouslySetInnerHTML={{
                  __html:
                    rashifalData?.rashidescription ||
                    '<p>રાશિ માહિતી ઉપલબ્ધ નથી.</p>',
                }}
              />
              {/* End of Author Info  */}
              </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── App banner — centred, after all content ── */}
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <a
          href={
            typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent)
              ? 'https://apps.apple.com/in/app/gstv-gujarat-samachar/id1609602449'
              : 'https://play.google.com/store/apps/details?id=com.tops.gstvapps'
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/images/rashifal-middle.jpeg"
            alt="GSTV App ડાઉનલોડ કરો"
            style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        </a>
      </div>

      <style jsx>{`
        .rashilistLink:hover {
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}
