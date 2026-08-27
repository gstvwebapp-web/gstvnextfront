import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

export async function GET(request: NextRequest) {
  try {
    console.log('🏙️ Fetching cities list...');

    // Call external API
    const response = await fetch(API_ENDPOINTS.GET_ALL_CITY, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GSTV-NextJS-App/1.0',
      },
    });

    const data = await response.json();
    console.log('🏙️ Cities API Response:', data);

    if (response.ok && data) {
      return NextResponse.json({
        success: true,
        data: data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch cities data'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('🏙️ Cities API Error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred while fetching cities data' },
      { status: 500 }
    );
  }
}
