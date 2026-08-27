'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Head from 'next/head';
import { commonApiPost, COMMON_API_BASE_URL } from '@/constants/api';
import { getOrCreateDeviceId } from '@/utils/deviceId';
import VideoActionButtons from '@/components/VideoActionButtons';

/* ================= INTERFACES ================= */

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
  featureImage?: string;
  imageURL?: string;
  is_video_horizontal?: number;
  [key: string]: any;
}


export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slugArray = Array.isArray(params?.slug)
  ? params.slug
  : [params?.slug];

const videoSlug = slugArray[slugArray.length - 1];
const categorySlug =
  slugArray.length > 1 ? slugArray.slice(0, -1).join('/') : '';


  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [bookmarkingVideoId, setBookmarkingVideoId] = useState<number | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const UpArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B0A0A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);
const DownArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B0A0A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);


  // Touch/swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showAutoAdvanceIndicator, setShowAutoAdvanceIndicator] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1024); // Default to desktop to avoid hydration mismatch
  const [isMounted, setIsMounted] = useState(false); // Track if component is mounted on client
  
const isMobile = windowWidth <= 768;
console.log('mob----------'+isMobile);
  // Fetch videos from staging API (matching your Laravel implementation)
  const fetchVideos = async (page: number = 1, append: boolean = false) => {
    try {
    

      if (!append) setLoading(true);
      if (append) setIsLoadingMore(true);

      // Get user ID from userSession for bookmark status
      let userId = '';
      const userSession = localStorage.getItem('userSession');
      if (userSession) {
        try {
          const session = JSON.parse(userSession);
          userId = session.userData?.user_id || session.userData?.id;
          if (!userId) {
            userId = session.user_id || session.id || session.userData?.id;
          }
        } catch (err) {
          console.error('Error parsing userSession in fetchVideos:', err);
        }
      }

      // Resolve device ID (prefer public IP; fallback to persistent device ID)
      // let deviceId = '';
      // try {
      //   const cachedIp = typeof window !== 'undefined' ? localStorage.getItem('public_ip') : null;
      //   if (cachedIp) {
      //     deviceId = cachedIp;
      //   } else if (typeof window !== 'undefined') {
      //     const ipRes = await fetch('https://api.ipify.org?format=json');
      //     if (ipRes.ok) {
      //       const ipData = await ipRes.json();
      //       if (ipData?.ip) {
      //         deviceId = ipData.ip;
      //         try { localStorage.setItem('public_ip', deviceId); } catch {}
      //       }
      //     }
      //   }
      // } catch (e) {
      //   console.warn('Failed to resolve public IP for device_id:', e);
      // }
      // if (!deviceId) {
      //   try {
          
      //   } catch {}
      // }
      const { getOrCreateDeviceId } = await import('@/utils/deviceId');
      const deviceId = getOrCreateDeviceId();

      // Use common API utility
      const response = await commonApiPost('videoDetail', {
        slug: categorySlug ? `videos/${categorySlug}` : 'videos',

        subslug: videoSlug,
        pageNumber: page,
        device_id: deviceId,
        user_id: userId || ''
      }, false);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      console.log(`📹 Video Detail API Response:`, data);

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
      } else if (data && Array.isArray(data.videos) && data.videos.length > 0) {
        // Direct videos array: { videos: [...] }
        videosData = data.videos;
      } else if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
        // Direct data array: { data: [...] }
        videosData = data.data;
      } else if (data && data.status === 'success' && data.data && Array.isArray(data.data.data) && data.data.data.length > 0) {
        // Nested structure: { status: 'success', data: { data: [...] } }
        videosData = data.data.data;
        currentPageNum = data.data.current_page || page;
        totalPagesNum = data.data.last_page || 1;
      } else if (Array.isArray(data.topvideos) && data.topvideos.length > 0) {
        // Top videos: { topvideos: [...] } - LOCAL API FALLBACK
        videosData = data.topvideos;
      } else if (Array.isArray(data) && data.length > 0) {
        // Direct array response: [...]
        videosData = data;
      } else {
        setError(`No videos found. Available keys: ${Object.keys(data || {}).join(', ')}`);
        return;
      }

      if (videosData.length > 0) {
        // Debug: Show structure of first video
       

        if (append) {
          setVideos(prevVideos => [...prevVideos, ...videosData]);
        } else {
          setVideos(videosData);
          // Find current video index
          const index = videosData.findIndex(
            (video: Video) => video.slug === videoSlug
          );
          if (index !== -1) {
            setCurrentVideoIndex(index);
          } else {
            setCurrentVideoIndex(0);
          }
        }

        setCurrentPage(currentPageNum);
        setTotalPages(totalPagesNum);
        setError(null);
      } else {
        setError('No videos found in API response');
      }
    } catch (stagingErr) {
      
      try {
        // Fallback to local API
        const localResponse = await fetch(`/api/topVideos?page=${page}`);
        if (!localResponse.ok) {
          throw new Error(`Local API returned ${localResponse.status}`);
        }

        const localData = await localResponse.json();
      
        let videosData = [];
        let currentPageNum = page;
        let totalPagesNum = 1;

        // Handle local API response structure
        if (localData && localData.status === 'success' && localData.data && Array.isArray(localData.data.data)) {
          videosData = localData.data.data;
          currentPageNum = localData.data.current_page || page;
          totalPagesNum = localData.data.last_page || 1;
        } else if (Array.isArray(localData.topvideos)) {
          videosData = localData.topvideos;
        } else if (Array.isArray(localData)) {
          videosData = localData;
        }

        if (videosData.length > 0) {
          if (append) {
            setVideos(prevVideos => [...prevVideos, ...videosData]);
          } else {
            setVideos(videosData);
            // Find current video index
            const index = videosData.findIndex((video: Video) => video.slug === videoSlug);
            if (index !== -1) {
              setCurrentVideoIndex(index);
            } else {
              setCurrentVideoIndex(0);
            }
          }

          setCurrentPage(currentPageNum);
          setTotalPages(totalPagesNum);
          setError(null);
        } else {
          setError('No videos found in any API response');
        }
      } catch (localErr) {
        setError('Failed to load videos from all sources');
      }
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
  const activeVideo = videoRefs.current[currentVideoIndex];

  videoRefs.current.forEach((video, index) => {
    if (!video) return;

    if (index === currentVideoIndex) {
      // ✅ ACTIVE VIDEO: SOUND ON + PLAY
      video.muted = false;
      video.volume = 1;

      video.play().catch(() => {
        console.warn("Autoplay blocked, waiting for user interaction.");
      });

    } else {
      // ✅ OTHER VIDEOS: SOUND OFF + RESET
      video.pause();
      video.currentTime = 0;
      video.muted = true;
    }
  });

}, [currentVideoIndex]);

