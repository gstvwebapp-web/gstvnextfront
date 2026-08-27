import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper function to fetch videos
async function fetchVideos(page: number, per_page: number) {
  console.log(`📹 Fetching top videos - Page: ${page}, Per Page: ${per_page}`);

  // Try POST method first
  try {
    const response = await fetch(API_ENDPOINTS.TOP_VIDEOS, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page,
        per_page
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`📹 POST: Received response with ${data.data?.length || 0} videos`);
      console.log(`📹 Pagination: Page ${data.current_page} of ${data.last_page}`);
      return data;
    }
  } catch (error) {
    console.log('📹 POST method failed, trying GET...');
  }

  // Fallback to GET method if POST fails
  const response = await fetch(`${API_ENDPOINTS.TOP_VIDEOS}?page=${page}&per_page=${per_page}`, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log(`📹 GET: Received response with ${data.data?.length || 0} videos`);
  return data;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const page = body.page || 1;
    const per_page = body.per_page || 10;

    const data = await fetchVideos(page, per_page);
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('API Route: Error fetching top videos:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch videos',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Keep GET method for backward compatibility
export async function GET(request: NextRequest) {
  try {
    const data = await fetchVideos(1, 10);
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('API Route: Error fetching top videos:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch videos',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
