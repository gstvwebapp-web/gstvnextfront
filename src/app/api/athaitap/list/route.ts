import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageNumber = 1 } = body;

    // Make request to external API
    const response = await fetch(API_ENDPOINTS.ATHAITAP_LIST, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        pageNumber: pageNumber
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json();

    // Return the data as received from the external API
    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Athaitap List API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch athaitap list',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// Handle GET requests (optional - for testing)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pageNumber = searchParams.get('pageNumber') || '1';

  try {
    const response = await fetch(API_ENDPOINTS.ATHAITAP_LIST, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        pageNumber: parseInt(pageNumber)
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Athaitap List API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch athaitap list',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
