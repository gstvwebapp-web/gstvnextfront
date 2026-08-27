export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

import { NextResponse } from 'next/server';
import { API_ENDPOINTS, MEDIA_BASE_URL } from '@/constants/api';

type VideoItem = {
  id: number;
  slug: string;
  title: string;
  description: string;
  videoURL?: string;
  featureImage?: string;
  created_at: string;
  updated_at: string;
  duration?: number;
  view_count?: number;
};

export async function GET(req: Request) {
  const BASE_URL = MEDIA_BASE_URL || 'https://www.gstv.in';

  try {
    // Fetch top videos
    const res = await fetch(API_ENDPOINTS.TOP_VIDEOS, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ limit: '500' }),
    });

    if (!res.ok) throw new Error('Failed to fetch videos data');

    const data = await res.json();
    const videos: VideoItem[] = Array.isArray(data) ? data : (data.data || data.videos || []);

    let urls = '';

    for (const video of videos) {
      if (!video.slug || !video.title) continue;

      const videoUrl = `${BASE_URL}/videos/${video.slug}`;
      const thumbnailUrl = video.featureImage
        ? getImageUrl(video.featureImage)
        : `${BASE_URL}/assets/images/gstv-logo-bg.png`;

      const duration = video.duration ? formatDuration(video.duration) : 'PT5M'; // Default 5 min
      const viewCount = video.view_count || 0;
      let publicationDate = new Date().toISOString();
      try {
        if (video.created_at) {
          const parsedDate = new Date(video.created_at);
          if (!isNaN(parsedDate.getTime())) {
            publicationDate = parsedDate.toISOString();
          }
        }
      } catch (e) {
        // fallback
      }

      urls += `
<url>
  <loc>${videoUrl}</loc>
  <video:video>
    <video:thumbnail_loc>${escapeXml(thumbnailUrl)}</video:thumbnail_loc>
    <video:title>${escapeXml(video.title)}</video:title>
    <video:description>${escapeXml(truncateDescription(video.description, 2048))}</video:description>
    <video:content_loc>${video.videoURL ? escapeXml(video.videoURL) : ''}</video:content_loc>
    <video:player_loc allow_embed="yes">${videoUrl}</video:player_loc>
    <video:duration>${getDurationSeconds(video.duration)}</video:duration>
    <video:publication_date>${publicationDate}</video:publication_date>
    <video:view_count>${viewCount}</video:view_count>
  </video:video>
</url>`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  } catch (e) {
    console.error('Video Sitemap error:', e);
    return new NextResponse('Sitemap error', { status: 500 });
  }
}

/**
 * Get full image URL
 */
function getImageUrl(imagePath: string): string {
  const MEDIA_BASE = 'https://staging.gstv.in';
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/')) return `${MEDIA_BASE}${imagePath}`;
  return `${MEDIA_BASE}/${imagePath}`;
}

/**
 * Format duration from seconds to ISO 8601 format
 * Example: 300 seconds -> PT5M
 */
function formatDuration(seconds?: number): string {
  if (!seconds) return 'PT5M';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  let duration = 'PT';
  if (hours > 0) duration += `${hours}H`;
  if (minutes > 0) duration += `${minutes}M`;
  if (secs > 0) duration += `${secs}S`;

  return duration || 'PT5M';
}

/**
 * Get duration in seconds (for fallback)
 */
function getDurationSeconds(duration?: number): number {
  return duration || 300; // Default 5 minutes (300 seconds)
}

/**
 * Truncate description to XML limit
 */
function truncateDescription(desc: string, maxLength: number): string {
  if (!desc) return 'Video content from GSTV';
  const cleaned = desc.replace(/<[^>]*>/g, ''); // Remove HTML tags
  if (cleaned.length > maxLength) {
    return cleaned.substring(0, maxLength - 3) + '...';
  }
  return cleaned;
}

/**
 * Escape special XML characters
 */
function escapeXml(unsafe?: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
