import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

/**
 * Web Story Detail API Route
 * Handles fetching web story detail by slug
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'slug parameter is required' 
        },
        { status: 400 }
      );
    }

    console.log(`[WebStoryDetail API] Fetching web story detail for slug: ${slug}`);

    // Make request to external API
    const response = await fetch(`${API_ENDPOINTS.WEB_STORY_DETAIL}/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store', // Ensure fresh data
    });

    if (!response.ok) {
      console.error(`[WebStoryDetail API] External API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { 
          status: 'error',
          message: `Failed to fetch web story: ${response.status} ${response.statusText}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[WebStoryDetail API] External API response:`, data);

    // Return the data in a consistent format
    return NextResponse.json({
      status: 'success',
      data: data,
      message: 'Web story detail fetched successfully'
    });

  } catch (error) {
    console.error('[WebStoryDetail API] Error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'slug is required in request body' 
        },
        { status: 400 }
      );
    }

    console.log(`[WebStoryDetail API] POST - Fetching web story detail for slug: ${slug}`);

    // Make request to external API
    const response = await fetch(`${API_ENDPOINTS.WEB_STORY_DETAIL}/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store', // Ensure fresh data
    });

    if (!response.ok) {
      console.error(`[WebStoryDetail API] External API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { 
          status: 'error',
          message: `Failed to fetch web story: ${response.status} ${response.statusText}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[WebStoryDetail API] External API response:`, data);

    // Return the data in a consistent format
    return NextResponse.json({
      status: 'success',
      data: data,
      message: 'Web story detail fetched successfully'
    });

  } catch (error) {
    console.error('[WebStoryDetail API] Error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
