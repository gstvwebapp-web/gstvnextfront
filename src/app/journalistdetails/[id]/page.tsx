import { Metadata } from 'next';
import { API_ENDPOINTS, getGujaratImageUrlV2 } from '@/constants/api';
import JournalistClient from './JournalistClient';

interface JournalistDetail {
  id: number;
  userID: number;
  name: string;
  title: string;
  description: string;
  featureImage: string[] | string;
  video: string | null;
  video_status: number;
  city: string;
  adminid: number;
  agree_status: number;
  status: string;
  video_img: string | null;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  success: boolean;
  data: JournalistDetail;
}

// Parse feature images
const parseFeatureImages = (featureImageData: string[] | string): string[] => {
  try {
    if (Array.isArray(featureImageData)) return featureImageData;
    if (typeof featureImageData === 'string' && featureImageData.trim() !== '') {
      const parsed = JSON.parse(featureImageData);
      return Array.isArray(parsed) ? parsed : [];
    }
    return [];
  } catch (error) {
    return [];
  }
};

// Get image URL
const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return 'https://www.gstv.in/assets/images/news-default.png';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  return getGujaratImageUrlV2(imagePath);
};

// Get story image
const getStoryImage = (entry: JournalistDetail): string => {
  // 1) video_img
  if (entry.video_img && entry.video_img.trim() !== '') {
    return getImageUrl(entry.video_img);
  }

  // 2) featureImage first item
  const featureImages = parseFeatureImages(entry.featureImage);
  if (featureImages.length > 0 && featureImages[0]) {
    return getImageUrl(featureImages[0]);
  }

  // 3) fallback
  return 'https://www.gstv.in/assets/images/news-default.png';
};

// Fetch journalist data
async function fetchJournalistData(id: string): Promise<JournalistDetail | null> {
  try {
    const response = await fetch(API_ENDPOINTS.JOURNALIST_DETAILS, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        gujaratid: id
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data: ApiResponse = await response.json();

    if (!data.success || !data.data) {
      return null;
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching journalist details:', error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const entry = await fetchJournalistData(params.id);

  if (!entry) {
    return {
      title: 'Journalist Not Found | GSTV',
      description: 'The requested journalist story could not be found.',
    };
  }

  const storyImage = getStoryImage(entry);
  const cleanDescription = (entry.description || '')
    .replace(/<[^>]*>/g, '')
    .trim()
    .substring(0, 160);

  const url = `https://www.gstv.in/journalistdetails/${entry.id}`;

  return {
    title: `${entry.title} | GSTV News`,
    description: cleanDescription || entry.title,
    keywords: ['GSTV', 'journalist', 'student news', 'Gujarat news', entry.name, entry.city],
    authors: [{ name: entry.name || 'GSTV Journalist' }],
    openGraph: {
      title: entry.title,
      description: cleanDescription || entry.title,
      url: url,
      siteName: 'GSTV',
      images: [
        {
          url: storyImage,
          width: 1200,
          height: 630,
          alt: entry.title,
        },
      ],
      locale: 'gu_IN',
      type: 'article',
      publishedTime: entry.created_at,
      modifiedTime: entry.updated_at || entry.created_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: entry.title,
      description: cleanDescription || entry.title,
      images: [storyImage],
    },
    alternates: {
      canonical: url,
    },
  };
}

// Server component
export default async function JournalistDetailsPage({ params }: { params: { id: string } }) {
  const initialData = await fetchJournalistData(params.id);

  return <JournalistClient initialData={initialData} />;
}
