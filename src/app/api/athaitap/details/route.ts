import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID is required',
          message: 'Entry ID must be provided'
        },
        { status: 400 }
      );
    }

    // Make request to external API
    const response = await fetch(API_ENDPOINTS.ATHAITAP_DETAILS, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        id: id
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
    console.error('Athaitap Details API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch athaitap details',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// Handle GET requests (optional - for testing)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      {
        success: false,
        error: 'ID is required',
        message: 'Entry ID must be provided'
      },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(API_ENDPOINTS.ATHAITAP_DETAILS, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        id: parseInt(id)
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
    console.error('Athaitap Details API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch athaitap details',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
