import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function fetchVideosBySlug(slug: string, page: number, per_page: number) {
  console.log(`📹 Fetching videos by slug: ${slug} - Page: ${page}, Per Page: ${per_page}`);

  const response = await fetch(API_ENDPOINTS.TOP_VIDEOS_BY_SLUG, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ slug, page, per_page }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log(`📹 Received ${data.videos?.length || 0} videos for slug: ${slug}, page: ${page}`);
  return data;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, page = 1, per_page = 6 } = body;

    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    const data = await fetchVideosBySlug(slug, page, per_page);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Route: Error fetching videos by slug:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch videos',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
