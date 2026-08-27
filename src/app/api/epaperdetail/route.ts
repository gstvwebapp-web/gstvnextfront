import { NextRequest, NextResponse } from 'next/server';
import { commonApiPost, API_ENDPOINTS } from '@/constants/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, date } = body;

    console.log('📰 Epaper Detail API Route: Request params:', { slug, date });

    if (!slug || !date) {
      return NextResponse.json(
        { error: 'Slug and date are required' },
        { status: 400 }
      );
    }

    const requestData = {
      slug: slug,
      date: date
    };

    console.log('📰 Epaper Detail API Route: Making external API call with params:', requestData);

    // Use v6 API endpoint as requested
    const response = await fetch(API_ENDPOINTS.EPAPER_DETAIL_V6, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    console.log('📰 Epaper Detail API Route: External API response status:', response.status);

    if (!response.ok) {
      console.error('📰 Epaper Detail API Route: External API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `External API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('📰 Epaper Detail API Route: External API response data:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('📰 Epaper Detail API Route: Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
