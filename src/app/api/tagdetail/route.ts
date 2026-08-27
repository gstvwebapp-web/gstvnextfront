import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

export async function POST(request: NextRequest) {
  try {
    console.log('Tag Detail API Route: Processing POST request');

    const body = await request.json();
    const { tag, pageNumber = '1', user_id = '22', device_id = '172.70.111.140' } = body;

    console.log('Tag Detail API Route: Request body:', { tag, pageNumber, user_id, device_id });

    if (!tag) {
      return NextResponse.json(
        { error: 'tag is required' },
        { status: 400 }
      );
    }

    // Use the correct API endpoint with proper parameters
    const requestBody = new URLSearchParams({
      tag: tag,
      pageNumber: pageNumber.toString(),
      user_id: user_id.toString(),
      device_id: device_id.toString()
    });

    console.log('Tag Detail API Route: Request params:', Object.fromEntries(requestBody));

    const response = await fetch(API_ENDPOINTS.TAG_DETAIL, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody,
    });

    console.log('Tag Detail API Route: External API response status:', response.status);

    if (!response.ok) {
      console.error('Tag Detail API Route: External API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `External API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Tag Detail API Route: External API data received:', JSON.stringify(data, null, 2));

    // Transform the response to match our expected format
    const transformedData = {
      status: true,
      message: 'Success',
      data: data
    };

    

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Tag Detail API Route: Error:', error);
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
    const tag = searchParams.get('tag');
    const pageNumber = searchParams.get('pageNumber') || '1';
    const user_id = searchParams.get('user_id') || '22';
    const device_id = searchParams.get('device_id') || '172.70.111.140';

    if (!tag) {
      return NextResponse.json(
        { error: 'tag parameter is required' },
        { status: 400 }
      );
    }

    // Call the POST method internally
    const postResponse = await POST(new NextRequest(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag, pageNumber, user_id, device_id })
    }));

    return postResponse;

  } catch (error) {
    console.error('Tag Detail API Route (GET): Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
