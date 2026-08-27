import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS, DEFAULT_API_PARAMS } from '@/constants/api';

export async function POST(request: NextRequest) {
  try {
    console.log('News Next Content Web API Route: Processing POST request');

    const body = await request.json();
    const {
      slug,
      user_id = '',
      device_id = '',
      loadedSlugs = '',
      categoryIds = '',
      pageNumber = 1
    } = body;


    if (!slug) {
      return NextResponse.json(
        { error: 'slug is required' },
        { status: 400 }
      );
    }

    // Prepare the request body for the external API
    const requestBody = new URLSearchParams({
      slug: slug,
      user_id: user_id.toString(),
      device_id: device_id.toString(),
      loadedSlugs: loadedSlugs.toString(),
      categoryIds: categoryIds.toString(),
      pageNumber: pageNumber.toString()
    });

    console.log('📤 Forwarding to backend API:', API_ENDPOINTS.NEWS_NEXT_CONTENT_WEB);
    console.log('📦 Request params:', Object.fromEntries(requestBody));

    const response = await fetch(API_ENDPOINTS.NEWS_NEXT_CONTENT_WEB, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: requestBody,
    });

    console.log('📥 Backend API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend API error:', errorText);
      return NextResponse.json(
        { error: `API request failed: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ News Next Content Web API Route: Response data received');

    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ News Next Content Web API Route: Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Also support GET method for testing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const user_id = searchParams.get('user_id') || '';
    const device_id = searchParams.get('device_id') || '';
    const loadedSlugs = searchParams.get('loadedSlugs') || '';
    const categoryIds = searchParams.get('categoryIds') || '';
    const pageNumber = searchParams.get('pageNumber') || '1';

    if (!slug) {
      return NextResponse.json(
        { error: 'slug parameter is required' },
        { status: 400 }
      );
    }

    // Call the POST method internally
    const postResponse = await POST(new NextRequest(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, user_id, device_id, loadedSlugs, categoryIds, pageNumber })
    }));

    return postResponse;

  } catch (error) {
    console.error('News Next Content Web API Route (GET): Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
