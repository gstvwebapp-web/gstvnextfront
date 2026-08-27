'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { API_V5_BASE_URL, MEDIA_BASE_URL } from '@/constants/api';
import WebStories from '@/components/WebStories';
import './podcast-player.css';
import LockScreen from '@/components/LockScreen';
import { useAuth } from '@/contexts/AuthContext';
import { useContentLock } from '@/hooks/useContentLock';

interface PodcastDetail {
  id: number;
  authorid: number;
  podcastTitle: string;
  podcastDescription: string;
  audioclip: string;
  audioclipimg: string;
  audiocliptime: string;
  userID: number;
  viewer: number;
  viewer_app: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface PodcastDetailResponse {
  author: {
    authorname: string;
    authorengname: string;
    authorslug: string;
    authorimg: string;
    authorsubtitle: string;
    authordesc: string;
  };
  podcast: {
    current_page: number;
    data: PodcastDetail[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export default function PodcastDetailPage() {
  const params = useParams();
  const [podcasts, setPodcasts] = useState<PodcastDetail[]>([]);
  const [authorInfo, setAuthorInfo] =
    useState<PodcastDetailResponse['author'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);


 
  const { getUserId } = useAuth();
  const userId = Number(getUserId() || 0);
  const { isLocked: contentLocked, loading: lockLoading } = useContentLock(userId);
  const pageLocked = contentLocked;

  // Player state
  const [currentPodcastIndex, setCurrentPodcastIndex] = useState<number | null>(
    null
  );
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  // Extract params safely
  const authorId = (params?.id as string) || '';

  const fetchPodcastDetail = useCallback(
    async (page: number, append: boolean = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
          setError(null);
        }

        const response = await fetch(`${API_V5_BASE_URL}/podcastdetail`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
          body: new URLSearchParams({
            pageNumber: page.toString(),
            authorid: authorId,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: PodcastDetailResponse = await response.json();

        if (!data.author) {
          console.error('Podcast Detail: No author property found');
          throw new Error('No author data found - missing author property');
        }

        if (
          !data.podcast ||
          !data.podcast.data ||
          !Array.isArray(data.podcast.data)
        ) {
          console.error('Podcast Detail: No podcast data found');
          throw new Error('No podcast data found - missing podcast.data array');
        }

        const podcastData = data.podcast.data;

        if (append) {
          setPodcasts(prev => [...prev, ...podcastData]);
        } else {
          setPodcasts(podcastData);
          setAuthorInfo(data.author);
        }

        setCurrentPage(page);
        setHasMorePages(data.podcast.next_page_url !== null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load podcast details'
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [authorId]
  );

  useEffect(() => {
    fetchPodcastDetail(1);
  }, [fetchPodcastDetail]);

  // Auto-select first podcast once data is loaded
  useEffect(() => {
    if (!hasAutoLoaded && podcasts.length > 0) {
      setCurrentPodcastIndex(0);
      setHasAutoLoaded(true);
    }
  }, [podcasts, hasAutoLoaded]);

  const formatTime = (seconds: number) => {
    if (seconds === undefined || seconds === null || Number.isNaN(seconds)) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const currentPodcast =
    currentPodcastIndex !== null ? podcasts[currentPodcastIndex] : null;

  // Attach audio events (timeupdate, loadedmetadata, ended)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      // Auto play next podcast if exists
      setCurrentPodcastIndex(prev => {
        if (prev === null) return prev;
        const next = prev + 1;
        if (next < podcasts.length) {
          return next;
        }
        // No more – stop
        setIsPlaying(false);
        return prev;
      });
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentPodcastIndex, podcasts.length]);

  // Play new audio whenever currentPodcastIndex or src changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentPodcast) {
      audio.pause();
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    // Reset time & duration when switching track
    setCurrentTime(0);
    setDuration(0);

    audio.load();
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(() => {
        setIsPlaying(false);
      });
  }, [currentPodcastIndex, currentPodcast?.audioclip]);

  const handleTogglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    setCurrentPodcastIndex(prev => {
      if (prev === null || prev <= 0) return prev;
      return prev - 1;
    });
  };

  const handleNext = () => {
    setCurrentPodcastIndex(prev => {
      if (prev === null) return prev;
      const next = prev + 1;
      if (next >= podcasts.length) return prev;
      return next;
    });
  };

  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const newTime = (value / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleChangeSpeed = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const newSpeed = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    audio.playbackRate = newSpeed;
    setPlaybackRate(newSpeed);
  };

  const handleToggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const newMuted = !isMuted;
    audio.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleToggleLoop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const newLoop = !isLoop;
    audio.loop = newLoop;
    setIsLoop(newLoop);
  };

  const handleShuffle = () => {
    if (podcasts.length <= 1) return;
    setCurrentPodcastIndex(prev => {
      const prevIndex = prev ?? 0;
      let nextIndex = prevIndex;
      while (nextIndex === prevIndex) {
        nextIndex = Math.floor(Math.random() * podcasts.length);
      }
      return nextIndex;
    });
  };

  const handleLoadMore = () => {
    if (hasMorePages && !loadingMore) {
      fetchPodcastDetail(currentPage + 1, true);
    }
  };

  const getFeatureImage = (imageUrl: string): string => {
    const defaultImage = '/public/assets/images/video-default.png';

    if (imageUrl) {
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      if (imageUrl.startsWith('/')) {
        return `${MEDIA_BASE_URL}${imageUrl}`;
      }
      return `${MEDIA_BASE_URL}/public/uploads/podcast/${imageUrl}`;
    }
    return defaultImage;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const stripHtmlTags = (html: string): string => {
    if (typeof window === 'undefined') {
      return html.replace(/<[^>]*>/g, '');
    }
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const truncateText = (text: string, limit: number): string => {
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  };

  // Handle case where params might be null
  if (!params || !params.id) {
    return (
      <div className="blogs-main-section">
        <div className="container">
          <div className="text-center" style={{ padding: '50px 0' }}>
            <p>પોડકાસ્ટ મળ્યું નથી</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="blogs-main-section">
        <div className="container">
          <div className="text-center" style={{ padding: '50px 0' }}>
            <p>પોડકાસ્ટ વિગતો લોડ કરી રહ્યું છે...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blogs-main-section">
        <div className="container">
          <div
            className="text-center"
            style={{ padding: '50px 0', color: 'red' }}
          >
            <p>Error: {error}</p>
            <button
              onClick={() => {
                fetchPodcastDetail(1);
              }}
              style={{ marginTop: '20px', padding: '10px 20px' }}
            >
              Retry API Call
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!authorInfo) {
    return (
      <div className="blogs-main-section">
        <div className="container">
          <div className="text-center" style={{ padding: '50px 0' }}>
            <p>કોઈ પોડકાસ્ટ મળ્યું નથી</p>
          </div>
        </div>
      </div>
    );
  }

  const currentDescPlain = currentPodcast
    ? stripHtmlTags(currentPodcast.podcastDescription || '')
    : '';

  const currentDescShort =
    currentDescPlain.length > 120
      ? currentDescPlain.substring(0, 120) + '...'
      : currentDescPlain;

  const seekValue =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <>
      <div className="blogs-main-section inner">
        <div className="blogs-head-bar inner custom-blog-details">
          <span className="blog-category detail-page-heading">
            <Link href="/">હોમ</Link> /{' '}
            <span>
              <Link href="/gstv-podcast">GSTV પોડકાસ્ટ</Link>
            </span>
            : <i>{authorInfo.authorname}</i>
          </span>
        </div>

        <div className="row blog-content">
          <div className="col-lg-12">
            <div className="blog-read-content">
              <div className="detail-page">
                <div className="podcast-container">
                  <div className="podcast-header">
                    <img
                      src={getFeatureImage(authorInfo.authorimg)}
                      alt="Podcast Cover"
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/public/assets/images/video-default.png';
                      }}
                    />
                    <div className="podcast-details">
                      <h2>{authorInfo.authorname}</h2>
                      <h4>{authorInfo.authorsubtitle}</h4>
                      <div className="desc-text">
                        <span className="short-desc">
                          {truncateText(stripHtmlTags(authorInfo.authordesc), 200)}
                        </span>

                        <span className="full-desc" style={{ display: "none" }}>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: authorInfo.authordesc
                            }}
                          />
                        </span>

                        {stripHtmlTags(authorInfo.authordesc).length > 200 && (
                          <Link
                            href="javascript:void(0);"
                            onClick={(e) => {
                              const container = e.currentTarget.parentElement;
                              const shortDesc = document.querySelector<HTMLElement>(".short-desc");
                              const fullDesc = document.querySelector<HTMLElement>(".full-desc");

                              const link = e.currentTarget;

                              if (shortDesc && fullDesc) {
                                const isShortVisible = shortDesc.style.display !== "none";

                                shortDesc.style.display = isShortVisible ? "none" : "inline";
                                fullDesc.style.display = isShortVisible ? "inline" : "none";



                                // Use PURE HTML here (NO JSX)
                                link.innerHTML = isShortVisible
                                  ? `
                                    <button
                                      title="પાછા જાઓ"
                                      style="
                                        background: rgb(128, 13, 0);
                                        border: 2px solid rgb(128, 13, 0);
                                        border-radius: 50%;
                                        width: 25px;
                                        height: 25px;
                                        color: white;
                                        font-size: 12px;
                                        cursor: pointer;
                                        align-items: center;
                                        justify-content: center;
                                        transition: 0.3s;
                                        backdrop-filter: blur(10px);
                                        box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 15px;
                                      "
                                    >
                                      <i class="fas fa-arrow-left"></i>
                                    </button>
                                  `
                                  : "વધુ વાંચો";
                              }
                            }}
                            className="read-more-link"
                            style={{ display: "inline-block", marginTop: "10px" }}
                          >
                            વધુ વાંચો
                          </Link>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              {pageLocked ? (
                             <LockScreen userId={userId} />
) : (
  <>
                {/* Audio Player Section */}
                <div className="podcast-player-section" id="getpodcastdtl">
                  {/* Top button (same behavior as main play/pause) */}
                  <button id="podcastbtn" onClick={handleTogglePlay} style={{ display:'none'}}>
                    <img
                      src={
                        isPlaying
                          ? '/assets/images/push_d_button.svg'
                          : '/assets/images/play_d_button.svg'
                      }
                      alt="Play/Pause"
                    />
                  </button>

                  {currentPodcast && (
                    <div id="playerRow">
                      <div>
                        <h4 className="podcasttitle">
                          {currentPodcast.podcastTitle}{' '}
                          <small>({formatDate(currentPodcast.created_at)})</small>
                        </h4>
                        <div className="desc-text">
                          <span
                            className="short-desc"
                            style={{ display: showFullDesc ? 'none' : 'inline' }}
                          >
                            {currentDescShort}
                          </span>
                          <span
                            className="full-desc"
                            style={{ display: showFullDesc ? 'inline' : 'none' }}
                          >
                            {currentDescPlain}
                          </span>
                          {currentDescPlain.length > 120 && (
                            <button
                              type="button"
                              className="read-more-link"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#000000',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                padding: 0,
                                font: 'inherit',
                              }}
                              onClick={() => setShowFullDesc(prev => !prev)}
                            >
                              {showFullDesc ? 'Read less...' : 'Read more'}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="custom-audio-player">
                        {/* Single global audio element */}
                        <audio
                          id="audioPlayer"
                          ref={audioRef}
                          src={currentPodcast.audioclip}
                        />

                        <div className="controls">
                          <div className="playiconfirstcls">
                            <button id="prevBtn" onClick={handlePrev}>
                              <img src="/assets/images/previous-icon.svg" alt="Play previous podcast episode" />
                            </button>
                            <button
                              id="playPauseBtn"
                              onClick={handleTogglePlay}
                            >
                              <img
                                src={
                                  isPlaying
                                    ? '/assets/images/push_d_icon_player.svg'
                                    : '/assets/images/play_d_icon_player.svg'
                                }
                                alt="Play/Pause"
                              />
                            </button>
                            <button id="nextBtn" onClick={handleNext}>
                              <img src="/assets/images/next-icon.svg" alt="Play next podcast episode" />
                            </button>
                          </div>

                          <div className="playiconsecondcls">
                            <div style={{ display: 'contents' }}>
                              <span id="currentTime">
                                {formatTime(currentTime)}
                              </span>
                              <div className="audio-player">
                                <input
                                  type="range"
                                  id="seekBar"
                                  min={0}
                                  max={100}
                                  value={seekValue}
                                  onChange={e =>
                                    handleSeek(Number(e.target.value))
                                  }
                                  style={{
                                    background: `linear-gradient(to right, #cc0000 ${seekValue}%, #e0e0e0 ${seekValue}%)`,
                                  }}
                                />
                              </div>
                              <span id="duration">{formatTime(duration)}</span>
                            </div>

                            <div style={{ display: 'contents' }}>
                              <button
                                onClick={handleChangeSpeed}
                                id="speedBtn"
                              >
                                {playbackRate}x
                              </button>
                              <button id="muteBtn" onClick={handleToggleMute}>
                                <img
                                  src={
                                    isMuted
                                      ? '/assets/images/mute_d_icon_player.svg'
                                      : '/assets/images/unmute_d_icon_player.svg'
                                  }
                                  alt="Mute"
                                />
                              </button>
                              <button
                                onClick={handleShuffle}
                                id="shuffleBtn"
                              >
                                <img
                                  src="/assets/images/icon1_player.svg"
                                  alt="Shuffle"
                                />
                              </button>
                              <button onClick={handleToggleLoop}>
                                <img
                                  src="/assets/images/icon2_d_icon_player.svg"
                                  alt="Loop"
                                  style={{
                                    opacity: isLoop ? 1 : 0.5,
                                  }}
                                />
                              </button>
                              <Link
                                href={currentPodcast.audioclip}
                                style={{ width: 'auto' }}
                                download
                              >
                                <img
                                  src="/assets/images/download_icon.svg"
                                  alt="Download"
                                />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Podcast List Section */}
                <div className="podcast-list-section">
                  <h2 className="podcast-section-title">પોડકાસ્ટ</h2>

                  <div className="podcast-table">
                    <div className="podcast-table-header">
                      <div className="col-number">#</div>
                      <div className="col-title">શીર્ષક</div>
                      <div className="col-time">સમય</div>
                    </div>

                    <div className="podcast-table-body" id="podcast-list">
                      {podcasts.map((podcast, index) => {
                        const isActive = currentPodcastIndex === index;
                        const isRowPlaying = isActive && isPlaying;

                        return (
                          <div
                            key={`${podcast.id}-${index}`}
                            className={`podcast-table-row ${
                              isActive ? 'active' : ''
                            }`}
                            data-id={podcast.id}
                            onClick={e => {
                              e.preventDefault();
                              setCurrentPodcastIndex(index);
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="col-number">
                              <div
  className="col-number"
  onMouseEnter={e => {
    const hoverBtn = e.currentTarget.querySelector('.hover-play-btn') as HTMLElement;
    const num = e.currentTarget.querySelector('.row-index') as HTMLElement;

    if (!isActive) {
      if (hoverBtn) hoverBtn.style.display = 'inline-flex';
      if (num) num.style.display = 'none';
    }
  }}
  onMouseLeave={e => {
    const hoverBtn = e.currentTarget.querySelector('.hover-play-btn') as HTMLElement;
    const num = e.currentTarget.querySelector('.row-index') as HTMLElement;

    if (!isActive) {
      if (hoverBtn) hoverBtn.style.display = 'none';
      if (num) num.style.display = 'inline';
    }
  }}
>
  {isActive ? (
    // Active row → always show play/pause icon
    <button
  className="play-button"
  onClick={e => {
    e.stopPropagation();

    // If this row is currently active (same index)
    if (currentPodcastIndex === index) {
      // Toggle play / pause
      if (isRowPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
      return;
    }

    // Otherwise → Switch to this podcast & auto-play
    setCurrentPodcastIndex(index);
  }}
>
  {isRowPlaying ? (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
      <rect x="2" y="0" width="3" height="14" fill="currentColor" />
      <rect x="7" y="0" width="3" height="14" fill="currentColor" />
    </svg>
  ) : (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
      <path d="M0 0V14L12 7L0 0Z" fill="currentColor" />
    </svg>
  )}
</button>
  ) : (
    <>
      {/* Normally show number */}
      <div className="col-number">
  <span className="row-index">{index + 1}</span>

  <button
    className="hover-play-btn"
    onClick={e => {
      e.stopPropagation();
      setCurrentPodcastIndex(index);
    }}
  >
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
      <path d="M0 0V14L12 7L0 0Z" fill="currentColor" />
    </svg>
  </button>
</div>
    </>
  )}
</div>
                            </div>
                            <div className="col-title">
                              <div className="podcast-item">
                                {/* <img
                                  src={getFeatureImage(podcast.audioclipimg)}
                                  alt={podcast.podcastTitle}
                                  className="podcast-thumbnail"
                                  onError={e => {
                                    const target =
                                      e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src =
                                      '/assets/images/video-default.png';
                                  }}
                                /> */}
                                <span className="podcast-name">
                                  {podcast.podcastTitle}
                                </span>
                              </div>
                            </div>
                            <div className="col-time">
                              <span
                                className={`podcast-duration podcasttime${podcast.id}`}
                              >
                                {podcast.audiocliptime || '0:00'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {hasMorePages && (
                    <div className="catload-more-container text-center d-md-none">
                      <button
                        id="catload-more-button"
                        className="btn btn-primary"
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                      >
                        {loadingMore ? 'લોડ થઈ રહ્યું છે...' : 'વધુ લોડ કરો'}
                      </button>
                    </div>
                  )}
                </div>
</>
)}
               
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
