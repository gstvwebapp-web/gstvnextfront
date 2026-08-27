import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageNumber = '1', per_page = '8', epaper_cat } = body;

    console.log('📖 Magazine API Route: Request params:', { pageNumber, per_page, epaper_cat });

    const requestData: Record<string, string> = {
      pageNumber: pageNumber.toString(),
      per_page: per_page.toString()
    };
    if (epaper_cat) requestData.epaper_cat = String(epaper_cat);

    console.log('📖 Magazine API Route: Making external API call with params:', requestData);

    // Use the v8 magazine API endpoint
    const response = await fetch(API_ENDPOINTS.MAGAZINE, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    console.log('📖 Magazine API Route: External API response status:', response.status);

    if (!response.ok) {
      console.error('📖 Magazine API Route: External API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `External API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('📖 Magazine API Route: External API response data keys:', Object.keys(data));

    return NextResponse.json(data);
  } catch (error) {
    console.error('📖 Magazine API Route: Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
