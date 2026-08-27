import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching profile for user ID:', user_id);

    // Prepare request body for external API
    const requestBody = new URLSearchParams({
      user_id: user_id.toString()
    });

    // Call external API
    const response = await fetch(API_ENDPOINTS.VIEW_PROFILE, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'GSTV-NextJS-App/1.0',
      },
      body: requestBody,
    });

    const data = await response.json();
    console.log('🔍 View Profile API Response:', data);

    if (response.ok && data) {
      return NextResponse.json({
        success: true,
        data: data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch profile data'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('🔍 View Profile Error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred while fetching profile data' },
      { status: 500 }
    );
  }
}
