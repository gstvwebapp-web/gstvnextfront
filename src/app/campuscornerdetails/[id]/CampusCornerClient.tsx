'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { API_ENDPOINTS, getcampuscornerImageUrl } from '@/constants/api';
import ShareButtons from '@/components/ShareButtons';
import Link from 'next/link';

interface CampusCornerData {
  id: number;
  userID: number;
  name: string;
  title: string;
  description: string;
  featureImage: string[] | string;
  video: string | null;
  video_status: number;
  city: string;
  school: string;
  adminid: number;
  agree_status: number;
  status: string;
  created_at: string;
  updated_at: string;
  video_img: string | null;
}

interface ApiResponse {
  success: boolean;
  data: CampusCornerData;
  last_id: number | null;
}

interface CampusCornerClientProps {
  initialData: CampusCornerData | null;
}

const CampusCornerClient: React.FC<CampusCornerClientProps> = ({ initialData }) => {
  const params = useParams();
  const [entries, setEntries] = useState<CampusCornerData[]>(initialData ? [initialData] : []);
  const [loading, setLoading] = useState(!initialData);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastId, setLastId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duplicateDetected, setDuplicateDetected] = useState(false);
  const loadingRef = useRef<HTMLDivElement>(null);
  const [currentVisibleEntry, setCurrentVisibleEntry] = useState<number | null>(initialData?.id || null);
  const entryRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const initialLoadDone = useRef(!!initialData);
  const entriesRef = useRef<CampusCornerData[]>(initialData ? [initialData] : []);
  const currentVisibleEntryRef = useRef<number | null>(initialData?.id || null);
  const isLoadingNextRef = useRef(false);

  const currentId = params?.id ? parseInt(params.id as string) : null;

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return '/assets/images/news-default.png';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    return getcampuscornerImageUrl(imagePath);
  };

  const getVideoUrl = (videoPath: string): string => {
    if (!videoPath) return '';
    if (videoPath.startsWith('http://') || videoPath.startsWith('https://')) return videoPath;
    return getcampuscornerImageUrl(videoPath);
  };

  const parseFeatureImages = (featureImageData: string[] | string): string[] => {
    try {
      if (Array.isArray(featureImageData)) return featureImageData;
      if (typeof featureImageData === 'string') {
        const parsed = JSON.parse(featureImageData);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (error) {
      return [];
    }
  };

  const updateMetaAndUrl = useCallback((entry: CampusCornerData) => {
    try {
      const newUrl = `/campuscornerdetails/${entry.id}`;
      if (window.location.pathname !== newUrl) {
        window.history.replaceState({}, '', newUrl);
      }

      const newTitle = `${entry.title} | GSTV News`;
      if (document.title !== newTitle) {
        document.title = newTitle;
      }
    } catch (err) {
      console.error('Meta update error', err);
    }
  }, []);

  const fetchCampusCornerDetails = useCallback(async (id: number): Promise<ApiResponse | null> => {
    try {
      const response = await fetch(API_ENDPOINTS.CAMPUS_CORNER_DETAILS, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          campuscornerid: id.toString()
        }),
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching details for ID', id, error);
      return null;
    }
  }, []);

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  useEffect(() => {
    if (initialData || !currentId) return;

    const loadInitialEntry = async () => {
      setLoading(true);
      setError(null);

      const result = await fetchCampusCornerDetails(currentId);

      if (result && result.success && result.data) {
        setEntries([result.data]);
        entriesRef.current = [result.data];
        setLastId(result.last_id);
        setHasMore(result.last_id !== null);
        setCurrentVisibleEntry(result.data.id);
        currentVisibleEntryRef.current = result.data.id;
        initialLoadDone.current = true;
      } else {
        setError('Failed to load campus corner details');
      }

      setLoading(false);
    };

    loadInitialEntry();
  }, [currentId, initialData, fetchCampusCornerDetails]);

  useEffect(() => {
    if (initialData && lastId === null) {
      fetchCampusCornerDetails(initialData.id).then(result => {
        if (result) {
          setLastId(result.last_id);
          setHasMore(result.last_id !== null);
        }
      });
    }
  }, [initialData, lastId, fetchCampusCornerDetails]);

  const loadNextEntry = useCallback(async () => {
    if (!hasMore || loadingMore || !lastId || isLoadingNextRef.current) return;
    setLoadingMore(true);
    isLoadingNextRef.current = true;

    const result = await fetchCampusCornerDetails(lastId);

    if (result && result.success && result.data) {
      const isDuplicateById = entriesRef.current.some(entry => entry.id === result.data.id);
      if (isDuplicateById) {
        setHasMore(false);
        setLoadingMore(false);
        isLoadingNextRef.current = false;
        return;
      }

      const normalizeString = (str?: string | null) => (str || '').trim().toLowerCase();
      const isDuplicateByContent = entriesRef.current.some(entry => {
        const titleMatch = normalizeString(entry.title) === normalizeString(result.data.title);
        const descMatch = normalizeString(entry.description) === normalizeString(result.data.description);
        return titleMatch && descMatch;
      });

      if (isDuplicateByContent) {
        setDuplicateDetected(true);
        setHasMore(false);
        setLoadingMore(false);
        isLoadingNextRef.current = false;
        return;
      }

      setEntries(prev => [...prev, result.data]);
      setLastId(result.last_id);
      setHasMore(result.last_id !== null);
      updateMetaAndUrl(result.data);
    } else {
      setHasMore(false);
    }

    setLoadingMore(false);
    isLoadingNextRef.current = false;
  }, [hasMore, loadingMore, lastId, fetchCampusCornerDetails, updateMetaAndUrl]);

  useEffect(() => {
    let isLoading = false;
    if (!entries.length) return;

    const handleScroll = () => {
      if (isLoading) return;
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollY + windowHeight >= documentHeight - 200) {
        if (hasMore && !loadingMore && lastId) {
          isLoading = true;
          loadNextEntry().finally(() => {
            isLoading = false;
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [entries.length, hasMore, loadingMore, lastId, loadNextEntry]);

  useEffect(() => {
    const handleScrollUrlUpdate = () => {
      if (entries.length === 0) return;
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const viewportCenter = scrollY + (windowHeight / 2);

      let currentVisibleEntryId: number | null = null;
      let minDistance = Infinity;

      entries.forEach((entry) => {
        const el = entryRefs.current.get(entry.id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const entryTop = scrollY + rect.top;
        const entryCenter = entryTop + (rect.height / 2);
        const entryBottom = entryTop + rect.height;
        const isInViewport = entryTop < scrollY + windowHeight && entryBottom > scrollY;

        if (isInViewport) {
          const distance = Math.abs(entryCenter - viewportCenter);
          if (distance < minDistance) {
            minDistance = distance;
            currentVisibleEntryId = entry.id;
          }
        }
      });

      if (currentVisibleEntryId && currentVisibleEntryId !== currentVisibleEntry) {
        const currentEntry = entries.find(e => e.id === currentVisibleEntryId);
        if (currentEntry) {
          setCurrentVisibleEntry(currentVisibleEntryId);
          updateMetaAndUrl(currentEntry);
        }
      }
    };

    let ticking = false;
    const throttled = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScrollUrlUpdate();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttled, { passive: true });
    setTimeout(handleScrollUrlUpdate, 100);
    return () => window.removeEventListener('scroll', throttled);
  }, [entries, currentVisibleEntry, updateMetaAndUrl]);

  if (loading) {
    return (
      <div className="blogs-main-section inner">
        <div className="detail-page-heading-h1">
          <h1 className="content-page-title">લોડ થઈ રહ્યું છે...</h1>
        </div>
        <div className="row blog-content">
          <div className="col-lg-12 detail-page">
            <div className="blog-read-content">
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', marginBottom: '10px' }}></i>
                <p>કેમ્પસ કોર્નર લોડ થઈ રહ્યું છે...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blogs-main-section inner">
        <div className="detail-page-heading-h1">
          <h1 className="content-page-title">ભૂલ</h1>
        </div>
        <div className="row blog-content">
          <div className="col-lg-12 detail-page">
            <div className="blog-read-content">
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#dc3545' }}>
                <i className="fa-solid fa-exclamation-triangle" style={{ fontSize: '24px', marginBottom: '10px' }}></i>
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="blogs-main-section inner custom-blog-details undefined nextstorydiv">
        <div className="blogs-head-bar inner">
          <span className="blog-category detail-page-heading">
            <Link href="/">હોમ</Link> / <Link href="/campuscorner"><i>કેમ્પસ કોર્નર</i></Link>
          </span>
        </div>

        {entries.map((entry, index) => {
          const featureImages = parseFeatureImages(entry.featureImage);

          return (
            <div
              key={entry.id}
              ref={(el) => {
                if (el) entryRefs.current.set(entry.id, el);
              }}
              data-entry-id={entry.id}
            >
              <div className="detail-page-heading-h1">
                <h1>{entry.title}</h1>
              </div>

              <div className="row blog-content">
                <div className="col-lg-12 detail-page">
                  <div className="blog-read-content">
                    <div className="blog-featured-functions">
                      <div className="reading-time-blog">
                        <b>રિપોર્ટેડ બાય :</b> {entry.name}, {entry.city}
                        &nbsp;&nbsp;
                        <img src="/assets/icons/clock.webp" alt="Last updated time for Campus Corner story" />
                        છેલ્લું અપડેટ : {formatDate(entry.created_at)}
                      </div>
                      <ShareButtons
                        url={`${window.location.origin}/campuscornerdetails/${entry.id}`}
                        title={entry.title}
                        variant="fontawesome"
                        showDate={true}
                        date={entry.created_at}
                        imageUrl={
                          entry.video_img
                            ? getImageUrl(entry.video_img)
                            : (featureImages.length > 0
                                ? getImageUrl(featureImages[0])
                                : "/assets/images/news-default.png")
                        }
                      />
                    </div>

                    <div className="blog-featured-image">
                      <div className="blog-featured-image-inner">
                        {(() => {
                          if (entry.video && entry.video.trim() !== '') {
                            const videoUrl = getVideoUrl(entry.video);
                            return (
                              <div className="video-container">
                                <video
                                  controls
                                  style={{ width: '100%', height: 'auto', maxHeight: '500px' }}
                                  poster={entry.video_img ? getImageUrl(entry.video_img) : undefined}
                                >
                                  <source src={videoUrl} type="video/mp4" />
                                  Your browser does not support the video tag.
                                </video>
                              </div>
                            );
                          } else if (featureImages.length > 0) {
                            const imageUrl = getImageUrl(featureImages[0]);
                            return (
                              <img
                                style={{ height: 'auto', width: '100%' }}
                                src={imageUrl}
                                alt={entry.title}
                                onError={(e) => { e.currentTarget.src = '/assets/images/news-default.png'; }}
                              />
                            );
                          } else {
                            return (
                              <img
                                style={{ height: 'auto', width: '100%' }}
                                src="/assets/images/news-default.png"
                                alt={entry.title}
                              />
                            );
                          }
                        })()}
                      </div>
                    </div>

                    <span><b>શાળા/કોલેજ :</b> {entry.school}</span>

                    <div className="detail-page finalContent">
                      <div dangerouslySetInnerHTML={{ __html: entry.description }} />
                    </div>

                    {/* Additional Images */}
                    {featureImages.length > 0 && featureImages.map((image, imgIndex) => {
                      const hasVideo = entry.video && entry.video.trim() !== '';
                      const shouldShow = hasVideo ? true : imgIndex !== 0;
                      if (!shouldShow) return null;
                      const imageUrl = getImageUrl(image);
                      return (
                        <div key={imgIndex} className="lazyload-wrapper" style={{ textAlign: 'center' }}>
                          <img
                            style={{ width: '60%', height: 'auto' }}
                            src={imageUrl}
                            className="innerpage"
                            alt={`${entry.title} - Image ${imgIndex + 1}`}
                            onError={(e) => { e.currentTarget.src = '/assets/images/news-default.png'; }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {index !== entries.length - 1 && (
                <div id={`next-story-${entry.id}`} className="next-story">
                  <span style={{ marginRight: '8px' }}>નેક્સ્ટ સ્ટોરી</span>
                  <img
                    src="/assets/images/next-arrow.gif"
                    width="16"
                    height="16"
                    alt="Arrow GIF"
                    style={{ verticalAlign: 'middle', opacity: 0.8 }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          );
        })}

        <input type="hidden" id="last_id" value={lastId || ''} />

        {entries.length > 0 && (
          <div ref={loadingRef} style={{ textAlign: 'center', padding: '20px 0', minHeight: '50px' }}>
            {hasMore && loadingMore && (
              <>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '18px', marginRight: '10px' }}></i>
                <span>વધુ સામગ્રી લોડ થઈ રહી છે...</span>
              </>
            )}
          </div>
        )}

        {!hasMore && entries.length > 1 && (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            margin: '20px 0',
            backgroundColor: duplicateDetected ? '#fff3cd' : '#f8f9fa',
            border: duplicateDetected ? '2px solid #ffc107' : '1px solid #dee2e6',
            borderRadius: '8px',
            color: duplicateDetected ? '#856404' : '#666'
          }}>
            {duplicateDetected ? (
              <>
                <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
                  ⚠️ ડુપ્લિકેટ સામગ્રી શોધાઈ
                </p>
                <p style={{ fontSize: '14px' }}>સમાન સામગ્રી બતાવવાનું ટાળવા માટે લોડિંગ બંધ કરવામાં આવી છે.</p>
              </>
            ) : (
              <p>તમે બધી કેમ્પસ કોર્નર સ્ટોરીઝ જોઈ લીધી છે.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CampusCornerClient;
