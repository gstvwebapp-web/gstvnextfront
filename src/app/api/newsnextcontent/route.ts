import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

export async function POST(request: NextRequest) {
  try {
    console.log('News Next Content API Route: Processing POST request');

    const body = await request.json();
    const {
      slug = '',
      user_id = '1',
      device_id = '2131232',
      loadedSlugs = '',
      categoryIds = ''
    } = body;

    console.log('News Next Content API Route: Request parameters:', {
      slug,
      user_id,
      device_id,
      loadedSlugs,
      categoryIds
    });

    // Prepare the request body for the external API
    const requestBody = new URLSearchParams({
      slug: slug.toString(),
      user_id: user_id.toString(),
      device_id: device_id.toString(),
      loadedSlugs: loadedSlugs.toString(),
      categoryIds: categoryIds.toString()
    });

    console.log('News Next Content API Route: Request body to external API:', requestBody.toString());

   
    // Resilient fetch with retries
    let response: Response | null = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        response = await fetch(API_ENDPOINTS.NEWS_NEXT_CONTENT, {
          method: 'POST',
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; GSTV-Bot/1.0)',
          },
          body: requestBody,
          signal: AbortSignal.timeout(8000),
        });

        if (response.ok) break;
      } catch (err) {
        console.warn(`News Next Content API Route: Attempt ${attempts} failed:`, err);
        if (attempts >= maxAttempts) throw err;
        await new Promise(r => setTimeout(r, 300 * attempts));
      }
    }

    if (!response || !response.ok) {
      return NextResponse.json(
        { error: `API request failed: ${response?.status || 'Unknown'}` },
        { status: response?.status || 500 }
      );
    }

    const data = await response.json();
    console.log('News Next Content API Route: Response data:', data);

    return NextResponse.json(data);

  } catch (error) {
    console.error('News Next Content API Route: Error:', error);
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
    const slug = searchParams.get('slug') || '';
    const user_id = searchParams.get('user_id') || '1';
    const device_id = searchParams.get('device_id') || '2131232';
    const loadedSlugs = searchParams.get('loadedSlugs') || '';
    const categoryIds = searchParams.get('categoryIds') || '';

    // Call the POST method internally
    const postResponse = await POST(new NextRequest(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, user_id, device_id, loadedSlugs, categoryIds })
    }));

    return postResponse;

  } catch (error) {
    console.error('News Next Content API Route (GET): Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
