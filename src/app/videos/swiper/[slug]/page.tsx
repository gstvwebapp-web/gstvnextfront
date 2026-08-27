'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { commonApiPost, COMMON_API_BASE_URL } from '@/constants/api';
import Link from 'next/link';

interface Video {
  id: number;
  title: string;
  englishTitle: string;
  slug: string;
  videoURL: string;
  description: string;
  img_credit_txt?: string;
  created_at: string;
  tags: string;
  metatitle: string;
  metadesc: string;
  like_count?: number;
  liked_by_user?: number;
  bookmark?: number;
  // Additional fields that might be in your API response
  userID?: number;
  assignUserID?: number;
  catID1?: any;
  featureImage?: string;
  imageURL?: string;
  uploadVideo?: string;
  scheduleDate?: string;
  is_home?: string;
  related_news?: string;
  relatednewsid?: string;
  viewer?: number;
  viewer_app?: number;
  newsOrder?: number;
  catOrder?: number;
  topnewsOrder?: number;
  inshorts?: number;
  notification?: number;
  usernews_userID?: any;
  is_live_news?: number;
  is_breaking?: number;
  is_vertical_video?: number;
  hide_title?: number;
  status?: string;
  updated_at?: string;
  catID?: string;
  category_slugs?: string;
  [key: string]: any; // Allow any additional fields
}

