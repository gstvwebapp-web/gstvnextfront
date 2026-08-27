import { API_ENDPOINTS, MEDIA_BASE_URL } from '@/constants/api';
import ClientVideoPage from './ClientVideoPage';
import type { Metadata } from 'next';

/* ✅ VERY IMPORTANT - ADD THIS */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string[] }> }
): Promise<Metadata> {

  const resolvedParams = await params;
  const slugArray = Array.isArray(resolvedParams.slug) ? resolvedParams.slug : [resolvedParams.slug];
  const slug = slugArray[slugArray.length - 1]; // Get the last segment as the video slug

  console.log('[Server Metadata] Generating metadata for slug:', slug);

  try {
    const res = await fetch(API_ENDPOINTS.VIDEODETAIL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
      cache: 'no-store',
      next: { 
        revalidate: 0,
        tags: [`video-${slug}`]
      },
      body: JSON.stringify({
        slug: 'videos',
        subslug: slug,
        pageNumber: 1,
        device_id: 'server',
        user_id: ''
      }),
    });

    if (!res.ok) {
      console.error('[Server Metadata] Video API fetch failed:', res.status, res.statusText);
      throw new Error('Failed to fetch video data');
    }

    const data = await res.json();
    const video = data?.videos?.data?.[0] || data?.data?.[0];

    if (!video) {
      console.error('[Server Metadata] No video found in API response for slug:', slug);
      return {
        title: 'Video Not Found',
        description: 'This video does not exist.',
        openGraph: {
          images: [`${MEDIA_BASE_URL}/default-og.jpg`],
        },
      };
    }

    console.log('[Server Metadata] Raw video data from API:', JSON.stringify({
      title: video.title,
      slug: video.slug,
      videoURL: video.videoURL,
      featureImage: video.featureImage,
      thumbnail: video.thumbnail,
      image: video.image,
      imageURL: video.imageURL
    }, null, 2));

    // FORCE: Construct video thumbnail URL aggressively
    let image = '';
    let imageSource = '';

    // Try to construct from videoURL first
    if (video.videoURL) {
      let videoUrl = String(video.videoURL).trim();
      
      // If it's already an image, use it
      if (videoUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
        image = videoUrl;
        imageSource = 'videoURL (already image)';
      } 
      // If it's a video file, convert to thumbnail
      else if (videoUrl.match(/\.(mp4|webm|mov|avi)$/i)) {
        // Remove extension and add _video_small.jpg
        image = videoUrl.replace(/\.(mp4|webm|mov|avi)$/i, '_video_small.jpg');
        imageSource = 'videoURL (converted to thumbnail)';
      }
      // If no extension but has path, try to add thumbnail
      else if (videoUrl.includes('/')) {
        image = videoUrl + '_video_small.jpg';
        imageSource = 'videoURL (added thumbnail suffix)';
      }
      
      console.log('[Server Metadata] Constructed from videoURL:', image);
    }
    
    // Try featureImage
    if (!image && video.featureImage) {
      image = String(video.featureImage).trim();
      imageSource = 'featureImage';
      console.log('[Server Metadata] Using featureImage:', image);
    }
    
    // Try thumbnail
    if (!image && video.thumbnail) {
      image = String(video.thumbnail).trim();
      imageSource = 'thumbnail';
      console.log('[Server Metadata] Using thumbnail:', image);
    }
    
    // Try imageURL
    if (!image && video.imageURL) {
      image = String(video.imageURL).trim();
      imageSource = 'imageURL';
      console.log('[Server Metadata] Using imageURL:', image);
    }
    
    // Try image field
    if (!image && video.image) {
      image = String(video.image).trim();
      imageSource = 'image';
      console.log('[Server Metadata] Using image field:', image);
    }
    
    // Make URL absolute
    if (image && !image.startsWith('http://') && !image.startsWith('https://')) {
      const cleanPath = image.startsWith('/') ? image : `/${image}`;
      image = `${MEDIA_BASE_URL}${cleanPath}`;
      console.log('[Server Metadata] Made absolute:', image);
    }
    
    // LAST RESORT: If still no image, use default
    if (!image || image === MEDIA_BASE_URL || image === `${MEDIA_BASE_URL}/`) {
      image = `${MEDIA_BASE_URL}/default-og.jpg`;
      imageSource = 'default (NO IMAGE DATA FROM API)';
      console.error('[Server Metadata] ⚠️⚠️⚠️ CRITICAL: No image found!');
      console.error('[Server Metadata] API returned:', JSON.stringify({
        videoURL: video.videoURL,
        featureImage: video.featureImage,
        thumbnail: video.thumbnail,
        imageURL: video.imageURL,
        image: video.image
      }));
    }

    console.log('[Server Metadata] ✅ Final og:image:', image);
    console.log('[Server Metadata] Image source:', imageSource);

    const metadata: Metadata = {
      title: video.title || video.metatitle || 'GSTV Video',
      description: video.metadesc || video.description || 'Watch this video on GSTV',
      alternates: {
        canonical: `${MEDIA_BASE_URL}/videos/${video.slug}`,
      },
      openGraph: {
        title: video.title || video.metatitle || 'GSTV Video',
        description: video.metadesc || video.description || 'Watch this video on GSTV',
        url: `${MEDIA_BASE_URL}/videos/${video.slug}`,
        siteName: 'GSTV',
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: video.title || 'GSTV Video',
          },
        ],
        type: 'video.other',
      },
      twitter: {
        card: 'summary_large_image',
        title: video.title || video.metatitle || 'GSTV Video',
        description: video.metadesc || video.description || 'Watch this video on GSTV',
        images: [image],
      },
    };

    console.log('[Server Metadata] Metadata generated successfully for:', video.title);
    return metadata;

  } catch (error) {
    console.error('[Server Metadata] Error generating metadata:', error);
    return {
      title: 'GSTV Videos',
      description: 'Watch latest GSTV videos.',
      openGraph: {
        images: [`${MEDIA_BASE_URL}/default-og.jpg`],
      },
    };
  }
}




export default function Page() {
  return <ClientVideoPage />;
}
