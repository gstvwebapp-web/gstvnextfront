import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
   

    // Call the external API
    const response = await fetch(API_ENDPOINTS.TOP_NEWS, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'GSTV-NextJS-App/1.0',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      console.error('API Route: External API error:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    

    // Return the data in the expected format
    return NextResponse.json({
      status: 'success',
      message: 'Top news fetched successfully',
      topnews: data.topnews || [],
      livenews: data.livenews || []
    });

  } catch (error) {
    console.error('API Route: Error fetching top news:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch top news',
        error: error instanceof Error ? error.message : 'Unknown error',
        topnews: [],
        livenews: []
      },
      { status: 500 }
    );
  }
}