interface ApiResponse {
  status?: string;
  message?: string;
  videos?: Video[]; // Direct videos array
  data?: {
    current_page?: number;
    data?: Video[];
    last_page?: number;
    next_page_url?: string | null;
    total?: number;
    per_page?: number;
    from?: number;
    to?: number;
  } | Video[]; // Can be nested object or direct array
  topvideos?: Video[]; // Alternative structure
  [key: string]: any; // Allow any other keys
}

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string || '';

  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch videos from staging API (matching your Laravel implementation)
  const fetchVideos = async (page: number = 1, append: boolean = false) => {
    try {
      console.log(`📹 Fetching videos - Page: ${page}, Append: ${append}`);
      
      if (!append) setLoading(true);
      if (append) setIsLoadingMore(true);

      // Resolve device ID from public IP (fallback to persistent device ID)
      let deviceId = '';
      try {
        const cachedIp = typeof window !== 'undefined' ? localStorage.getItem('public_ip') : null;
        if (cachedIp) {
          deviceId = cachedIp;
        } else if (typeof window !== 'undefined') {
          const ipRes = await fetch('https://api.ipify.org?format=json');
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            if (ipData?.ip) {
              deviceId = ipData.ip;
              try { localStorage.setItem('public_ip', deviceId); } catch {}
            }
          }
        }
      } catch (e) {
        console.warn('Failed to resolve public IP for device_id:', e);
      }
      if (!deviceId) {
        try {
          const { getOrCreateDeviceId } = await import('@/utils/deviceId');
          deviceId = getOrCreateDeviceId();
        } catch {}
      }

      // Use common API utility
      const response = await commonApiPost('videoDetail', {
        slug: 'videos',
        subslug: slug,
        pageNumber: page,
        device_id: deviceId,
        user_id: 22
      }, false);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      console.log(`📹 API Response:`, data);
      console.log(`📹 Available keys:`, Object.keys(data || {}));

      // Handle different possible response structures
      let videosData = [];
      let currentPageNum = page;
      let totalPagesNum = 1;

      // Parse the exact API response structure you provided
      if (data && data.videos && Array.isArray(data.videos.data) && data.videos.data.length > 0) {
        // YOUR STAGING API STRUCTURE: { videos: { data: [...], current_page: 1, last_page: 869 } }
        videosData = data.videos.data;
        currentPageNum = data.videos.current_page || page;
        totalPagesNum = data.videos.last_page || 1;
        console.log(`📹 ✅ Using STAGING API videos.data - found ${videosData.length} videos`);
        console.log(`📹 Pagination: Page ${currentPageNum} of ${totalPagesNum}`);
        console.log(`📹 First video:`, videosData[0]?.title || 'No title');
      } else if (data && Array.isArray(data.videos) && data.videos.length > 0) {
        // Direct videos array: { videos: [...] }
        videosData = data.videos;
        console.log(`📹 Using direct VIDEOS array - found ${videosData.length} videos`);
      } else if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
        // Direct data array: { data: [...] }
        videosData = data.data;
        console.log(`📹 Using DATA array - found ${videosData.length} videos`);
      } else if (data && data.status === 'success' && data.data && Array.isArray(data.data.data) && data.data.data.length > 0) {
        // Nested structure: { status: 'success', data: { data: [...] } }
        videosData = data.data.data;
        currentPageNum = data.data.current_page || page;
        totalPagesNum = data.data.last_page || 1;
        console.log(`📹 Using nested DATA structure - found ${videosData.length} videos`);
      } else if (Array.isArray(data.topvideos) && data.topvideos.length > 0) {
        // Top videos: { topvideos: [...] } - LOCAL API FALLBACK
        videosData = data.topvideos;
        console.log(`📹 Using TOPVIDEOS array (local API) - found ${videosData.length} videos`);
      } else if (Array.isArray(data) && data.length > 0) {
        // Direct array response: [...]
        videosData = data;
        console.log(`📹 Using direct array response - found ${videosData.length} videos`);
      } else {
        console.error(`📹 ❌ NO VIDEOS FOUND in any expected structure`);
        console.error(`📹 Response data:`, data);
        console.error(`📹 Available keys:`, Object.keys(data || {}));
        console.error(`📹 Videos structure:`, data?.videos);

        setError(`No videos found. Available keys: ${Object.keys(data || {}).join(', ')}`);
        return;
      }

      if (videosData.length > 0) {
        // Debug: Show structure of first video
        console.log(`📹 🔍 First video structure:`, {
          id: videosData[0]?.id,
          title: videosData[0]?.title,
          englishTitle: videosData[0]?.englishTitle,
          slug: videosData[0]?.slug,
          videoURL: videosData[0]?.videoURL,
          availableKeys: Object.keys(videosData[0] || {})
        });

        if (append) {
          console.log(`📹 Appending ${videosData.length} videos to existing ${videos.length} videos`);
          setVideos(prevVideos => [...prevVideos, ...videosData]);
        } else {
          console.log(`📹 Setting ${videosData.length} videos as initial load`);
          setVideos(videosData);
          // Find current video index
          const index = videosData.findIndex((video: any) => video.slug === slug);
          if (index !== -1) {
            setCurrentVideoIndex(index);
            console.log(`📹 Found current video "${slug}" at index: ${index}`);
          } else {
            console.log(`📹 Video "${slug}" not found, using first video`);
            console.log(`📹 Available slugs:`, videosData.map((v: any) => v.slug).slice(0, 5));
            setCurrentVideoIndex(0);
          }
        }

        setCurrentPage(currentPageNum);
        setTotalPages(totalPagesNum);
        setError(null);
      } else {
        console.error(`📹 No videos found in response`);
        setError('No videos found in API response');
      }
    } catch (stagingErr) {
      console.log('📹 Staging API failed, trying local API...', stagingErr);

      try {
        // Fallback to local API
        const localResponse = await fetch(`/api/topVideos?page=${page}`);
        if (!localResponse.ok) {
          throw new Error(`Local API returned ${localResponse.status}`);
        }

        const localData = await localResponse.json();
        console.log(`📹 Local API Response:`, localData);

        let videosData = [];
        let currentPageNum = page;
        let totalPagesNum = 1;

        // Handle local API response structure
        if (localData && localData.status === 'success' && localData.data && Array.isArray(localData.data.data)) {
          videosData = localData.data.data;
          currentPageNum = localData.data.current_page || page;
          totalPagesNum = localData.data.last_page || 1;
          console.log(`📹 Using local API nested structure - found ${videosData.length} videos`);
        } else if (Array.isArray(localData.topvideos)) {
          videosData = localData.topvideos;
          console.log(`📹 Using local API topvideos array - found ${videosData.length} videos`);
        } else if (Array.isArray(localData)) {
          videosData = localData;
          console.log(`📹 Using local API direct array - found ${videosData.length} videos`);
        }

        if (videosData.length > 0) {
          if (append) {
            console.log(`📹 Appending ${videosData.length} videos from local API to existing ${videos.length} videos`);
            setVideos(prevVideos => [...prevVideos, ...videosData]);
          } else {
            console.log(`📹 Setting ${videosData.length} videos from local API as initial load`);
            setVideos(videosData);
            // Find current video index
            const index = videosData.findIndex((video: any) => video.slug === slug);
            if (index !== -1) {
              setCurrentVideoIndex(index);
              console.log(`📹 Found current video "${slug}" at index: ${index}`);
            } else {
              console.log(`📹 Video "${slug}" not found, using first video`);
              setCurrentVideoIndex(0);
            }
          }

          setCurrentPage(currentPageNum);
          setTotalPages(totalPagesNum);
          setError(null);
        } else {
          console.error(`📹 No videos found in local API response`);
          setError('No videos found in any API response');
        }
      } catch (localErr) {
        console.error('📹 Both staging and local APIs failed:', { stagingErr, localErr });
        setError('Failed to load videos from all sources');
      }
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Load videos on mount
  useEffect(() => {
    fetchVideos(1, false);
  }, [slug]);

  // Auto-pagination when reaching second-to-last video
  useEffect(() => {
    if (videos.length === 0) return;

    const isNearEnd = currentVideoIndex >= videos.length - 2;
    
    if (isNearEnd && currentPage < totalPages && !isLoadingMore) {
      console.log(`🚀 Auto-loading next page: ${currentPage + 1}`);
      fetchVideos(currentPage + 1, true);
    }
  }, [currentVideoIndex, currentPage, totalPages, isLoadingMore, videos.length]);

  // Handle video navigation
  const goToVideo = (index: number) => {
    if (index >= 0 && index < videos.length) {
      setCurrentVideoIndex(index);
      
      // Pause all videos
      videoRefs.current.forEach(video => {
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
      });

      // Play current video
      const currentVideo = videoRefs.current[index];
      if (currentVideo) {
        currentVideo.play().catch(console.error);
      }

      // Update URL (removed swiper from path)
      router.push(`/videos/${videos[index].slug}`, { scroll: false });
      
      // Update page title and meta
      document.title = videos[index].metatitle;
      
      // Scroll to current video
      const videoElement = document.getElementById(`video-${index}`);
      if (videoElement) {
        videoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Handle like video (placeholder - you'll need to implement the actual API call)
  const handleLikeVideo = async (videoId: number) => {
    try {
      console.log(`❤️ Liking video: ${videoId}`);
      // TODO: Implement actual like API call
      // const response = await fetch('/api/videos/like', { ... });
      
      // For now, just update the UI optimistically
      setVideos(prevVideos => 
        prevVideos.map(video => 
          video.id === videoId 
            ? { 
                ...video, 
                liked_by_user: video.liked_by_user === 1 ? 0 : 1,
                like_count: video.liked_by_user === 1 ? (video.like_count || 0) - 1 : (video.like_count || 0) + 1
              }
            : video
        )
      );
    } catch (err) {
      console.error('Error liking video:', err);
    }
  };

  // Handle bookmark video (placeholder)
  const handleBookmarkVideo = async (videoId: number) => {
    try {
      console.log(`🔖 Bookmarking video: ${videoId}`);
      // TODO: Implement actual bookmark API call
      
      setVideos(prevVideos => 
        prevVideos.map(video => 
          video.id === videoId 
            ? { ...video, bookmark: video.bookmark === 1 ? 0 : 1 }
            : video
        )
      );
    } catch (err) {
      console.error('Error bookmarking video:', err);
    }
  };

  // Handle social sharing
  const handleShare = (video: Video, platform: string) => {
    const url = `${window.location.origin}/videos/${video.slug}`;
    const text = video.title;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' - ' + url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      default:
        if (navigator.share) {
          navigator.share({ title: text, url });
        } else {
          navigator.clipboard.writeText(url);
          alert('Link copied to clipboard!');
        }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          goToVideo(currentVideoIndex - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          goToVideo(currentVideoIndex + 1);
          break;
        case ' ':
          e.preventDefault();
          const currentVideo = videoRefs.current[currentVideoIndex];
          if (currentVideo) {
            if (currentVideo.paused) {
              currentVideo.play();
            } else {
              currentVideo.pause();
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentVideoIndex]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#000',
        color: '#fff'
      }}>
        <div>Loading videos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#000',
        color: '#fff',
        flexDirection: 'column'
      }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#000',
        color: '#fff'
      }}>
        <h2>No videos found</h2>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      style={{
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#000',
        position: 'relative'
      }}
    >
      {/* Back Button */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'rgba(0,0,0,0.7)',
            border: 'none',
            color: 'white',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ←
        </button>
      </div>

      {/* Video Container */}
      <div style={{
        height: '100vh',
        overflowY: 'auto',
        scrollSnapType: 'y mandatory',
        scrollBehavior: 'smooth'
      }}>
        {videos.map((video, index) => (
          <div
            key={video.id}
            id={`video-${index}`}
            style={{
              height: '100vh',
              position: 'relative',
              scrollSnapAlign: 'start',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Video Player */}
            <video
              ref={el => {
                videoRefs.current[index] = el;
              }}
              src={video.videoURL}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
              controls
              muted
              playsInline
              loop
              onEnded={() => {
                // Auto-play next video when current ends
                if (index < videos.length - 1) {
                  goToVideo(index + 1);
                }
              }}
              onPlay={() => {
                // Pause other videos when this one plays
                videoRefs.current.forEach((otherVideo, otherIndex) => {
                  if (otherVideo && otherIndex !== index) {
                    otherVideo.pause();
                  }
                });
              }}
            />

            {/* Video Info Overlay */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              right: '80px',
              color: 'white',
              zIndex: 10
            }}>
              <h2 style={{
                fontSize: '18px',
                margin: '0 0 10px 0',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
              }}>
                {video.title}
              </h2>
              
              {video.img_credit_txt && (
                <p style={{
                  fontSize: '12px',
                  margin: '5px 0',
                  opacity: 0.8
                }}>
                  <strong>સોર્સ:</strong> {video.img_credit_txt}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{
              position: 'absolute',
              right: '20px',
              bottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              alignItems: 'center'
            }}>
              {/* Like Button */}
              <button
                onClick={() => handleLikeVideo(video.id)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  color: video.liked_by_user === 1 ? '#ff0000' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}
              >
                ❤️
                <span style={{ fontSize: '12px', marginTop: '2px' }}>
                  {video.like_count}
                </span>
              </button>

              {/* Bookmark Button */}
              <button
                onClick={() => handleBookmarkVideo(video.id)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  color: video.bookmark === 1 ? '#ffd700' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}
              >
                🔖
              </button>

              {/* Share Button */}
              <button
                onClick={() => handleShare(video, 'share')}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}
              >
                📤
              </button>

              {/* WhatsApp Share */}
              <button
                onClick={() => handleShare(video, 'whatsapp')}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  color: '#25d366',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}
              >
                📱
              </button>

              {/* YouTube Link */}
              <Link
                href="https://youtube.com/@gstvnews?si=WzNY8YH-bYKm3Ft6"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  color: '#ff0000',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  textDecoration: 'none'
                }}
              >
                📺
              </Link>
            </div>

            {/* Video Counter */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(0,0,0,0.7)',
              padding: '8px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              color: 'white'
            }}>
              {index + 1} / {videos.length}
              {isLoadingMore && index >= videos.length - 3 && (
                <div style={{ fontSize: '12px', marginTop: '4px', color: '#ffd700' }}>
                  Loading more...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

     
    </div>
  );
}
