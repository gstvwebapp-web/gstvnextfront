import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS, DEFAULT_API_PARAMS } from '@/constants/api';

/**
 * Web Stories List API Route
 * Handles fetching web stories with pagination
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';

    console.log(`[WebStories API] Fetching web stories for page: ${page}`);

    // Prepare form data for the request
    const formData = new URLSearchParams({
      ...DEFAULT_API_PARAMS,
      pageNumber: page
    });

    // Make request to external API
    const response = await fetch(API_ENDPOINTS.WEB_STORY_LIST, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: formData,
      cache: 'no-store', // Ensure fresh data
    });

    if (!response.ok) {
      console.error(`[WebStories API] External API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { 
          status: 'error',
          message: `Failed to fetch web stories: ${response.status} ${response.statusText}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[WebStories API] External API response:`, data);

    // Return the data in a consistent format
    return NextResponse.json({
      status: 'success',
      data: data,
      message: 'Web stories fetched successfully'
    });

  } catch (error) {
    console.error('[WebStories API] Error:', error);
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
    const { pageNumber = 1 } = body;

    console.log(`[WebStories API] POST - Fetching web stories for page: ${pageNumber}`);

    // Prepare form data for the request
    const formData = new URLSearchParams({
      ...DEFAULT_API_PARAMS,
      pageNumber: pageNumber.toString()
    });

    // Make request to external API
    const response = await fetch(API_ENDPOINTS.WEB_STORY_LIST, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: formData,
      cache: 'no-store', // Ensure fresh data
    });

    if (!response.ok) {
      console.error(`[WebStories API] External API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { 
          status: 'error',
          message: `Failed to fetch web stories: ${response.status} ${response.statusText}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[WebStories API] External API response:`, data);

    // Return the data in a consistent format
    return NextResponse.json({
      status: 'success',
      data: data,
      message: 'Web stories fetched successfully'
    });

  } catch (error) {
    console.error('[WebStories API] Error:', error);
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
