'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Head from 'next/head';
import '@/styles/profile.css';
import '@/styles/styles.css';
import '@/styles/styles_new.css';
import {
  fetchEpapersByDate,
  EpaperItem,
  getEpaperImageUrl
} from '@/services/epaperApi';
import EpaperCalendar from '@/components/EpaperCalendar';
import ProFooter from "@/components/ProFooter";
import LoadingSpinner from '@/components/LoadingSpinner';
import { COMMON_CLASSES, LOADING_MESSAGES } from '@/utils/uiUtils';
import Link from 'next/link';

interface EpaperDatePageProps {
  params: Promise<{ date: string }>;
}

const EpaperDatePage: React.FC<EpaperDatePageProps> = () => {
  const params = useParams();
  const router = useRouter();
  const [epapers, setEpapers] = useState<EpaperItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Removed unused sharePopupId state

  const date = params?.date as string || '';

  useEffect(() => {
    if (date) {
      loadEpapersByDate(date);
    }
  }, [date]);

  const loadEpapersByDate = async (date: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchEpapersByDate(date);
      
      if (response.status && response.epapercity?.Newspaper) {
        setEpapers(response.epapercity.Newspaper);
      } else {
        setEpapers([]);
      }
    } catch (err) {
      setError('Failed to load epapers for this date. Please try again.');
      console.error('Error loading epapers by date:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: string) => {
    console.log('Date changed to:', date);
    router.push(`/epaper/date/${date}`);
  };

  // Removed unused handleShareClick function

  const shareEpaper = (epaper: EpaperItem) => {
    const displayDate = formatDisplayDate(epaper.newspaperdate);
    const shareUrl = `${window.location.origin}/epaper/${epaper.ecatslug}/${displayDate}`;
    
    if (navigator.share) {
      navigator.share({
        title: epaper.title,
        text: `Read ${epaper.title} epaper for ${displayDate}`,
        url: shareUrl,
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Link copied to clipboard!');
      }).catch(() => {
        // Fallback: show URL in prompt
        prompt('Copy this link:', shareUrl);
      });
    }
  };

  const formatDisplayDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };

  if (loading) {
    return (
      <div className={COMMON_CLASSES.LOADING_CONTAINER}>
        <LoadingSpinner
          message={LOADING_MESSAGES.LOADING}
          size="large"
          color="#850E00"
        />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{`Epapers for ${date} | GSTV`}</title>
        <meta name="description" content={`Browse epapers for ${date} on GSTV`} />
      </Head>

      <div className="container-fluid">
        <div className="epaperTopFixed">
          <div className="filterTAbEpaper">
            <a className="tab-link active-link" data-target="#newspaperdata">
              News Paper
            </a>
          </div>
          <EpaperCalendar
            currentDate={params?.date as string || ''}
            onDateChange={handleDateChange}
          />
        </div>

        <div className="epapperPage">
          <div id="newspaperdata" className="data-section active">
              {error ? (
                <div className="error-message">
                  <p>{error}</p>
                  <button onClick={() => loadEpapersByDate(params?.date as string || '')} className="retry-button">
                    Retry
                  </button>
                </div>
              ) : (
                <div className="epapperFlex">
                  {epapers.length > 0 ? (
                    epapers.map((epaper) => {
                      const imageUrl = getEpaperImageUrl(epaper);
                      const displayDate = formatDisplayDate(epaper.newspaperdate);
                      const detailUrl = `/epaper/${epaper.ecatslug}/${displayDate}`;

                      return (
                        <div key={epaper.id} className="epapperBox">
                          <div className="imageBox">
                            <Link href={detailUrl}>
                              <img
                                src={imageUrl}
                                alt={`${epaper.title} - ${displayDate}`}
                                className="imgEpapper"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/images/news-default.png';
                                }}
                              />
                            </Link>
                          </div>
                          <div className="dateShareFlex">
                            <div className="date">{displayDate}</div>
                            <div
                              className={`shareIcon shareepaper${epaper.id}`}
                              onClick={() => shareEpaper(epaper)}
                            >
                              <i className="fa-solid fa-share-nodes"></i>
                            </div>
                          </div>
                          <div className="titleEpapper">
                            <Link href={detailUrl}>
                              {epaper.title}
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="no-epapers">
                      <p>No epapers available for {date}</p>
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>

      </div>
    </>
  );
};

export default EpaperDatePage;