useEffect(() => {
  const enableSound = () => {
    const video = videoRefs.current[currentVideoIndex];
    if (video) {
      video.muted = false;
      video.volume = 1;
      video.play().catch(() => {});
    }
  };

  document.addEventListener("click", enableSound, { once: true });
  document.addEventListener("touchstart", enableSound, { once: true });

  return () => {
    document.removeEventListener("click", enableSound);
    document.removeEventListener("touchstart", enableSound);
  };
}, [currentVideoIndex]);

  // ✅ Desktop Mouse Scroll → Video Swipe
useEffect(() => {
  const el = containerRef.current;
  if (!el) return;

  let lastScrollTime = 0;

  const handleWheel = (e: WheelEvent) => {

    // Desktop only
    if (window.innerWidth <= 768) return;

    const now = Date.now();
    if (now - lastScrollTime < 700) return; // throttle
    lastScrollTime = now;

    if (e.deltaY > 0) {
      // Scroll Down → Next Video
      if (currentVideoIndex < videos.length - 1) {
        goToVideo(currentVideoIndex + 1);
      }
    } else {
      // Scroll Up → Previous Video
      if (currentVideoIndex > 0) {
        goToVideo(currentVideoIndex - 1);
      }
    }
  };

  el.addEventListener('wheel', handleWheel);

  return () => {
    el.removeEventListener('wheel', handleWheel);
  };

}, [currentVideoIndex, videos]);

  // Load videos on mount
  useEffect(() => {
    fetchVideos(1, false);
  }, [videoSlug]);

  // Handle window resize and set mounted state (fix hydration error)
  useEffect(() => {
    // Set mounted state to true after hydration
    setIsMounted(true);

    // Set initial window width
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
  if (!containerRef.current) return;

  let scrollTimeout: NodeJS.Timeout | null = null;

  const handleScroll = () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);

    // Wait for scroll to finish
    scrollTimeout = setTimeout(() => {
      const scrollPosition = containerRef.current!.scrollTop;
      const windowHeight = window.innerHeight;

      // Find which video is centered
      const index = Math.round(scrollPosition / windowHeight);

      if (index !== currentVideoIndex && index >= 0 && index < videos.length) {
        console.log("🎯 Mouse scroll moved to video:", index);
        setCurrentVideoIndex(index);

        // Smooth scroll to snap perfectly
        const el = document.querySelector(`[data-index="${index}"]`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        // Update URL + SEO
        const v = videos[index];
        if (v) {
          window.history.replaceState({ videoIndex: index }, "", `/videos/${v.slug}`);
          document.title = v.title;
        }
      }
    }, 150);
  };

  const ref = containerRef.current;
  ref.addEventListener("scroll", handleScroll);

  return () => ref.removeEventListener("scroll", handleScroll);
}, [currentVideoIndex, videos]);

  // Update SEO meta tags when current video changes
  useEffect(() => {
    if (videos.length > 0 && videos[currentVideoIndex]) {
      updateSEOMetaTags(videos[currentVideoIndex]);
    }
  }, [currentVideoIndex, videos]);

  // Auto-pagination when watching the last video
  useEffect(() => {
    if (videos.length === 0) return;

    // Trigger when watching the last video (not second-to-last)
    const isLastVideo = currentVideoIndex === videos.length - 1;

    if (isLastVideo && currentPage < totalPages && !isLoadingMore) {
      fetchVideos(currentPage + 1, true);
    }
  }, [currentVideoIndex, currentPage, totalPages, isLoadingMore, videos.length]);
  useEffect(() => {
  const handleVisibility = () => {
    if (document.hidden) {
      videoRefs.current.forEach(v => v?.pause());
    }
  };

  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}, []);
  // Intersection Observer for last video pagination
  useEffect(() => {
    if (videos.length === 0) return;

    const lastVideoElement = document.getElementById(`video-${videos.length - 1}`);
    if (!lastVideoElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && currentPage < totalPages && !isLoadingMore) {
            fetchVideos(currentPage + 1, true);
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of the last video is visible
        rootMargin: '0px 0px 100px 0px' // Trigger 100px before the video is fully visible
      }
    );

    observer.observe(lastVideoElement);

    return () => {
      observer.disconnect();
    };
  }, [videos.length, currentPage, totalPages, isLoadingMore]);

  // Update SEO meta tags dynamically
  const updateSEOMetaTags = (video: Video) => {
    // Update document title
    document.title = video.title;

    // Helper function to get video thumbnail image
    const getVideoImage = () => {
      let image = '';
      
      if (video.videoURL) {
        const videoUrl = video.videoURL.trim();
        if (videoUrl.includes('_video_small.jpg')) {
          image = videoUrl;
        } else if (videoUrl.includes('.mp4')) {
          image = videoUrl.replace('.mp4', '_video_small.jpg');
        } else if (videoUrl.includes('.webm')) {
          image = videoUrl.replace('.webm', '_video_small.jpg');
        } else {
          image = videoUrl;
        }
      }
      
      if (!image && video.featureImage) {
        image = video.featureImage.trim();
      }
      
      if (!image && video.thumbnail) {
        image = video.thumbnail.trim();
      }
      
      if (!image && video.imageURL) {
        image = video.imageURL.trim();
      }
      
      // Ensure absolute URL
      if (image && !image.startsWith('http://') && !image.startsWith('https://')) {
        const cleanPath = image.startsWith('/') ? image : `/${image}`;
        image = `${window.location.origin}${cleanPath}`;
      }
      
      return image || `${window.location.origin}/default-og.jpg`;
    };

    const videoImage = getVideoImage();

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', video.metadesc || video.description);
    } else {
      const newMetaDescription = document.createElement('meta');
      newMetaDescription.name = 'description';
      newMetaDescription.content = video.metadesc || video.description;
      document.head.appendChild(newMetaDescription);
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', video.title);
    } else {
      const newOgTitle = document.createElement('meta');
      newOgTitle.setAttribute('property', 'og:title');
      newOgTitle.content = video.title;
      document.head.appendChild(newOgTitle);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', video.metadesc || video.description);
    } else {
      const newOgDescription = document.createElement('meta');
      newOgDescription.setAttribute('property', 'og:description');
      newOgDescription.content = video.metadesc || video.description;
      document.head.appendChild(newOgDescription);
    }

    // Update og:image
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', videoImage);
    } else {
      const newOgImage = document.createElement('meta');
      newOgImage.setAttribute('property', 'og:image');
      newOgImage.content = videoImage;
      document.head.appendChild(newOgImage);
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    const currentUrl = `${window.location.origin}/videos/${categorySlug ? categorySlug + '/' : ''}${video.slug}`;

    if (ogUrl) {
      ogUrl.setAttribute('content', currentUrl);
    } else {
      const newOgUrl = document.createElement('meta');
      newOgUrl.setAttribute('property', 'og:url');
      newOgUrl.content = currentUrl;
      document.head.appendChild(newOgUrl);
    }

    // Update Twitter Card tags
    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    if (twitterCard) {
      twitterCard.setAttribute('content', 'summary_large_image');
    } else {
      const newTwitterCard = document.createElement('meta');
      newTwitterCard.name = 'twitter:card';
      newTwitterCard.content = 'summary_large_image';
      document.head.appendChild(newTwitterCard);
    }

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', video.title);
    } else {
      const newTwitterTitle = document.createElement('meta');
      newTwitterTitle.name = 'twitter:title';
      newTwitterTitle.content = video.title;
      document.head.appendChild(newTwitterTitle);
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', video.metadesc || video.description);
    } else {
      const newTwitterDescription = document.createElement('meta');
      newTwitterDescription.name = 'twitter:description';
      newTwitterDescription.content = video.metadesc || video.description;
      document.head.appendChild(newTwitterDescription);
    }

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) {
      twitterImage.setAttribute('content', videoImage);
    } else {
      const newTwitterImage = document.createElement('meta');
      newTwitterImage.name = 'twitter:image';
      newTwitterImage.content = videoImage;
      document.head.appendChild(newTwitterImage);
    }

    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', currentUrl);
    } else {
      const newCanonical = document.createElement('link');
      newCanonical.rel = 'canonical';
      newCanonical.href = currentUrl;
      document.head.appendChild(newCanonical);
    }
  };

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > 50;
    const isDownSwipe = distance < -50;

    if (isUpSwipe && currentVideoIndex < videos.length - 1) {
      // Swipe up - next video
      goToVideo(currentVideoIndex + 1);
    } else if (isDownSwipe && currentVideoIndex > 0) {
      // Swipe down - previous video
      goToVideo(currentVideoIndex - 1);
    }
  };

  // Handle video navigation with smooth transitions
  const goToVideo = (index: number) => {
    if (index >= 0 && index < videos.length && !isTransitioning) {
      setIsTransitioning(true);

      // Pause all videos first
      videoRefs.current.forEach((video, videoIndex) => {
        if (video) {
          video.pause();
          if (videoIndex !== index) {
            video.currentTime = 0; // Reset non-current videos to start
          }
        }
      });

      // Update current video index
      setCurrentVideoIndex(index);

      // Update URL without page refresh
      const newUrl =
`/videos/${categorySlug ? categorySlug + '/' : ''}${videos[index].slug}`;

      window.history.pushState({ videoIndex: index }, '', newUrl);

      // Update SEO meta tags
      updateSEOMetaTags(videos[index]);

      // Scroll to current video with smooth animation
      const videoElement = document.getElementById(`video-${index}`);
      if (videoElement) {
        videoElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });

        // Play video after scroll animation completes
        setTimeout(() => {
          const currentVideo = videoRefs.current[index];
          if (currentVideo) {
            currentVideo.play().catch(error => {
              console.error(`❌ Failed to play video ${index + 1}:`, error);
              // Try to play without sound if autoplay fails
              currentVideo.muted = true;
              currentVideo.play().catch(console.error);
            });
          }
          setIsTransitioning(false);
        }, 800); // Increased delay for smoother transition
      } else {
        setIsTransitioning(false);
      }

      // Check if we need to load more videos (preload next page)
      if (index >= videos.length - 3 && currentPage < totalPages && !isLoadingMore) {
        fetchVideos(currentPage + 1, true);
      }
    } else if (isTransitioning) {
      console.log(`⏳ Navigation blocked - transition in progress`);
    } else {
      console.log(`❌ Invalid video index: ${index} (total: ${videos.length})`);
    }
  };

  // Handle like video with API integration (one-way only - no unlike)
  const handleLikeVideo = async (videoId: number) => {
    try {

      // Get current video state
      const currentVideo = videos.find(video => video.id === videoId);
      if (!currentVideo) return;

      const isCurrentlyLiked = currentVideo.liked_by_user === 1;

      // If already liked, do nothing (no unlike functionality)
      if (isCurrentlyLiked) {
        return;
      }

      const newStatus = 1; // Always like (status = 1)

      // Get or generate persistent device ID using utility function
      const deviceId = getOrCreateDeviceId();

      // Get user ID if available (some APIs might require it)
      let userId = '';
      const userSession = localStorage.getItem('userSession');
      if (userSession) {
        try {
          const session = JSON.parse(userSession);
          userId = session.userData?.user_id || session.userData?.id || session.user_id || session.id || '';
        } catch (err) {
          console.warn('Failed to parse userSession for user_id:', err);
        }
      }

      // Optimistically update UI first (only like, never unlike)
      const originalLikeCount = currentVideo.like_count || 0;

      setVideos(prevVideos =>
        prevVideos.map(video =>
          video.id === videoId
            ? {
                ...video,
                liked_by_user: 1, // Always set to liked
                like_count: originalLikeCount + 1 // Temporary optimistic increment
              }
            : video
        )
      );

       // Prepare API request data with correct parameter names for videolike API
      // Backend expects 'video_id' parameter based on Network tab analysis
      const requestData: Record<string, string> = {
        video_id: videoId.toString(), // Backend expects 'video_id' parameter
        device_id: deviceId, // Backend maps device_id to database ipAddress column
        status: newStatus.toString() // Backend maps status to database status column
      };

      // Add user_id only if available and not empty
      if (userId && typeof userId === 'string' && userId.trim() !== '') {
        requestData.user_id = userId;
      } else if (userId && typeof userId === 'number') {
        // Handle case where userId is a number
        requestData.user_id = (userId as number).toString();
      }

     
      // Try multiple API endpoints - first try videolike, then fallback to newsbookmark with like type
      let response;
      let apiEndpoint = 'videolike';

      try {
        response = await commonApiPost('videolike', requestData, true);

        // If videolike returns 500, try alternative approach
        if (response.status === 500) {
  
          // Try using newsbookmark with like type (this API uses news_id)
          const alternativeData = {
            news_id: videoId.toString(), // newsbookmark API uses news_id
            user_id: userId || '',
            status: newStatus.toString(),
            bookmark_type: 'like' // Try like type instead of bookmark
          };

          response = await commonApiPost('newsbookmark', alternativeData, true);
          apiEndpoint = 'newsbookmark (like)';
        }
      } catch (error) {
        throw error;
      }

  
      let data;
      try {
        data = await response.json();
        // console.log(`❤️ Video like API response:`, data); // Removed to hide response
      } catch (parseError) {
        const textResponse = await response.text();
        throw new Error(`API returned invalid JSON. Status: ${response.status}, Response: ${textResponse}`);
      }

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${data?.message || response.statusText}`);
      }

      // Check if API response indicates success
      if (data.success === false || data.status === 'error') {
        throw new Error(data.message || 'API returned error status');
      }

      // Update with the actual count from API response instead of optimistic update
      if (data.videolike !== undefined) {
  
        // Update the video with the actual count from the API
        setVideos(prevVideos =>
          prevVideos.map(video =>
            video.id === videoId
              ? {
                  ...video,
                  liked_by_user: 1, // Keep liked status
                  like_count: parseInt(data.videolike) // Use actual count from API
                }
              : video
          )
        );
    } else {
        console.log(`✅ Like API successful for video ${videoId}. Keeping optimistic update.`);
      }
    } catch (err) {
      console.error('❌ Error liking video:', err);

      // Don't revert the optimistic update - keep the like for better UX
      // The user will see their like even if the API is temporarily down

      // Show user-friendly error message but keep the UI updated
      console.warn('⚠️ API call failed, but keeping UI updated for better user experience');

      // Keep the optimistic update (don't revert) and show a subtle message
      // This way the user sees the like working even if the API is down

      // Optional: Show a less intrusive message
      // alert('Like saved locally. Will sync when connection improves.');
    }
  };

  // Handle bookmark video with login redirection
  const handleBookmarkVideo = async (videoId: number) => {
    // Prevent multiple simultaneous bookmark requests
    if (bookmarkingVideoId === videoId) {
      return;
    }

    try {
      setBookmarkingVideoId(videoId);

      // Check if user is logged in using userSession (same as profile page)
      const userSession = localStorage.getItem('userSession');
      let userId = '';
      let isUserLoggedIn = false;

      if (userSession) {
        try {
          const session = JSON.parse(userSession);
          userId = session.userData?.user_id || session.userData?.id;

          if (!userId) {
            userId = session.user_id || session.id || session.userData?.id;
          }

          // User is logged in if we have a valid userId
          isUserLoggedIn = !!(userId && userId !== 'null' && userId !== '' && userId !== 'undefined');

        } catch (err) {
          console.error('🔍 Error parsing userSession:', err);
          isUserLoggedIn = false;
          userId = '';
        }
      } else {
        console.log('🔍 No userSession found in localStorage');
      }

      // User is NOT logged in - redirect to login
      if (!isUserLoggedIn) {
        // Store the current video URL and bookmark action for after login
        const currentUrl = window.location.pathname;
        const fullUrl = window.location.href;


        // Store the current URL for redirect after login
        localStorage.setItem('redirectAfterLogin', currentUrl);
        localStorage.setItem('pendingBookmarkAction', JSON.stringify({
          videoId: videoId,
          action: 'bookmark',
          timestamp: Date.now()
        }));

        // Verify what was stored
        const storedRedirect = localStorage.getItem('redirectAfterLogin');
        const storedAction = localStorage.getItem('pendingBookmarkAction');


        // Add a small delay to ensure localStorage is written
        setTimeout(() => {
          console.log('🔄 Redirecting to login page...');
          router.push('/login');
        }, 100);

        return;
      }

      // User IS logged in - proceed with bookmark
      // Get current video state
      const currentVideo = videos.find(video => video.id === videoId);
      if (!currentVideo) {
        console.error('❌ Video not found:', videoId);
        return;
      }

      const isCurrentlyBookmarked = currentVideo.bookmark === 1;
      const newStatus = isCurrentlyBookmarked ? 0 : 1; // Toggle bookmark status


      // Optimistically update bookmark count (will be corrected by API response)
      const estimatedBookmarkCount = currentVideo.bookmark_count || 0;
      const optimisticBookmarkCount = newStatus === 1
        ? estimatedBookmarkCount + 1
        : Math.max(0, estimatedBookmarkCount - 1);

      setVideos(prevVideos =>
        prevVideos.map(video =>
          video.id === videoId
            ? {
                ...video,
                bookmark: newStatus,
                bookmark_count: optimisticBookmarkCount
              }
            : video
        )
      );

      // Call the API
      const response = await fetch(`${COMMON_API_BASE_URL}/newsbookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'GSTV-NextJS-App/1.0',
        },
        body: new URLSearchParams({
          news_id: videoId.toString(),
          user_id: userId,
          status: newStatus.toString(),
          bookmark_type: 'video'
        })
      });

      const data = await response.json();

      // More flexible success detection
      // Note: data.status can be 0 (unbookmark) or 1 (bookmark) - both are successful operations
      const isSuccess = response.ok && (
        data.success === true ||
        data.success === 1 ||
        data.success === '1' ||
        data.status === 'success' ||
        data.status === 1 ||
        data.status === '1' ||
        data.status === 0 ||  // 0 means "unbookmark successful"
        data.status === '0'   // String version of 0
      );


      if (!isSuccess) {
        // Revert the optimistic update if API call failed
        setVideos(prevVideos =>
          prevVideos.map(video =>
            video.id === videoId
              ? {
                  ...video,
                  bookmark: isCurrentlyBookmarked ? 1 : 0
                }
              : video
          )
        );
      } else {
        // Success - UI is already updated optimistically

        const message = newStatus === 1
          ? 'વીડિયો બુકમાર્ક કરવામાં આવ્યો' // Video bookmarked
          : 'વીડિયો બુકમાર્કમાંથી દૂર કરવામાં આવ્યો'; // Video removed from bookmarks

        console.log(`✅ ${message}`);

        // Optional: Show a brief success indicator
        if (typeof window !== 'undefined' && (window as any).showToast) {
          (window as any).showToast(message, 'success');
        }

        // Force a re-render to ensure UI is updated
        setVideos(prevVideos => [...prevVideos]);
      }
    } catch (err) {
      // Revert optimistic update on error
      const currentVideo = videos.find(video => video.id === videoId);
      if (currentVideo) {
        const isCurrentlyBookmarked = currentVideo.bookmark === 1;
        setVideos(prevVideos =>
          prevVideos.map(video =>
            video.id === videoId
              ? {
                  ...video,
                  bookmark: isCurrentlyBookmarked ? 1 : 0
                }
              : video
          )
        );
      }
    } finally {
      // Clear loading state
      setBookmarkingVideoId(null);
    }
  };

  // Handle social sharing
  const handleShare = (video: Video, platform: string) => {
   // const url = `${window.location.origin}/videos/${video.slug}`;
    const url =
`${window.location.origin}/videos/${categorySlug ? categorySlug + '/' : ''}${video.slug}`;

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

  // Browser history handling
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && typeof event.state.videoIndex === 'number') {
        const targetIndex = event.state.videoIndex;
        if (targetIndex >= 0 && targetIndex < videos.length) {
          setCurrentVideoIndex(targetIndex);

          // Scroll to the video without updating history again
          const videoElement = document.getElementById(`video-${targetIndex}`);
          if (videoElement) {
            videoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }

          // Update SEO meta tags
          updateSEOMetaTags(videos[targetIndex]);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [videos]);

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

  // Window resize handler for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle pending bookmark action after login and refresh bookmark statuses
  useEffect(() => {
    const handlePendingBookmark = async () => {
      const pendingAction = localStorage.getItem('pendingBookmarkAction');

      // Check login status using userSession
      const userSession = localStorage.getItem('userSession');
      let userId = '';
      let isLoggedIn = false;

      if (userSession) {
        try {
          const session = JSON.parse(userSession);
          userId = session.userData?.user_id || session.userData?.id;
          if (!userId) {
            userId = session.user_id || session.id || session.userData?.id;
          }
          isLoggedIn = !!(userId && userId !== 'null' && userId !== '' && userId !== 'undefined');
        } catch (err) {
          console.error('Error parsing userSession in pending bookmark:', err);
        }
      }

      if (pendingAction && isLoggedIn && userId && videos.length > 0) {
        try {
          const action = JSON.parse(pendingAction);
          const actionAge = Date.now() - action.timestamp;

          // Only process if action is less than 5 minutes old
          if (actionAge < 5 * 60 * 1000 && action.action === 'bookmark') {

            // Clear the pending action first
            localStorage.removeItem('pendingBookmarkAction');
            localStorage.removeItem('redirectAfterLogin');

            // Find the video and execute bookmark
            const targetVideo = videos.find(v => v.id === action.videoId);
            if (targetVideo) {
              // Wait a bit for UI to settle
              setTimeout(() => {
                handleBookmarkVideo(action.videoId);
              }, 500);
            }
          } else {
            // Clear expired or invalid actions
            localStorage.removeItem('pendingBookmarkAction');
            localStorage.removeItem('redirectAfterLogin');
          }
        } catch (err) {
          localStorage.removeItem('pendingBookmarkAction');
          localStorage.removeItem('redirectAfterLogin');
        }
      }
    };

    // Check for pending actions when videos are loaded
    if (videos.length > 0) {
      handlePendingBookmark();
    }
  }, [videos]); // Depend on videos so it runs after video data is loaded

  // Refresh video data when user logs in to get updated bookmark statuses
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userSession' && e.newValue) {
        // Refresh video data to get updated bookmark statuses
        fetchVideos(1, false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
    <>
      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .video-transition {
          animation: fadeIn 0.5s ease-in-out;
        }

        .swipe-hint {
          animation: bounce 2s infinite;
        }

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .video-container {
            height: 100vh !important;
            width: 100vw !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .video-player {
            width: 100vw !important;
            height: 100vh !important;
          }

          .innerbox {
            height: 100vh !important;
            width: 100vw !important;
          }

          .shorts_art-img {
            height: 100vh !important;
            width: 100vw !important;
            margin: 0 !important;
          }

          .swiper-slide {
            height: 100vh !important;
          }
            

          /* Hide title and source on mobile */
          .video-info-overlay {
            display: none !important;
          }

          .video-title {
            display: none !important;
          }

          .action-buttons {
            right: 10px !important;
            bottom: 60px !important;
            gap: 10px !important;
          }

          .action-button {
            width: 48px !important;
            height: 48px !important;
            font-size: 18px !important;
          }

          .navigation-buttons {
            right: 10px !important;
            top: 50% !important;
            gap: 10px !important;
          }

          .nav-button {
            width: 40px !important;
            height: 40px !important;
            font-size: 16px !important;
          }

          .back-button {
            top: 15px !important;
            left: 15px !important;
            width: 40px !important;
            height: 40px !important;
            font-size: 16px !important;
          }
        }

        /* Extra small screens */
        @media (max-width: 480px) {
          .video-container {
            height: 100vh !important;
            width: 100vw !important;
          }

          .video-player {
            width: 100vw !important;
            height: 100vh !important;
          }

          /* Hide title and source on mobile */
          .video-info-overlay {
            display: none !important;
          }

          .video-title {
            display: none !important;
          }

          .action-buttons {
            right: 8px !important;
            bottom: 50px !important;
            gap: 8px !important;
          }

          .action-button {
            width: 56px !important;
            height: 56px !important;
            font-size: 16px !important;
          }
        }

        /* Fix hydration - use CSS for responsive background */
        .video-container {
          background-color: #eee;
        }

        @media (max-width: 768px) {
          .video-container {
            background-color: #000 !important;
          }
        }

        /* Back button responsive styles */
        .back-button-wrapper {
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 1000;
        }

        @media (max-width: 768px) {
          .back-button-wrapper {
            top: 15px;
            left: 15px;
          }
        }

        .back-button-video {
          background: #800d00;
          border: 2px solid #800d00;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          color: white;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        @media (max-width: 768px) {
          .back-button-video {
            font-size: 16px;
          }
        }
          .normal-video-wrapper {
  width: 100%;
  height: 100%;
}
          @media (max-width: 768px) {

  .video-player {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #000;
  }
  .horizontal-video-wrapper {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: #000;
  }
  .horizontal-video {
    position: absolute;
    top: 50%;
    left: 50%;

    width: calc(100vh - 20px) !important;
    height: calc(100vw - 20px) !important;

    transform: translate(-50%, -50%) rotate(90deg);
    transform-origin: center center;

    object-fit: contain   !important;
    background: #000;
  }
}
      `}</style>

      <div
        className="video-container"
        style={{
          height: '100vh',
          overflow: 'hidden',
          position: 'relative',
          width: '100%'
        }}
      >
      {/* Back Button - Mobile Responsive */}
      <div className="back-button-wrapper">
        <button
          className="back-button-video"
          onClick={() => router.push("/category/videos")}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#000';
                e.currentTarget.style.borderColor = '#000';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#800d00';
                e.currentTarget.style.borderColor = '#800d00';
              }}
              title="પાછા જાઓ" // Go back
        >
            <i className='fas fa-arrow-left'></i>
        </button>
      </div>

     

   

      {/* Navigation Controls - Desktop Only */}
      {isMounted && videos.length > 1 && windowWidth > 768 && (
        <div
          className="video-navigation-controls"
          style={{
            position: 'fixed',
           
            right: windowWidth <= 768 ? '10px' 
            : Number(videos[currentVideoIndex]?.is_video_horizontal ?? 0) === 1
            ? '21%'
            : '31.5%',
            
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: windowWidth <= 1366 ? '12px' : '15px'
          }}>
          {/* Previous Video Button */}
         {currentVideoIndex > 0 && (
            <div
              onClick={() => {
                console.log("🔼 Previous video clicked");
                goToVideo(currentVideoIndex - 1);
              }}
              style={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: windowWidth <= 768 ? "35px" : "80px",
                height: windowWidth <= 768 ? "35px" : "80px",
              }}
              onMouseOver={(e) => {
                const svg = e.currentTarget.querySelector<SVGSVGElement>("svg");
                if (svg) {
                  svg.style.stroke = "#dc3545";
                }
              }}
              onMouseOut={(e) => {
                const svg = e.currentTarget.querySelector<SVGSVGElement>("svg");
                if (svg) {
                  svg.style.stroke = "#850e00";
                }
              }}
              title="પાછલો વીડિયો"
            >
              {/* 🔼 Red UP Arrow SVG */}
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#850e00"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transition: "0.3s" }}
              >
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </div>
          )}

         

          {/* Next Video Button */}
          {currentVideoIndex < videos.length - 1 && (
          <div
            onClick={() => {
              console.log("🔽 Next video clicked");
              goToVideo(currentVideoIndex + 1);
            }}
            style={{
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: windowWidth <= 768 ? "35px" : "80px",
              height: windowWidth <= 768 ? "35px" : "80px",
            }}
            onMouseOver={(e) => {
              const svg = e.currentTarget.querySelector<SVGSVGElement>("svg");
                if (svg) {
                  svg.style.stroke = "#dc3545";
                }
            }}
            onMouseOut={(e) => {
              const svg = e.currentTarget.querySelector<SVGSVGElement>("svg");
                if (svg) {
                  svg.style.stroke = "#850e00";
                }
            }}
            title="આગળનો વીડિયો"
          >
            {/* 🔽 Red DOWN Arrow SVG */}
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#850e00"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        )}
        </div>
      )}

      {/* Auto-Advance Indicator */}
      {showAutoAdvanceIndicator && currentVideoIndex < videos.length - 1 && (
        <div
          className="auto-advance-indicator"
          style={{
            position: 'fixed',
            bottom: windowWidth <= 768 ? '80px' : '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: windowWidth <= 768 ? '8px 16px' : '12px 20px',
            borderRadius: '25px',
            fontSize: windowWidth <= 768 ? '12px' : '14px',
            fontFamily: "'Noto Sans Gujarati', sans-serif",
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #dc3545',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          આગળનો વીડિયો આવી રહ્યો છે... {/* Next video coming... */}
        </div>
      )}
<div className="sliderOuter videoOuter">
    <div className="swiper-container">
        <div className="swiper-wrapper" id="videolist">
            <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          height: '100vh',
          overflowY: 'auto',
          scrollSnapType: 'y mandatory',
          scrollBehavior: 'smooth',
          touchAction: 'pan-y' // Allow vertical scrolling/swiping
        }}
      >
        
        {videos.map((video, index) => (
          <div
            key={video.id}
            id={`video-${index}`}
            className="video-wrapper"
            style={{
              height: '100vh',
              position: 'relative',
              scrollSnapAlign: 'start',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: isTransitioning ? 'transform 0.3s ease-in-out' : 'none'
            }}
          >
           
           
           <div
    className={
        Number(video.is_video_horizontal) === 1
            ? 'swiper-slide-horizontal'
            : 'swiper-slide'
    }
>
    <div className="innerbox">
        <figure className="shorts_art-img">
            <div className="video-container">


            <div
  className={
    isMobile && Number(video.is_video_horizontal) === 1
      ? 'horizontal-video-wrapper'
      : 'normal-video-wrapper'
  }
>
  <video
    ref={el => {
      videoRefs.current[index] = el;
    }}
    src={video.videoURL}
    className={`video-player ${
      isMobile && Number(video.is_video_horizontal) === 1
        ? 'horizontal-video'
        : 'vertical-video'
    }`}
    controls
    playsInline
    preload="metadata"
    disablePictureInPicture
    webkit-playsinline="true"
    x5-playsinline="true"
    controlsList="nodownload noplaybackrate"
    onContextMenu={(e) => e.preventDefault()}
    onTimeUpdate={(e) => {
      const videoElement = e.currentTarget;
      const timeLeft = videoElement.duration - videoElement.currentTime;

      if (timeLeft <= 3 && timeLeft > 0 && index === currentVideoIndex) {
        setShowAutoAdvanceIndicator(true);
      } else {
        setShowAutoAdvanceIndicator(false);
      }
    }}
    onEnded={() => {
      setShowAutoAdvanceIndicator(false);

      if (index < videos.length - 1) {
        setTimeout(() => {
          goToVideo(index + 1);
        }, 1500);
      } else if (currentPage < totalPages && !isLoadingMore) {
        fetchVideos(currentPage + 1, true);
      } else {
        alert('તમે બધા વીડિયો જોઈ લીધા છે!');
      }
    }}
    onPlay={() => {
      setCurrentVideoIndex(index);

      videoRefs.current.forEach((otherVideo, otherIndex) => {
        if (otherVideo && otherIndex !== index) {
          otherVideo.pause();
          otherVideo.currentTime = 0;
        }
      });
    }}
    onLoadedMetadata={() => {
      if (index === currentVideoIndex) {
        const currentVideo = videoRefs.current[index];

        if (currentVideo) {
          currentVideo.play().catch(error => {
            console.log(`Auto-play failed for video ${index + 1}:`, error);
          });
        }
      }
    }}
  />
</div>

             {/* Source text - Hidden on Mobile */}
             {isMounted && windowWidth > 768 && video.img_credit_txt && (
                <p style={{
                  fontSize: '12px',
                  margin: '5px 10px',
                  color: '#827f7f',
                  opacity: 0.8,
                  fontStyle: 'italic',
                  marginTop: '-5px',
                  marginLeft: '0px'
                }}>
                  <strong>સોર્સ:</strong> {video.img_credit_txt}
                </p>
              )}
            </div>
            </figure>
            </div>
            </div>

            {/* Video Info Overlay - Enhanced GSTV Style - Hidden on Mobile */}
            {isMounted && windowWidth > 768 && (
              <div
                className="video-info-overlay"
                style={{
                  position: 'absolute',
                  top: '88%',
                  left: '0',
                  right: '0',
                  padding: '10px',
                  color: 'black',
                  zIndex: 10
                }}>
                <h2
                  className="video-title"
                  style={{
                    fontSize: '18px',
                    margin: '0 0 8px 0',
                    fontFamily: "'Noto Sans Gujarati', sans-serif",
                    fontWeight: '600',
                    lineHeight: '1.3',
                    color: '#000',
                    textAlign: 'center'
                  }}>
                  {video.title}
                </h2>
              </div>
            )}

            {/* Action Buttons - GSTV Style Mobile Responsive */}
          <VideoActionButtons
  key={`${video.id}-${currentVideoIndex}`}   // ✅ FORCE RESET ON SCROLL
  videoId={video.id}
  videoSlug={video.slug}
  videoTitle={video.title}
  videohorizontal={Number(video.is_video_horizontal ?? 0)}
  likeCount={Number(video.like_count) || 0}
  likedByUser={parseInt(video.liked_by_user as any) === 1 ? 1 : 0}
  bookmark={Number(video.bookmark) || 0}   
  onLike={handleLikeVideo}
  onBookmark={handleBookmarkVideo}
  onShare={(platform) => handleShare(video, platform)}
  isBookmarking={bookmarkingVideoId === video.id}
/>
            
          </div>
        ))}
      </div>
        </div>
       
    </div>
</div>
   
     


    </div>
     {/* Animation */}
      <style jsx>{`
        @media (min-width: 1200px) and (max-width: 1400px) {
  .video-navigation-controls {
    right: 20.5% !important;
    top:45% !important;
  }

  .action-buttons {
    right: 20px !important;
  }
}
/* Prevent next video overlap */
.video-wrapper {
  height: 100vh !important;
  min-height: 100vh !important;
  max-height: 100vh !important;
  overflow: hidden !important;
}
@media (max-width: 768px) {
     .horizontal-video {
        object-fit: contain !important;
        background: #000 !important;
        max-width: unset !important;
      }

      /* Normal / Vertical video */
      .vertical-video {
        object-fit: contain !important;
        background: #000 !important;
        width: 100% !important;
        height: auto !important;
      }
    
  }


      `}</style>
      <style jsx global>{`
  @media (max-width: 768px) {
    #knowMoreBtn,
    .know-more-btn {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  }
`}</style>
    </>
  );
}
