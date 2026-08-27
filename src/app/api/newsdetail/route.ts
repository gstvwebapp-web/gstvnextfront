import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS, DEFAULT_API_PARAMS } from '@/constants/api';

export async function POST(request: NextRequest) {
  try {
    console.log('News Detail API Route: Processing POST request');

    const body = await request.json();
    const { slug, user_id = '1' } = body;

    console.log('News Detail API Route: Request body:', { slug, user_id });

    if (!slug) {
      return NextResponse.json(
        { error: 'slug is required' },
        { status: 400 }
      );
    }

    // Use the correct API endpoint with proper parameters
    const requestBody = new URLSearchParams();
    requestBody.append('device_id', DEFAULT_API_PARAMS.device_id);
    requestBody.append('pageNumber', DEFAULT_API_PARAMS.pageNumber.toString());
    requestBody.append('slug', slug);
    requestBody.append('user_id', user_id.toString());

    console.log('News Detail API Route: Request params:', Object.fromEntries(requestBody));

    const response = await fetch(API_ENDPOINTS.NEWS_DETAIL, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody,
    });

    console.log('News Detail API Route: External API response status:', response.status);

    if (!response.ok) {
      console.error('News Detail API Route: External API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `External API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('News Detail API Route: External API data received:', JSON.stringify(data, null, 2));

    // Transform the response to match our expected format
    const transformedData = {
      status: true,
      message: 'Success',
      data: data
    };

   

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('News Detail API Route: Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also support GET method for testing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const user_id = searchParams.get('user_id') || '1';

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
      body: JSON.stringify({ slug, user_id })
    }));

    return postResponse;

  } catch (error) {
    console.error('News Detail API Route (GET): Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
